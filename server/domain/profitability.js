/**
 * Computes profitability metrics from income statements.
 * Input: array of FMP income-statement objects (newest first).
 * Output: array sorted oldest-first.
 */
export function computeProfitability(incomeStatements) {
  const sorted = [...incomeStatements].reverse();
  return sorted.map((is, i) => {
    const revenue = is.revenue || 0;
    const grossProfit = is.grossProfit || 0;
    const operatingIncome = is.operatingIncome || 0;
    const netIncome = is.netIncome || 0;
    const prevRevenue = i > 0 ? (sorted[i - 1].revenue || 0) : null;

    return {
      year: is.calendarYear || is.date?.slice(0, 4),
      date: is.date,
      revenue,
      grossProfit,
      operatingIncome,
      netIncome,
      grossMargin: revenue ? grossProfit / revenue : 0,
      operatingMargin: revenue ? operatingIncome / revenue : 0,
      netMargin: revenue ? netIncome / revenue : 0,
      revenueYoYGrowth: prevRevenue ? (revenue - prevRevenue) / Math.abs(prevRevenue) : null,
    };
  });
}
