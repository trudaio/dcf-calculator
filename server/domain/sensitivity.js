/**
 * Sensitivity analysis: EPS CAGR scenarios × Terminal P/E scenarios.
 *
 * @param {object} params
 * @param {number} params.currentPrice
 * @param {number} params.currentEPS
 * @param {number[]} params.epsCagrScenarios  - e.g. [0.08, 0.10, 0.13, 0.16, 0.19]
 * @param {number[]} params.peScenarios        - e.g. [18, 20, 23, 26, 30]
 * @param {number} params.horizonYears         - e.g. 10
 */
export function computeSensitivity({
  currentPrice,
  currentEPS,
  epsCagrScenarios = [0.08, 0.10, 0.13, 0.16, 0.19],
  peScenarios = [18, 20, 23, 26, 30],
  horizonYears = 10,
}) {
  const rows = epsCagrScenarios.map((cagr) => {
    const cells = peScenarios.map((pe) => {
      const terminalEPS = currentEPS * Math.pow(1 + cagr, horizonYears);
      const terminalPrice = terminalEPS * pe;
      const annualizedReturn = Math.pow(terminalPrice / currentPrice, 1 / horizonYears) - 1;

      return {
        cagr,
        pe,
        terminalEPS,
        terminalPrice,
        annualizedReturn,
      };
    });

    return { cagr, cells };
  });

  return {
    epsCagrScenarios,
    peScenarios,
    horizonYears,
    currentPrice,
    currentEPS,
    rows,
  };
}
