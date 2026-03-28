/**
 * Computes FCF & CAPEX analysis from cash flow statements.
 * Input: array of FMP cash-flow-statement objects (newest first).
 * Output: array sorted oldest-first with computed metrics.
 */
export function computeFCF(cashflowStatements) {
  const sorted = [...cashflowStatements].reverse(); // oldest first
  return sorted.map((cf, i) => {
    const revenue = cf.revenue || 0;
    const ocf = cf.operatingCashFlow || cf.netCashProvidedByOperatingActivities || 0;
    const capex = Math.abs(cf.capitalExpenditure || cf.investmentsInPropertyPlantAndEquipment || 0);
    const fcf = cf.freeCashFlow != null ? cf.freeCashFlow : (ocf - capex);
    const prevRevenue = i > 0 ? (sorted[i - 1].revenue || 0) : null;

    return {
      year: cf.fiscalYear || cf.calendarYear || cf.date?.slice(0, 4),
      date: cf.date,
      revenue,
      operatingCashFlow: ocf,
      capex,
      freeCashFlow: fcf,
      fcfMargin: revenue ? fcf / revenue : 0,
      capexToRevenue: revenue ? capex / revenue : 0,
      revenueYoYGrowth: prevRevenue ? (revenue - prevRevenue) / Math.abs(prevRevenue) : null,
    };
  });
}
