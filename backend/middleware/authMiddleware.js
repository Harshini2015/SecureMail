const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { User } = require('../models/index');
require('dotenv').config();

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired' });
        }
        return res.status(403).json({ success: false, error: 'Invalid token' });
    }
};

// Rate limiter for login attempts: 5 per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { success: false, error: 'Too many attempts. Try again in 30 minutes' }, // User specifies 30 min lock
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { verifyToken, loginLimiter };