import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, ComposedChart } from 'recharts';

const fmtB = (n) => {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  return n.toLocaleString();
};

const pct = (n) => (n == null || isNaN(n)) ? '—' : `${(n * 100).toFixed(1)}%`;

export default function FCFTab({ data }) {
  if (!data || data.length === 0) return <div className="card">No FCF data available.</div>;

  const chartData = data.map((d) => ({
    year: d.year,
    'Operating CF': d.operatingCashFlow,
    'CAPEX': -d.capex,
    'Free CF': d.freeCashFlow,
  }));

  const marginData = data.map((d) => ({
    year: d.year,
    'FCF Margin': +(d.fcfMargin * 100).toFixed(1),
    'CAPEX/Revenue': +(d.capexToRevenue * 100).toFixed(1),
  }));

  return (
    <div>
      <div className="card">
        <h3>Free Cash Flow Trend</h3>
        <div className="chart-container">
          <ResponsiveContainer>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="year" stroke="#8b949e" />
              <YAxis stroke="#8b949e" tickFormatter={fmtB} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6 }}
                formatter={(v) => fmtB(v)}
              />
              <Legend />
              <Bar dataKey="Operating CF" fill="#58a6ff" />
              <Bar dataKey="CAPEX" fill="#f85149" />
              <Line type="monotone" dataKey="Free CF" stroke="#3fb950" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Margins</h3>
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
              <Line type="monotone" dataKey="FCF Margin" stroke="#3fb950" strokeWidth={2} />
              <Line type="monotone" dataKey="CAPEX/Revenue" stroke="#f85149" strokeWidth={2} />
            </LineChart>
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
                <th>Operating CF</th>
                <th>CAPEX</th>
                <th>Free CF</th>
                <th>FCF Margin</th>
                <th>CAPEX/Rev</th>
                <th>Rev Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.year}>
                  <td>{d.year}</td>
                  <td>{fmtB(d.revenue)}</td>
                  <td>{fmtB(d.operatingCashFlow)}</td>
                  <td>{fmtB(d.capex)}</td>
                  <td style={{ color: d.freeCashFlow >= 0 ? '#3fb950' : '#f85149' }}>{fmtB(d.freeCashFlow)}</td>
                  <td>{pct(d.fcfMargin)}</td>
                  <td>{pct(d.capexToRevenue)}</td>
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
