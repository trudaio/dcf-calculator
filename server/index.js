import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getQuote } from './dataProvider.js';
import { buildAnalysisContext } from './analysisService.js';
import * as store from './projectStore.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Quote ---
app.get('/api/quote/:ticker', async (req, res) => {
  try {
    const quote = await getQuote(req.params.ticker.toUpperCase());
    if (!quote) return res.status(404).json({ error: 'Ticker not found' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Full analysis ---
app.get('/api/analysis/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const settings = {};
    if (req.query.wacc) settings.wacc = parseFloat(req.query.wacc);
    if (req.query.growthRate) settings.growthRate = parseFloat(req.query.growthRate);
    if (req.query.terminalGrowth) settings.terminalGrowth = parseFloat(req.query.terminalGrowth);
    if (req.query.horizonYears) settings.horizonYears = parseInt(req.query.horizonYears);
    if (req.query.peers) settings.peers = req.query.peers.split(',');

    const result = await buildAnalysisContext(ticker, settings);
    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Full analysis with POST (for complex overrides) ---
app.post('/api/analysis/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const { settings = {}, overrides = {} } = req.body;
    const result = await buildAnalysisContext(ticker, settings, overrides);
    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Projects ---
app.get('/api/projects', (req, res) => {
  res.json(store.listProjects());
});

app.get('/api/projects/:name', (req, res) => {
  const project = store.loadProject(req.params.name);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.post('/api/projects/:name', (req, res) => {
  const result = store.saveProject(req.params.name, req.body);
  res.json(result);
});

app.delete('/api/projects/:name', (req, res) => {
  const deleted = store.deleteProject(req.params.name);
  res.json({ deleted });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
