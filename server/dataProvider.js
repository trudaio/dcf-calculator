import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.FMP_API_KEY;
const BASE = 'https://financialmodelingprep.com/stable';

async function fmpGet(endpoint, params = {}) {
  params.apikey = API_KEY;
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/${endpoint}?${qs}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FMP ${endpoint}: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getQuote(ticker) {
  const data = await fmpGet('quote', { symbol: ticker });
  return Array.isArray(data) ? data[0] || null : data;
}

export async function getProfile(ticker) {
  const data = await fmpGet('profile', { symbol: ticker });
  return Array.isArray(data) ? data[0] || null : data;
}

export async function getFinancials(ticker, limit = 5) {
  return fmpGet('income-statement', { symbol: ticker, limit });
}

export async function getCashflow(ticker, limit = 5) {
  return fmpGet('cash-flow-statement', { symbol: ticker, limit });
}

export async function getKeyMetrics(ticker, limit = 1) {
  return fmpGet('key-metrics', { symbol: ticker, limit });
}

export async function getRatios(ticker, limit = 1) {
  return fmpGet('ratios', { symbol: ticker, limit });
}

export async function getEstimates(ticker, limit = 5) {
  try {
    return await fmpGet('analyst-estimates', { symbol: ticker, limit });
  } catch {
    return [];
  }
}
