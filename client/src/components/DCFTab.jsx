import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const fmtB = (n) => {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
};

const fmt = (n, d = 2) => (n == null || isNaN(n)) ? '—' : Number(n).toFixed(d);

export default function DCFTab({ data, settings, onRecalculate }) {
  const [wacc, setWacc] = useState((settings.wacc * 100).toFixed(1));
  const [growth, setGrowth] = useState((settings.growthRate * 100).toFixed(1));
  const [termGrowth, setTermGrowth] = useState((settings.terminalGrowth * 100).toFixed(1));
  const [horizon, setHorizon] = useState(settings.horizonYears);

  const handleRecalc = () => {
    onRecalculate({
      ...settings,
      wacc: parseFloat(wacc) / 100,
      growthRate: parseFloat(growth) / 100,
      terminalGrowth: parseFloat(termGrowth) / 100,
      horizonYears: parseInt(horizon),
    });
  };

  const chartData = data?.timeline?.map((t) => ({
    year: t.year,
    'Projected FCF': t.projectedFCF,
    'Present Value': t.presentValue,
  })) || [];

  return (
    <div>
      <div className="card">
        <h3>DCF Parameters</h3>
        <div className="form-row">
          <div className="form-group">
            <label>WACC (%)</label>
            <input type="number" step="0.1" value={wacc} onChange={(e) => setWacc(e.target.value)} />
          </div>
          <div className="form-group">
            <label>FCF Growth (%)</label>
            <input type="number" step="0.5" value={growth} onChange={(e) => setGrowth(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Terminal Growth (%)</label>
            <input type="number" step="0.1" value={termGrowth} onChange={(e) => setTermGrowth(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Horizon (years)</label>
            <input type="number" min="1" max="30" value={horizon} onChange={(e) => setHorizon(e.target.value)} />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleRecalc}>Recalculate</button>
          </div>
        </div>
      </div>

      <div className="card fair-value-card">
        <h3>Fair Value per Share</h3>
        <div className="stat-value" style={{ fontSize: '2.4rem' }}>
          ${fmt(data?.fairValuePerShare)}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: '#8b949e' }}>
          Current: ${fmt(data?.currentPrice)} &nbsp;|&nbsp;
          <span style={{ color: data?.upsidePercent >= 0 ? '#3fb950' : '#f85149' }}>
            {data?.upsidePercent >= 0 ? '+' : ''}{fmt(data?.upsidePercent != null ? data.upsidePercent * 100 : null, 1)}% upside
          </span>
        </div>
      </div>

      <div className="card">
        <h3>Projected FCF vs Present Value</h3>
        <div className="chart-container">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="year" stroke="#8b949e" />
              <YAxis stroke="#8b949e" tickFormatter={(v) => fmtB(v).replace('$', '')} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6 }}
                formatter={(v) => fmtB(v)}
              />
              <Legend />
              <Bar dataKey="Projected FCF" fill="#58a6ff" />
              <Bar dataKey="Present Value" fill="#3fb950" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>DCF Timeline</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Growth</th>
                <th>Projected FCF</th>
                <th>Discount Factor</th>
                <th>Present Value</th>
              </tr>
            </thead>
            <tbody>
              {data?.timeline?.map((t) => (
                <tr key={t.year}>
                  <td>{t.year}</td>
                  <td>{(t.growthRate * 100).toFixed(1)}%</td>
                  <td>{fmtB(t.projectedFCF)}</td>
                  <td>{fmt(t.discountFactor, 4)}</td>
                  <td>{fmtB(t.presentValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stats-grid" style={{ marginTop: 16 }}>
          <div className="stat">
            <div className="stat-label">Sum PV of FCF</div>
            <div className="stat-value">{fmtB(data?.cumulativePVofFCF)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Terminal Value</div>
            <div className="stat-value">{fmtB(data?.terminalValue)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">PV Terminal Value</div>
            <div className="stat-value">{fmtB(data?.pvTerminalValue)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total Equity Value</div>
            <div className="stat-value">{fmtB(data?.equityValue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
