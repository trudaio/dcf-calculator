/**
 * DCF valuation model.
 *
 * @param {object} params
 * @param {number} params.baseFCF        - Starting FCF (most recent year)
 * @param {number} params.wacc           - Weighted average cost of capital (e.g. 0.09)
 * @param {number|number[]} params.growthRate - Constant rate or per-year array
 * @param {number} params.terminalGrowth - Long-term growth (e.g. 0.025)
 * @param {number} params.horizonYears   - Projection horizon (e.g. 10)
 * @param {number} params.sharesOutstanding
 * @param {number} params.currentPrice
 * @param {object} [params.fcfOverrides] - { "2026": 75000000000, ... }
 */
export function computeDCF({
  baseFCF,
  wacc,
  growthRate,
  terminalGrowth,
  horizonYears = 10,
  sharesOutstanding,
  currentPrice,
  fcfOverrides = {},
}) {
  const currentYear = new Date().getFullYear();
  const timeline = [];
  let cumulativePV = 0;

  for (let i = 1; i <= horizonYears; i++) {
    const year = currentYear + i;
    const rate = Array.isArray(growthRate) ? (growthRate[i - 1] ?? growthRate[growthRate.length - 1]) : growthRate;
    const prevFCF = i === 1 ? baseFCF : timeline[i - 2].projectedFCF;
    let projectedFCF = prevFCF * (1 + rate);

    // Apply override if provided (use != null so an explicit 0 is honored)
    if (fcfOverrides[String(year)] != null) {
      projectedFCF = fcfOverrides[String(year)];
    }

    const discountFactor = 1 / Math.pow(1 + wacc, i);
    const presentValue = projectedFCF * discountFactor;
    cumulativePV += presentValue;

    timeline.push({
      year,
      growthRate: rate,
      projectedFCF,
      discountFactor,
      presentValue,
    });
  }

  // Terminal value (Gordon Growth Model).
  // Guard against wacc <= terminalGrowth, which makes the formula blow up
  // (zero/negative denominator → nonsensical or infinite valuation).
  const lastFCF = timeline[timeline.length - 1].projectedFCF;
  const spread = wacc - terminalGrowth;
  const terminalValue = spread > 0 ? (lastFCF * (1 + terminalGrowth)) / spread : 0;
  const pvTerminalValue = terminalValue / Math.pow(1 + wacc, horizonYears);

  const equityValue = cumulativePV + pvTerminalValue;
  const fairValuePerShare = sharesOutstanding ? equityValue / sharesOutstanding : 0;
  const upsidePercent = currentPrice ? (fairValuePerShare - currentPrice) / currentPrice : 0;

  return {
    timeline,
    cumulativePVofFCF: cumulativePV,
    terminalValue,
    pvTerminalValue,
    equityValue,
    fairValuePerShare,
    currentPrice,
    upsidePercent,
  };
}
