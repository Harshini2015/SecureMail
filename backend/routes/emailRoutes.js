const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  ingestEmail,
  getEmails,
  getEmailById,
  deleteEmail,
  markSafe
} = require('../controllers/emailController');

// All routes protected
router.post('/ingest', authMiddleware, ingestEmail);
router.get('/', authMiddleware, getEmails);
router.get('/:id', authMiddleware, getEmailById);
router.delete('/:id', authMiddleware, deleteEmail);
router.patch('/:id/mark-safe', authMiddleware, markSafe);

module.exports = router;
