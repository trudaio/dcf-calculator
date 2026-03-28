const BASE = '/api';

export async function fetchQuote(ticker) {
  const res = await fetch(`${BASE}/quote/${ticker}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchAnalysis(ticker, params = {}) {
  const query = new URLSearchParams();
  if (params.wacc) query.set('wacc', params.wacc);
  if (params.growthRate) query.set('growthRate', params.growthRate);
  if (params.terminalGrowth) query.set('terminalGrowth', params.terminalGrowth);
  if (params.horizonYears) query.set('horizonYears', params.horizonYears);
  if (params.peers?.length) query.set('peers', params.peers.join(','));

  const qs = query.toString();
  const res = await fetch(`${BASE}/analysis/${ticker}${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchAnalysisPost(ticker, settings, overrides) {
  const res = await fetch(`${BASE}/analysis/${ticker}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings, overrides }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${BASE}/projects`);
  return res.json();
}

export async function fetchProject(name) {
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

export async function saveProject(name, data) {
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
