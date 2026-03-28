import React, { useState } from 'react';

const fmt = (n, d = 2) => (n == null || isNaN(n)) ? '—' : Number(n).toFixed(d);
const fmtB = (n) => {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
};

export default function PeersTab({ data, settings, ticker, onRecalculate }) {
  const [peersInput, setPeersInput] = useState(settings.peers?.join(', ') || '');

  const handleLoadPeers = () => {
    const peerList = peersInput.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    onRecalculate({ ...settings, peers: peerList });
  };

  return (
    <div>
      <div className="card">
        <h3>Peer Comparison</h3>
        <div className="peers-input">
          <input
            type="text"
            value={peersInput}
            onChange={(e) => setPeersInput(e.target.value)}
            placeholder="e.g. AAPL, GOOGL, META, AMZN"
          />
          <button className="btn btn-primary" onClick={handleLoadPeers}>
            Load Peers
          </button>
        </div>
      </div>

      {data?.peers?.length > 0 && (
        <>
          <div className="card fair-value-card">
            <h3>Implied Price (Peer Avg P/E)</h3>
            <div className="stat-value" style={{ fontSize: '2rem' }}>
              ${fmt(data.impliedPriceIfPeerAverage)}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#8b949e' }}>
              Peer Avg P/E: {fmt(data.peerAveragePE, 1)}x &nbsp;|&nbsp; Subject EPS: ${fmt(data.subjectEPS)}
            </div>
          </div>

          <div className="card">
            <h3>Peers</h3>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>P/E (TTM)</th>
                    <th>Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {data.peers.map((p) => (
                    <tr key={p.ticker}>
                      <td>{p.ticker}</td>
                      <td style={{ textAlign: 'left' }}>{p.name}</td>
                      <td>${fmt(p.price)}</td>
                      <td>{fmt(p.peTTM, 1)}</td>
                      <td>{fmtB(p.marketCap)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #30363d', fontWeight: 600 }}>
                    <td colSpan={3}>Peer Average</td>
                    <td>{fmt(data.peerAveragePE, 1)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {(!data?.peers || data.peers.length === 0) && (
        <div className="card">
          <div style={{ color: '#8b949e', textAlign: 'center', padding: 20 }}>
            Enter peer tickers above and click Load Peers to see comparison.
          </div>
        </div>
      )}
    </div>
  );
}
