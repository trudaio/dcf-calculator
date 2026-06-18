import dotenv from 'dotenv';
import * as demo from './demoData.js';
dotenv.config();

const API_KEY = process.env.FMP_API_KEY;
const BASE = process.env.FMP_BASE_URL || 'https://financialmodelingprep.com/stable';

// When no real key is configured, serve self-contained demo data so the app
// can be previewed without external API access. See server/demoData.js.
export const DEMO_MODE = !API_KEY || API_KEY === 'demo';
if (DEMO_MODE) {
  console.log('[dataProvider] No FMP_API_KEY found — running in DEMO MODE with sample data.');
}

async function fmpGet(endpoint, params = {}) {
  params.apikey = API_KEY;
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/${endpoint}?${qs}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FMP ${endpoint}: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getQuote(ticker) {
  if (DEMO_MODE) return demo.getQuote(ticker);
  const data = await fmpGet('quote', { symbol: ticker });
  return Array.isArray(data) ? data[0] || null : data;
}

export async function getProfile(ticker) {
  if (DEMO_MODE) return demo.getProfile(ticker);
  const data = await fmpGet('profile', { symbol: ticker });
  return Array.isArray(data) ? data[0] || null : data;
}

export async function getFinancials(ticker, limit = 5) {
  if (DEMO_MODE) return demo.getFinancials(ticker, limit);
  return fmpGet('income-statement', { symbol: ticker, limit });
}

export async function getCashflow(ticker, limit = 5) {
  if (DEMO_MODE) return demo.getCashflow(ticker, limit);
  return fmpGet('cash-flow-statement', { symbol: ticker, limit });
}

export async function getKeyMetrics(ticker, limit = 1) {
  if (DEMO_MODE) return demo.getKeyMetrics(ticker, limit);
  return fmpGet('key-metrics', { symbol: ticker, limit });
}

export async function getRatios(ticker, limit = 1) {
  if (DEMO_MODE) return demo.getRatios(ticker, limit);
  return fmpGet('ratios', { symbol: ticker, limit });
}

export async function getEstimates(ticker, limit = 5) {
  if (DEMO_MODE) return demo.getEstimates(ticker, limit);
  try {
    return await fmpGet('analyst-estimates', { symbol: ticker, limit });
  } catch {
    return [];
  }
}
