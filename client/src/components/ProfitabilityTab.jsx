import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, ComposedChart } from 'recharts';

const fmtB = (n) => {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  return n.toLocaleString();
};

const pct = (n) => (n == null || isNaN(n)) ? '—' : `${(n * 100).toFixed(1)}%`;

export default function ProfitabilityTab({ data }) {
  if (!data || data.length === 0) return <div className="card">No profitability data.</div>;

  const marginData = data.map((d) => ({
    year: d.year,
    'Gross Margin': +(d.grossMargin * 100).toFixed(1),
    'Operating Margin': +(d.operatingMargin * 100).toFixed(1),
    'Net Margin': +(d.netMargin * 100).toFixed(1),
  }));

  const revenueData = data.map((d) => ({
    year: d.year,
    Revenue: d.revenue,
    'Net Income': d.netIncome,
  }));

  return (
    <div>
      <div className="card">
        <h3>Margin Trends</h3>
        <div className="chart-container">
          <ResponsiveContainer>
            <LineChart data={marginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="year" stroke="#8b949e" />
              <YAxis stroke="#8b949e" unit="%" />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6 }}
                formatter={(v) => `${v}%`}
              />
              <Legend />
              <Line type="monotone" dataKey="Gross Margin" stroke="#58a6ff" strokeWidth={2} />
              <Line type="monotone" dataKey="Operating Margin" stroke="#d2a8ff" strokeWidth={2} />
              <Line type="monotone" dataKey="Net Margin" stroke="#3fb950" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Revenue & Net Income</h3>
        <div className="chart-container">
          <ResponsiveContainer>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="year" stroke="#8b949e" />
              <YAxis stroke="#8b949e" tickFormatter={fmtB} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6 }}
                formatter={(v) => fmtB(v)}
              />
              <Legend />
              <Bar dataKey="Revenue" fill="#58a6ff" />
              <Line type="monotone" dataKey="Net Income" stroke="#3fb950" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Details</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Revenue</th>
                <th>Gross Profit</th>
                <th>Op. Income</th>
                <th>Net Income</th>
                <th>Gross %</th>
                <th>Op. %</th>
                <th>Net %</th>
                <th>Rev Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.year}>
                  <td>{d.year}</td>
                  <td>{fmtB(d.revenue)}</td>
                  <td>{fmtB(d.grossProfit)}</td>
                  <td>{fmtB(d.operatingIncome)}</td>
                  <td>{fmtB(d.netIncome)}</td>
                  <td>{pct(d.grossMargin)}</td>
                  <td>{pct(d.operatingMargin)}</td>
                  <td>{pct(d.netMargin)}</td>
                  <td>{pct(d.revenueYoYGrowth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
