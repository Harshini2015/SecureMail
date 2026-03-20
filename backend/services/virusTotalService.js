const axios = require('axios');
const crypto = require('crypto');
const { ThreatLog } = require('../models');

const VT_KEY = process.env.VIRUSTOTAL_API_KEY;
const BASE = 'https://www.virustotal.com/api/v3';

// Scan a single URL through VirusTotal
async function scanUrl(url) {
  try {
    // TODO: ThreatLog model missing urlHash
    /*
    const urlHash = crypto.createHash('md5').update(url).digest('hex');
    const cached = await ThreatLog.findOne({
      where: { urlHash },
      order: [['createdAt', 'DESC']]
    });
    if (cached) {
      const ageHours = (Date.now() - new Date(cached.createdAt)) / 36e5;
      if (ageHours < 24) return cached.result;
    }
    */

    // Step 1: Submit URL for analysis
    const submitRes = await axios.post(
      `${BASE}/urls`,
      new URLSearchParams({ url }),
      { headers: { 'x-apikey': VT_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const analysisId = submitRes.data.data.id;

    // Step 2: Poll until completed (max 10 retries, 2s apart)
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await axios.get(`${BASE}/analyses/${analysisId}`, {
        headers: { 'x-apikey': VT_KEY }
      });
      const stats = pollRes.data.data.attributes;
      if (stats.status === 'completed') {
        const s = stats.stats;
        const result = {
          malicious: s.malicious,
          suspicious: s.suspicious,
          harmless: s.harmless,
          verdict: s.malicious > 0 ? 'malicious' : s.suspicious > 0 ? 'suspicious' : 'clean'
        };
        // await ThreatLog.create({ urlHash, url, result });
        return result;
      }
    }
    return null; // timed out
  } catch (err) {
    if (err.response?.status === 429) {
      await new Promise(r => setTimeout(r, 60000));
      return scanUrl(url); // retry once
    }
    console.error('VT error:', err.message);
    return null; // never crash the pipeline
  }
}

// Extract all URLs from email body
function extractUrls(emailBody) {
  const matches = emailBody.match(/https?:\/\/[^\s"'<>]+/g) || [];
  return [...new Set(matches)]; // unique URLs only
}

// Analyze all URLs in an email body
async function analyzeEmailUrls(emailBody) {
  const urls = extractUrls(emailBody);
  let maliciousCount = 0, suspiciousCount = 0, mostDangerousUrl = null;

  for (const url of urls) {
    await new Promise(r => setTimeout(r, 250)); // respect rate limit
    const result = await scanUrl(url);
    if (!result) continue;
    if (result.malicious > 0) {
      maliciousCount += result.malicious;
      mostDangerousUrl = url;
    }
    if (result.suspicious > 0) suspiciousCount += result.suspicious;
  }

  return { totalUrlsScanned: urls.length, maliciousCount, suspiciousCount, mostDangerousUrl };
}

module.exports = { scanUrl, extractUrls, analyzeEmailUrls };
