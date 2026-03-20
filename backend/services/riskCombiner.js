const SAFE_THRESHOLD = 30;
const SUSPICIOUS_THRESHOLD = 70;
const PHISHING_THRESHOLD = 70;

function combineRiskScores({ mlScore, vtResult, mxResult, authResult }) {
  // Convert each signal to 0-100
  const mlS = (mlScore || 0) * 100;
  const vtScore = vtResult ? Math.min(100, (vtResult.maliciousCount || 0) * 20) : 0;
  const domainScore = mxResult?.isBlacklisted ? 100 : 0;
  const authScore =
    (authResult?.hasSPF ? 0 : 34) +
    (authResult?.hasDKIM ? 0 : 33) +
    (authResult?.hasDMARC ? 0 : 33);

  // Weighted formula
  const finalScore = (mlS * 0.45) + (vtScore * 0.30) + (domainScore * 0.15) + (authScore * 0.10);
  return Math.round(finalScore); // integer 0-100
}

function generateThreatReasons({ mlScore, vtResult, mxResult, authResult }) {
  const reasons = [];
  if (vtResult?.maliciousCount > 0)
    reasons.push('Malicious URL detected by VirusTotal');
  if (!authResult?.hasSPF)
    reasons.push('Sender domain has no SPF authentication');
  if (!authResult?.hasDKIM)
    reasons.push('Sender domain has no DKIM authentication');
  if (!authResult?.hasDMARC)
    reasons.push('Sender domain has no DMARC policy');
  if (mlScore > 0.7)
    reasons.push('AI detected phishing language patterns');
  if (mxResult?.isBlacklisted)
    reasons.push('Sender domain is on known blacklists');
  return reasons;
}

module.exports = {
  combineRiskScores,
  generateThreatReasons,
  SAFE_THRESHOLD,
  SUSPICIOUS_THRESHOLD,
  PHISHING_THRESHOLD
};
