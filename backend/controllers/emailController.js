const axios = require('axios');
const { Email, ThreatLog } = require('../models/index');
require('dotenv').config();

// ── Mock riskCombiner (until Monika's module is ready) ──
const mockRiskCombiner = () => ({ score: 10, reasons: [] });

// ── Call ML service (until Geetha's service is ready) ──
const callML = async (subject, body) => {
  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      subject,
      body
    });
    return response.data; // { risk_score, confidence }
  } catch (err) {
    console.warn('ML service unavailable, defaulting to 0');
    return { risk_score: 0, confidence: 0.0 };
  }
};

// ── Determine category from risk score ──
const determineCategory = (riskScore, subject) => {
  if (riskScore >= 75) return 'Phishing';
  if (riskScore >= 50) return 'Spam';
  const lower = (subject || '').toLowerCase();
  if (lower.includes('job') || lower.includes('hiring') || lower.includes('career')) return 'Jobs';
  if (lower.includes('offer') || lower.includes('deal') || lower.includes('sale')) return 'Promotions';
  return 'Primary';
};

// ────────────────────────────────────────
// POST /api/emails/ingest
// ────────────────────────────────────────
const ingestEmail = async (req, res) => {
  const { sender, subject, body } = req.body;

  if (!sender || !subject || !body) {
    return res.status(422).json({ message: 'sender, subject and body are required' });
  }

  try {
    const senderDomain = sender.includes('@') ? sender.split('@')[1] : sender;

    // Call ML service
    const mlData = await callML(subject, body);
    const mlScore = mlData.risk_score || 0;
    const mlConfidence = mlData.confidence || 0.0;

    // Call risk combiner (mock for now)
    const riskData = mockRiskCombiner();
    const finalScore = Math.max(mlScore, riskData.score);

    const category = determineCategory(finalScore, subject);
    const isBlocked = finalScore >= 75;
    const threatReasons = riskData.reasons || [];

    // Save Email
    const email = await Email.create({
      userId: req.user.id,
      sender,
      senderDomain,
      subject,
      body,
      category,
      riskScore: finalScore,
      isBlocked,
      threatReasons,
      mlConfidence,
      vtMaliciousCount: 0,
      spfPass: false,
      dkimPass: false,
      dmarcPass: false,
      receivedAt: new Date()
    });

    // Save ThreatLog
    await ThreatLog.create({
      emailId: email.id,
      mlResult: mlData,
      vtResult: {},
      mxResult: {},
      authResult: {},
      finalScore
    });

    return res.status(201).json(email);

  } catch (err) {
    console.error('ingestEmail error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ────────────────────────────────────────
// GET /api/emails
// ────────────────────────────────────────
const getEmails = async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = { userId: req.user.id };
  if (category) where.category = category;

  try {
    const emails = await Email.findAll({
      where,
      attributes: ['id', 'sender', 'senderDomain', 'subject', 'category',
                   'riskScore', 'isBlocked', 'receivedAt'],
      order: [['receivedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return res.status(200).json(emails);

  } catch (err) {
    console.error('getEmails error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ────────────────────────────────────────
// GET /api/emails/:id
// ────────────────────────────────────────
const getEmailById = async (req, res) => {
  try {
    const email = await Email.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    return res.status(200).json(email);

  } catch (err) {
    console.error('getEmailById error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ────────────────────────────────────────
// DELETE /api/emails/:id
// ────────────────────────────────────────
const deleteEmail = async (req, res) => {
  try {
    const email = await Email.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    await email.destroy();
    return res.status(200).json({ message: 'Email deleted' });

  } catch (err) {
    console.error('deleteEmail error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ────────────────────────────────────────
// PATCH /api/emails/:id/mark-safe
// ────────────────────────────────────────
const markSafe = async (req, res) => {
  try {
    const email = await Email.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    email.isBlocked = false;
    await email.save();

    return res.status(200).json(email);

  } catch (err) {
    console.error('markSafe error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { ingestEmail, getEmails, getEmailById, deleteEmail, markSafe };
