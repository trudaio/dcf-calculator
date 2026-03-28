import { getQuote, getFinancials } from '../dataProvider.js';

/**
 * Peer comparison: fetch quotes + basic financials for peer tickers.
 */
export async function computePeers(ticker, peerTickers, subjectQuote) {
  const peerQuotes = await Promise.all(
    peerTickers.map(async (pt) => {
      try {
        const [q, fin] = await Promise.all([
          getQuote(pt),
          getFinancials(pt, 1),
        ]);
        if (!q) return null;
        const latestIncome = fin?.[0];
        const eps = latestIncome?.epsdiluted || latestIncome?.eps ||
          (latestIncome?.netIncome && latestIncome?.weightedAverageShsOutDil
            ? latestIncome.netIncome / latestIncome.weightedAverageShsOutDil
            : 0);
        const pe = eps ? q.price / eps : 0;

        return {
          ticker: pt,
          name: q.name,
          price: q.price,
          peTTM: pe,
          marketCap: q.marketCap,
        };
      } catch {
        return null;
      }
    })
  );

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
