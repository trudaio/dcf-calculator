import React from 'react';

function getColor(annualizedReturn) {
  if (annualizedReturn >= 0.15) return '#238636';
  if (annualizedReturn >= 0.10) return '#2ea043';
  if (annualizedReturn >= 0.05) return '#3fb950';
  if (annualizedReturn >= 0) return '#8b949e';
  if (annualizedReturn >= -0.05) return '#da3633';
  return '#f85149';
}

function getBg(annualizedReturn) {
  if (annualizedReturn >= 0.15) return 'rgba(35, 134, 54, 0.3)';
  if (annualizedReturn >= 0.10) return 'rgba(46, 160, 67, 0.2)';
  if (annualizedReturn >= 0.05) return 'rgba(63, 185, 80, 0.1)';
  if (annualizedReturn >= 0) return 'rgba(139, 148, 158, 0.1)';
  if (annualizedReturn >= -0.05) return 'rgba(218, 54, 51, 0.15)';
  return 'rgba(248, 81, 73, 0.25)';
}

export default function SensitivityTab({ data }) {
  if (!data) return <div className="card">No sensitivity data.</div>;

  const { epsCagrScenarios, peScenarios, rows, currentPrice, currentEPS, horizonYears } = data;
  const cols = peScenarios.length + 1;

  return (
    <div>
      <div className="card">
        <h3>Sensitivity: EPS CAGR vs Terminal P/E</h3>
        <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 12 }}>
          Current Price: ${currentPrice?.toFixed(2)} | Current EPS: ${currentEPS?.toFixed(2)} | Horizon: {horizonYears} years
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div
            className="sensitivity-grid"
            style={{ gridTemplateColumns: `120px repeat(${peScenarios.length}, 1fr)` }}
          >
            {/* Header row */}
            <div className="sens-header">EPS CAGR \ P/E</div>
            {peScenarios.map((pe) => (
              <div key={pe} className="sens-header">{pe}x</div>
            ))}

            {/* Data rows */}
            {rows.map((row) => (
              <React.Fragment key={row.cagr}>
                <div className="sens-header">{(row.cagr * 100).toFixed(0)}%</div>
                {row.cells.map((cell) => (
                  <div
                    key={`${cell.cagr}-${cell.pe}`}
                    className="sens-cell"
                    style={{
                      background: getBg(cell.annualizedReturn),
                      color: getColor(cell.annualizedReturn),
                    }}
                    title={`Terminal Price: $${cell.terminalPrice.toFixed(2)}\nTerminal EPS: $${cell.terminalEPS.toFixed(2)}`}
                  >
                    {(cell.annualizedReturn * 100).toFixed(1)}%
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#8b949e' }}>
          Cells show annualized return. Hover for terminal price details.
        </div>
      </div>

      <div className="card">
        <h3>Terminal Price Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>EPS CAGR</th>
                {peScenarios.map((pe) => (
                  <th key={pe}>{pe}x P/E</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.cagr}>
                  <td>{(row.cagr * 100).toFixed(0)}%</td>
                  {row.cells.map((cell) => (
                    <td key={`${cell.cagr}-${cell.pe}`}>
                      ${cell.terminalPrice.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
