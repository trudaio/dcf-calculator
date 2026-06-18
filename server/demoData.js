/**
 * Demo data provider.
 *
 * When no FMP_API_KEY is configured (or it is set to "demo"), the dataProvider
 * falls back to these realistic, self-contained fixtures so the dashboard can be
 * run, previewed, and demoed without any external API access or rate limits.
 *
 * The shapes here mirror the FMP `/stable/` API responses the real provider returns.
 */

// Approximate, illustrative fundamentals for a handful of well-known large caps.
// Figures are rounded and meant for demonstration — not investment advice.
const COMPANIES = {
  AAPL: { name: 'Apple Inc.', price: 228.52, baseRevenue: 391_035e6, revGrowth: 0.06, grossMargin: 0.46, opMargin: 0.315, netMargin: 0.252, shares: 15_040e6, fcfMargin: 0.265, capexRatio: 0.028, peFwd: 29.5 },
  MSFT: { name: 'Microsoft Corporation', price: 462.10, baseRevenue: 245_122e6, revGrowth: 0.14, grossMargin: 0.695, opMargin: 0.448, netMargin: 0.36, shares: 7_430e6, fcfMargin: 0.30, capexRatio: 0.18, peFwd: 34.0 },
  NVDA: { name: 'NVIDIA Corporation', price: 131.26, baseRevenue: 130_497e6, revGrowth: 0.55, grossMargin: 0.75, opMargin: 0.62, netMargin: 0.55, shares: 24_500e6, fcfMargin: 0.46, capexRatio: 0.02, peFwd: 38.0 },
  GOOGL: { name: 'Alphabet Inc.', price: 178.35, baseRevenue: 350_018e6, revGrowth: 0.13, grossMargin: 0.58, opMargin: 0.32, netMargin: 0.28, shares: 12_200e6, fcfMargin: 0.22, capexRatio: 0.15, peFwd: 24.0 },
  AMZN: { name: 'Amazon.com, Inc.', price: 219.39, baseRevenue: 637_959e6, revGrowth: 0.11, grossMargin: 0.49, opMargin: 0.108, netMargin: 0.092, shares: 10_600e6, fcfMargin: 0.06, capexRatio: 0.13, peFwd: 36.0 },
};

const DEFAULT_PARAMS = {
  name: null, price: 100.0, baseRevenue: 50_000e6, revGrowth: 0.08, grossMargin: 0.45,
  opMargin: 0.20, netMargin: 0.15, shares: 1_000e6, fcfMargin: 0.14, capexRatio: 0.05, peFwd: 22.0,
};

const LATEST_FISCAL_YEAR = new Date().getFullYear() - 1;
const YEARS = 5;

function paramsFor(ticker) {
  const sym = ticker.toUpperCase();
  const base = COMPANIES[sym] || DEFAULT_PARAMS;
  return { ...DEFAULT_PARAMS, ...base, name: base.name || `${sym} Demo Corp.` };
}

// Build YEARS rows, newest-first, scaling revenue backwards by the growth rate.
function buildYears(p) {
  const rows = [];
  for (let i = 0; i < YEARS; i++) {
    const fiscalYear = LATEST_FISCAL_YEAR - i;
    const revenue = Math.round(p.baseRevenue / Math.pow(1 + p.revGrowth, i));
    rows.push({ i, fiscalYear, revenue });
  }
  return rows;
}

export function getQuote(ticker) {
  const p = paramsFor(ticker);
  const sym = ticker.toUpperCase();
  return {
    symbol: sym,
    name: p.name,
    price: p.price,
    marketCap: Math.round(p.price * p.shares),
    changePercentage: 0.42,
    volume: 25_000_000,
  };
}

export function getProfile(ticker) {
  const p = paramsFor(ticker);
  const sym = ticker.toUpperCase();
  return {
    symbol: sym,
    companyName: p.name,
    price: p.price,
    marketCap: Math.round(p.price * p.shares),
    currency: 'USD',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    description: `${p.name} is a demo company used to preview the dashboard without a live API key.`,
  };
}

export function getFinancials(ticker, limit = YEARS) {
  const p = paramsFor(ticker);
  return buildYears(p).slice(0, limit).map(({ fiscalYear, revenue }) => {
    const grossProfit = Math.round(revenue * p.grossMargin);
    const operatingIncome = Math.round(revenue * p.opMargin);
    const netIncome = Math.round(revenue * p.netMargin);
    const epsdiluted = +(netIncome / p.shares).toFixed(2);
    return {
      date: `${fiscalYear}-09-28`,
      symbol: ticker.toUpperCase(),
      fiscalYear: String(fiscalYear),
      calendarYear: String(fiscalYear),
      revenue,
      grossProfit,
      operatingIncome,
      netIncome,
      eps: epsdiluted,
      epsdiluted,
      weightedAverageShsOut: Math.round(p.shares),
      weightedAverageShsOutDil: Math.round(p.shares),
    };
  });
}

export function getCashflow(ticker, limit = YEARS) {
  const p = paramsFor(ticker);
  return buildYears(p).slice(0, limit).map(({ fiscalYear, revenue }) => {
    const freeCashFlow = Math.round(revenue * p.fcfMargin);
    const capitalExpenditure = -Math.round(revenue * p.capexRatio);
    const operatingCashFlow = freeCashFlow - capitalExpenditure;
    return {
      date: `${fiscalYear}-09-28`,
      symbol: ticker.toUpperCase(),
      fiscalYear: String(fiscalYear),
      calendarYear: String(fiscalYear),
      revenue,
      operatingCashFlow,
      netCashProvidedByOperatingActivities: operatingCashFlow,
      capitalExpenditure,
      freeCashFlow,
    };
  });
}

export function getKeyMetrics(ticker, limit = 1) {
  const p = paramsFor(ticker);
  return buildYears(p).slice(0, limit).map(({ fiscalYear, revenue }) => ({
    symbol: ticker.toUpperCase(),
    fiscalYear: String(fiscalYear),
    freeCashFlowYield: +(p.fcfMargin * revenue / (p.price * p.shares)).toFixed(4),
    returnOnEquity: 0.35,
  }));
}

export function getRatios(ticker, limit = 1) {
  const p = paramsFor(ticker);
  return buildYears(p).slice(0, limit).map(({ fiscalYear }) => ({
    symbol: ticker.toUpperCase(),
    fiscalYear: String(fiscalYear),
    priceEarningsRatio: p.peFwd,
    priceToFreeCashFlowsRatio: +(1 / (p.fcfMargin || 0.1)).toFixed(1),
  }));
}

export function getEstimates(ticker, limit = YEARS) {
  const p = paramsFor(ticker);
  const out = [];
  for (let i = 1; i <= limit; i++) {
    const year = LATEST_FISCAL_YEAR + i;
    const revenue = Math.round(p.baseRevenue * Math.pow(1 + p.revGrowth, i));
    out.push({
      symbol: ticker.toUpperCase(),
      date: `${year}-09-28`,
      estimatedRevenueAvg: revenue,
      estimatedNetIncomeAvg: Math.round(revenue * p.netMargin),
      estimatedEpsAvg: +(revenue * p.netMargin / p.shares).toFixed(2),
    });
  }
  return out;
}
