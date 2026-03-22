const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models/index');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

// Helper — sign tokens
const signAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const signRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

// Password complexity regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+\-=[\]{}|;:,.<>?]{8,64}$/;

// POST /api/auth/register
const register = [
    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .custom((value) => {
            const domain = value.split('@')[1];
            if (!domain || !domain.includes('.')) {
                throw new Error('Invalid email format');
            }
            return true;
        }),
    body('password')
        .matches(passwordRegex)
        .withMessage('Password must be 8-64 chars, include uppercase, lowercase, number, and special character.')
        .custom((value, { req }) => {
            if (value.includes(' ')) throw new Error('Password must not contain spaces');
            const username = req.body.email.split('@')[0];
            if (value.toLowerCase().includes(username.toLowerCase())) {
                throw new Error('Password must not contain the email username');
            }
            return true;
        }),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        try {
            const existing = await User.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({ success: false, error: 'Email already registered' });
            }

            const user = await User.create({ email, passwordHash: password });

            return res.status(201).json({
                success: true,
                message: 'User registered successfully'
            });

        } catch (err) {
            console.error('Register error:', err.message);
            return res.status(500).json({ success: false, error: 'Server error' });
        }
    }
];

// POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            return res.status(403).json({ success: false, error: 'Too many attempts. Try again in 30 minutes' });
        }

        const match = await user.comparePassword(password);
        if (!match) {
            // Update login attempts
            user.login_attempts += 1;
            if (user.login_attempts >= 5) {
                user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                user.login_attempts = 0; // Reset after lock
            }
            await user.save();
            return res.status(401).json({ success: false, error: 'Incorrect password' });
        }

        // Reset attempts on success
        user.login_attempts = 0;
        user.locked_until = null;
        user.last_login = new Date();
        await user.save();

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        // Store refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            success: true,
            accessToken,
            user: { id: user.id, email: user.email }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

// POST /api/auth/logout
const logout = (req, res) => {
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ success: false, error: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const accessToken = signAccessToken(user);
        return res.status(200).json({ success: true, accessToken });
    } catch (err) {
        return res.status(403).json({ success: false, error: 'Invalid or expired refresh token' });
    }
};

// GET /api/auth/me
const me = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            user: { id: user.id, email: user.email, is_verified: user.is_verified, last_login: user.last_login }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Return success anyway to prevent email enumeration
            return res.status(200).json({ success: true, message: 'If that email exists, a reset code has been sent.' });
        }

        const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        console.log(`\n[FORGOT PASSWORD] Reset Token for ${email}: ${token}\n`);

        return res.status(200).json({ success: true, message: 'If that email exists, a reset code has been sent.' });
    } catch (err) {
        console.error('ForgotPassword error:', err.message);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

// POST /api/auth/reset-password
const resetPassword = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
        .matches(passwordRegex)
        .withMessage('Password must be 8-64 chars, include uppercase, lowercase, number, and special character.')
        .custom((value, { req }) => {
            if (value.includes(' ')) throw new Error('Password must not contain spaces');
            return true;
        }),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: errors.array()[0].msg });
        }

        const { email, token, password } = req.body;

        try {
            const user = await User.findOne({ where: { email, resetToken: token } });
            if (!user || user.resetTokenExpiry < new Date()) {
                return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
            }

            user.passwordHash = await bcrypt.hash(password, 12);
            user.resetToken = null;
            user.resetTokenExpiry = null;
            user.login_attempts = 0;
            user.locked_until = null;
            await user.save();

            return res.status(200).json({ success: true, message: 'Password reset successful' });
        } catch (err) {
            console.error('ResetPassword error:', err.message);
            return res.status(500).json({ success: false, error: 'Server error' });
        }
    }
];

module.exports = { register, login, logout, refresh, me, forgotPassword, resetPassword };