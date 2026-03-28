import React, { useState, useEffect, useCallback } from 'react';
import { fetchAnalysis, fetchAnalysisPost, fetchProjects, fetchProject, saveProject } from './api.js';
import Overview from './components/Overview.jsx';
import FCFTab from './components/FCFTab.jsx';
import ProfitabilityTab from './components/ProfitabilityTab.jsx';
import DCFTab from './components/DCFTab.jsx';
import SensitivityTab from './components/SensitivityTab.jsx';
import PeersTab from './components/PeersTab.jsx';

const TABS = ['Overview', 'FCF & CAPEX', 'Profitability', 'Valuation (DCF)', 'Sensitivity', 'Peers'];

export default function App() {
  const [ticker, setTicker] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');

  // DCF settings (editable)
  const [settings, setSettings] = useState({
    wacc: 0.09,
    growthRate: 0.10,
    terminalGrowth: 0.025,
    horizonYears: 10,
    peers: [],
    sensitivity: {
      epsCagrScenarios: [0.08, 0.10, 0.13, 0.16, 0.19],
      peScenarios: [18, 20, 23, 26, 30],
      horizonYears: 10,
    },
  });
  const [overrides, setOverrides] = useState({ fcfPerYear: {} });

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {});
  }, []);

  const loadAnalysis = useCallback(async (t, s, o) => {
    const sym = (t || ticker).toUpperCase().trim();
    if (!sym) return;
    setLoading(true);
    setError('');
    try {
      const result = await fetchAnalysisPost(sym, s || settings, o || overrides);
      setData(result);
      setTicker(sym);
    } catch (err) {
      setError(err.message || 'Failed to load analysis');
    }
    setLoading(false);
  }, [ticker, settings, overrides]);

  const handleLoad = () => loadAnalysis();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLoad();
  };

  const handleRecalculate = (newSettings, newOverrides) => {
    const s = newSettings || settings;
    const o = newOverrides || overrides;
    if (newSettings) setSettings(s);
    if (newOverrides) setOverrides(o);
    loadAnalysis(ticker, s, o);
  };

  const handleSaveProject = async () => {
    const name = projectName || ticker;
    if (!name || !data) return;
    await saveProject(name, {
      ticker,
      settings,
      overrides,
    });
    setProjectName(name);
    const list = await fetchProjects();
    setProjects(list);
  };

  const handleLoadProject = async (name) => {
    const proj = await fetchProject(name);
    setTicker(proj.ticker);
    setSettings((prev) => ({ ...prev, ...proj.settings }));
    setOverrides(proj.overrides || { fcfPerYear: {} });
    setProjectName(name);
    await loadAnalysis(proj.ticker, { ...settings, ...proj.settings }, proj.overrides);
  };

  const renderTab = () => {
    if (loading) return <div className="loading">Loading analysis...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!data) return <div className="loading">Enter a ticker and click Load to begin.</div>;

    switch (activeTab) {
      case 0: return <Overview data={data} />;
      case 1: return <FCFTab data={data.fcfAnalysis} />;
      case 2: return <ProfitabilityTab data={data.profitability} />;
      case 3:
        return (
          <DCFTab
            data={data.dcf}
            settings={settings}
            onRecalculate={handleRecalculate}
          />
        );
      case 4:
        return (
          <SensitivityTab
            data={data.sensitivity}
            settings={settings}
            onRecalculate={handleRecalculate}
          />
        );
      case 5:
        return (
          <PeersTab
            data={data.peers}
            settings={settings}
            ticker={ticker}
            onRecalculate={handleRecalculate}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Financial Analysis Dashboard</h1>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="MSFT"
        />
        <button className="btn btn-primary" onClick={handleLoad}>
          Load
        </button>

        <select
          value=""
          onChange={(e) => e.target.value && handleLoadProject(e.target.value)}
        >
          <option value="">Load Project...</option>
          {projects.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button className="btn" onClick={handleSaveProject} disabled={!data}>
          Save Project
        </button>

        {data && (
          <span style={{ color: '#8b949e', fontSize: 13 }}>
            {data.companyName}
          </span>
        )}
      </div>

      <div className="tabs">
        {TABS.map((tab, i) => (
          <div
            key={tab}
            className={`tab ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </div>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}
