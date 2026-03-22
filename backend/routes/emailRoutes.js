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
router.post('/ingest', authMiddleware.verifyToken, ingestEmail);
router.get('/', authMiddleware.verifyToken, getEmails);
router.get('/:id', authMiddleware.verifyToken, getEmailById);
router.delete('/:id', authMiddleware.verifyToken, deleteEmail);
router.patch('/:id/mark-safe', authMiddleware.verifyToken, markSafe);

module.exports = router;
