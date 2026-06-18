import { getQuote, getFinancials } from '../dataProvider.js';

/**
 * Peer comparison: fetch quotes + basic financials for peer tickers.
 */
export async function computePeers(ticker, peerTickers, subjectQuote) {
  // Fetch peers sequentially — the FMP free tier rate-limits parallel requests
  // (see tasks/lessons.md). Promise.all here intermittently triggered 402 errors.
  const peerQuotes = [];
  for (const pt of peerTickers) {
    try {
      const q = await getQuote(pt);
      const fin = await getFinancials(pt, 1);
      if (!q) {
        peerQuotes.push(null);
        continue;
      }
      const latestIncome = fin?.[0];
      const eps = latestIncome?.epsdiluted || latestIncome?.eps ||
        (latestIncome?.netIncome && latestIncome?.weightedAverageShsOutDil
          ? latestIncome.netIncome / latestIncome.weightedAverageShsOutDil
          : 0);
      const pe = eps ? q.price / eps : 0;

      peerQuotes.push({
        ticker: pt,
        name: q.name,
        price: q.price,
        peTTM: pe,
        marketCap: q.marketCap,
      });
    } catch {
      peerQuotes.push(null);
    }
  }

  const validPeers = peerQuotes.filter((p) => p && p.peTTM > 0);
  const peerAveragePE = validPeers.length
    ? validPeers.reduce((sum, p) => sum + p.peTTM, 0) / validPeers.length
    : 0;

  const subjectEPS = subjectQuote?.eps || 0;
  const impliedPriceIfPeerAverage = subjectEPS * peerAveragePE;

  return {
    ticker,
    peers: validPeers,
    peerAveragePE,
    subjectEPS,
    impliedPriceIfPeerAverage,
  };
}
