import React from 'react';

const fmt = (n, decimals = 2) => {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const fmtB = (n) => {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${fmt(n)}`;
};

const pct = (n) => {
  if (n == null || isNaN(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
};

export default function Overview({ data }) {
  const { quote, dcf, companyName, ticker } = data;
  const upside = dcf?.upsidePercent;

  return (
    <div>
      <div className="card fair-value-card">
        <h3>DCF Fair Value</h3>
        <div className="stat-value" style={{ fontSize: '2.4rem' }}>
          ${fmt(dcf?.fairValuePerShare)}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: '#8b949e' }}>
          Current: ${fmt(quote?.currentPrice)} &nbsp;|&nbsp;
          <span className={upside >= 0 ? 'stat-value positive' : 'stat-value negative'} style={{ fontSize: 14 }}>
            {upside >= 0 ? '+' : ''}{pct(upside)} upside
          </span>
        </div>
      </div>

      <div className="card">
        <h3>{ticker} — {companyName}</h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-label">Price</div>
            <div className="stat-value">${fmt(quote?.currentPrice)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Market Cap</div>
            <div className="stat-value">{fmtB(quote?.marketCap)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">P/E (TTM)</div>
            <div className="stat-value">{fmt(quote?.peTTM, 1)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">P/E (Fwd)</div>
            <div className="stat-value">{fmt(quote?.peFwd, 1)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">EPS</div>
            <div className="stat-value">${fmt(quote?.eps)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Shares Outstanding</div>
            <div className="stat-value">{fmtB(quote?.sharesOutstanding).replace('$', '')}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>DCF Summary</h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-label">Equity Value</div>
            <div className="stat-value">{fmtB(dcf?.equityValue)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">PV of Projected FCF</div>
            <div className="stat-value">{fmtB(dcf?.cumulativePVofFCF)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Terminal Value</div>
            <div className="stat-value">{fmtB(dcf?.terminalValue)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">PV of Terminal Value</div>
            <div className="stat-value">{fmtB(dcf?.pvTerminalValue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
