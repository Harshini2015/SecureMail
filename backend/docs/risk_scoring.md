# SecureMail — Risk Scoring

## Formula
```
finalScore = (mlScore×0.45) + (vtScore×0.30) + (domainScore×0.15) + (authScore×0.10)
```
All inputs converted to 0–100 before applying weights. Output is integer 0–100.

## Score Conversions
| Signal | Conversion |
|---|---|
| mlScore | mlScore × 100 |
| vtScore | Math.min(100, maliciousCount × 20) |
| domainScore | isBlacklisted ? 100 : 0 |
| authScore | (hasSPF?0:34) + (hasDKIM?0:33) + (hasDMARC?0:33) |

## Thresholds
| Range | Category | Action |
|---|---|---|
| 0 – 29 | Safe | Delivered normally |
| 30 – 69 | Suspicious | Flagged, shown with warning |
| 70 – 100 | Phishing | isBlocked=true, warning page shown |

## Worked Examples

### Example 1 — Safe Email (score: 12)
- mlScore: 0.10 → 10 × 0.45 = 4.5
- vtScore: 0 malicious → 0 × 0.30 = 0
- domainScore: not blacklisted → 0 × 0.15 = 0
- authScore: SPF+DKIM+DMARC all present → 0 × 0.10 = 0
- **finalScore = 5 → Safe ✅**

### Example 2 — Suspicious Email (score: 48)
- mlScore: 0.60 → 60 × 0.45 = 27
- vtScore: 0 malicious → 0 × 0.30 = 0
- domainScore: not blacklisted → 0 × 0.15 = 0
- authScore: missing DKIM+DMARC → 66 × 0.10 = 6.6
- **finalScore = 34 → Suspicious ⚠️**

### Example 3 — Phishing Email (score: 88)
- mlScore: 0.90 → 90 × 0.45 = 40.5
- vtScore: 3 malicious URLs → 60 × 0.30 = 18
- domainScore: blacklisted → 100 × 0.15 = 15
- authScore: no SPF/DKIM/DMARC → 100 × 0.10 = 10
- **finalScore = 84 → Phishing 🚨**
