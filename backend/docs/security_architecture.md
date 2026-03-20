# SecureMail — Security Architecture

## Pipeline Overview
Every incoming email passes through a 4-stage analysis pipeline before reaching the inbox.

1. **ML Service (Geetha)** — XGBoost model scores email text → mlScore (0.0–1.0)
2. **VirusTotal** — all URLs in body scanned for malware → maliciousCount
3. **MXToolbox** — sender domain checked against blacklists → isBlacklisted
4. **Email Auth (DNS)** — SPF, DKIM, DMARC checked via dns.resolveTxt()
5. **Risk Combiner** — all signals merged into finalScore (0–100) → category assigned

## Each API's Role

| API | What it checks | Why it matters |
|---|---|---|
| VirusTotal v3 | URLs inside email body | Phishing emails almost always contain malicious links |
| MXToolbox | Sender domain blacklist | Known spam/phishing domains are pre-listed |
| DNS (built-in) | SPF, DKIM, DMARC records | Legitimate senders always have these configured |
| ML Service | Email text patterns | Catches social engineering even without bad URLs |

## Weighting Rationale
- **ML = 45%** — Primary detector, trained on real phishing data, most reliable signal
- **VT = 30%** — Direct evidence of malicious URLs, very high precision
- **Domain = 15%** — Blacklists are reliable but not always up to date
- **Auth = 10%** — Missing auth is suspicious but not conclusive alone

## File Structure
```
backend/services/
├── virusTotalService.js    → URL scanning + caching
├── mxToolboxService.js     → Domain blacklist check
├── emailAuthService.js     → SPF/DKIM/DMARC via DNS
└── riskCombiner.js         → Weighted score + threat reasons
```
