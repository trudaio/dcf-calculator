import * as dp from './dataProvider.js';
import { computeFCF } from './domain/fcfAnalysis.js';
import { computeProfitability } from './domain/profitability.js';
import { computeDCF } from './domain/dcfModel.js';
import { computeSensitivity } from './domain/sensitivity.js';
import { computePeers } from './domain/peers.js';

const DEFAULT_SETTINGS = {
  wacc: 0.09,
  growthRate: 0.10,
  terminalGrowth: 0.025,
  horizonYears: 10,
  sensitivity: {
    epsCagrScenarios: [0.08, 0.10, 0.13, 0.16, 0.19],
    peScenarios: [18, 20, 23, 26, 30],
    horizonYears: 10,
  },
  peers: [],
};

/**
 * Build full analysis context for a ticker.
 */
export async function buildAnalysisContext(ticker, settings = {}, overrides = {}) {
  const cfg = { ...DEFAULT_SETTINGS, ...settings };
  const sensCfg = { ...DEFAULT_SETTINGS.sensitivity, ...(settings.sensitivity || {}) };

  // Fetch data sequentially to avoid FMP rate limits on free tier
  const quote = await dp.getQuote(ticker);
  const profile = await dp.getProfile(ticker);
  const financials = await dp.getFinancials(ticker);
  const cashflow = await dp.getCashflow(ticker);
  const keyMetrics = await dp.getKeyMetrics(ticker);
  const ratios = await dp.getRatios(ticker);
  const estimates = await dp.getEstimates(ticker);

  // FCF analysis
  // FMP stable uses 'revenue' in income but not always in cashflow — merge revenue from income stmt
  const financialsByYear = {};
  for (const f of financials || []) {
    const yr = f.fiscalYear || f.calendarYear || f.date?.slice(0, 4);
    financialsByYear[yr] = f;
  }
  const enrichedCashflow = (cashflow || []).map((cf) => {
    const yr = cf.fiscalYear || cf.calendarYear || cf.date?.slice(0, 4);
    const inc = financialsByYear[yr];
    return { ...cf, revenue: cf.revenue || inc?.revenue || 0 };
  });

  const fcfAnalysis = computeFCF(enrichedCashflow);
  const profitability = computeProfitability(financials || []);

  // Compute EPS and PE from income statement
  const latestIncome = financials?.[0];
  const eps = latestIncome?.epsdiluted || latestIncome?.eps ||
    (latestIncome?.netIncome && latestIncome?.weightedAverageShsOutDil
      ? latestIncome.netIncome / latestIncome.weightedAverageShsOutDil
      : 0);
  const currentPrice = quote?.price || profile?.price || 0;
  const peTTM = eps ? currentPrice / eps : 0;

  // Shares outstanding
  const sharesOutstanding =
    latestIncome?.weightedAverageShsOutDil ||
    latestIncome?.weightedAverageShsOut ||
    0;

  // Base FCF = most recent year
  const latestFCF = fcfAnalysis.length > 0 ? fcfAnalysis[fcfAnalysis.length - 1].freeCashFlow : 0;

  // DCF
  const dcf = computeDCF({
    baseFCF: latestFCF,
    wacc: cfg.wacc,
    growthRate: cfg.growthRate,
    terminalGrowth: cfg.terminalGrowth,
    horizonYears: cfg.horizonYears,
    sharesOutstanding,
    currentPrice,
    fcfOverrides: overrides.fcfPerYear || {},
  });

  // Sensitivity
  const sensitivity = computeSensitivity({
    currentPrice,
    currentEPS: eps,
    epsCagrScenarios: sensCfg.epsCagrScenarios,
    peScenarios: sensCfg.peScenarios,
    horizonYears: sensCfg.horizonYears,
  });

  // Peers
  const peerTickers = cfg.peers.length > 0 ? cfg.peers : [];
  const peers = peerTickers.length > 0
    ? await computePeers(ticker, peerTickers, { price: currentPrice, pe: peTTM, eps })
    : { ticker, peers: [], peerAveragePE: 0, subjectEPS: eps, impliedPriceIfPeerAverage: 0 };

  return {
    ticker,
    companyName: profile?.companyName || quote?.name || ticker,
    quote: {
      currentPrice,
      marketCap: quote?.marketCap || profile?.marketCap,
      peTTM,
      peFwd: ratios?.[0]?.priceEarningsRatio || peTTM,
      eps,
      sharesOutstanding,
    },
    fcfAnalysis,
    profitability,
    dcf,
    sensitivity,
    peers,
    estimates: Array.isArray(estimates) ? estimates.slice(0, 5) : [],
  };
}
