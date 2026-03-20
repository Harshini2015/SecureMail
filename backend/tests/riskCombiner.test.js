const { combineRiskScores } = require('../services/riskCombiner');

describe('combineRiskScores', () => {
  const cleanAuth = { hasSPF: true, hasDKIM: true, hasDMARC: true };
  const noAuth = { hasSPF: false, hasDKIM: false, hasDMARC: false };

  test('all signals clean → score < 30', () => {
    const score = combineRiskScores({
      mlScore: 0.1,
      vtResult: { maliciousCount: 0 },
      mxResult: { isBlacklisted: false },
      authResult: cleanAuth
    });
    expect(score).toBeLessThan(30);
  });

  test('VT malicious + no SPF → score > 70', () => {
    const score = combineRiskScores({
      mlScore: 0.85,
      vtResult: { maliciousCount: 4 },
      mxResult: { isBlacklisted: false },
      authResult: noAuth
    });
    expect(score).toBeGreaterThan(70);
  });

  test('only ML high → score in 30-70 range', () => {
    const score = combineRiskScores({
      mlScore: 0.75,
      vtResult: { maliciousCount: 0 },
      mxResult: { isBlacklisted: false },
      authResult: cleanAuth
    });
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThanOrEqual(70);
  });

  test('null vtResult → valid score without crashing', () => {
    const score = combineRiskScores({
      mlScore: 0.5,
      vtResult: null,
      mxResult: { isBlacklisted: false },
      authResult: cleanAuth
    });
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
