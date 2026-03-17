const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models/index');
require('dotenv').config();

// Helper — sign JWT
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /api/auth/register
const register = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check duplicate
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Create user — beforeCreate hook hashes the password
      const user = await User.create({ email, passwordHash: password });

      const token = signToken(user);

      return res.status(201).json({
        token,
        user: { id: user.id, email: user.email }
      });

    } catch (err) {
      console.error('Register error:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
  }
];

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ message: 'Email and password required' });
  }

  try {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };