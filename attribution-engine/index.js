import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import * as metrics from './domain/metrics.js';
import { computeBlendedStats, computeBlendedStatsOverTime } from './domain/blendedStats.js';
import { computeLtv, computeLtvByChannel, computeCohortMetrics, computeRepeatRate, computeWindowedLtv } from './domain/customerMetrics.js';
import { computeAttribution, computeAllModels, computeFromEvents, computeDataDriven } from './services/attributionService.js';
import { computeFunnel, computeFunnelByChannel, computeFunnelOverTime, computeDropoffs, computeDropoffsByChannel } from './domain/funnelAnalysis.js';
import { buildJourneys } from './services/journeyBuilder.js';
import { dummyEvents, dummyOrders, dummyChannelStats, dummyAttributionData } from './data/dummyData.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Health ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'attribution-engine', version: '1.0.0' });
});

// --- Metrics ---
app.post('/api/metrics/compute', (req, res) => {
  try {
    const result = metrics.computeAllMetrics(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/metrics/demo', (_req, res) => {
  const demoInput = {
    grossSales: 50000, shipping: 3500, taxes: 4000, discounts: 2500,
    adSpend: 12000, customAdSpend: 1500, refunds: 1200, cogs: 18000,
    fees: 1500, shippingCost: 2000, taxCost: 800,
    newCustomers: 230, customers: 280, uniqueCustomers: 280,
    totalOrders: 420, sessions: 18000, visitors: 18000,
    conversions: 420, clicks: 5200, impressions: 350000, bounces: 7200,
    newCustomerRevenue: 28000, newCustomerOrders: 230,
    profitMargin: 0.25,
    avgFreq: 1.5, avgValue: 131, avgMargin: 0.45, avgLifespan: 2.5,
    costs: { marketingCost: 12000, wages: 5000, software: 800, overhead: 1200 },
  };
  const result = metrics.computeAllMetrics(demoInput);
  res.json({ input: demoInput, metrics: result });
});

// --- Attribution ---
app.post('/api/attribution/compute', (req, res) => {
  try {
    const { events, model = 'lastClick', options = {} } = req.body;
    const data = events || dummyEvents;
    const result = computeFromEvents(data, model, options);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/attribution/compare', (req, res) => {
  try {
    const { events, options = {} } = req.body;
    const data = events || dummyEvents;
    const journeys = buildJourneys(data);
    const allJourneys = buildJourneys(data, { includeNonConverting: true });
    const result = computeAllModels(journeys, { ...options, _allJourneys: allJourneys });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/attribution/demo', (_req, res) => {
  const journeys = buildJourneys(dummyEvents);
  const allJourneys = buildJourneys(dummyEvents, { includeNonConverting: true });
  const result = computeAllModels(journeys, { _allJourneys: allJourneys });
  res.json({
    eventsCount: dummyEvents.length,
    journeysCount: journeys.length,
    nonConvertingJourneys: allJourneys.length - journeys.length,
    models: result,
  });
});

// --- Data-Driven Attribution ---
app.post('/api/attribution/data-driven', (req, res) => {
  try {
    const { events, model = 'markov', options = {} } = req.body;
    const data = events || dummyEvents;
    const journeys = buildJourneys(data);
    const allJourneys = buildJourneys(data, { includeNonConverting: true });
    const result = computeDataDriven(journeys, model, options, { allJourneys });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/attribution/data-driven/demo', (_req, res) => {
  const journeys = buildJourneys(dummyEvents);
  const allJourneys = buildJourneys(dummyEvents, { includeNonConverting: true });
  const markov = computeDataDriven(journeys, 'markov', {}, { allJourneys });
  const shapley = computeDataDriven(journeys, 'shapley', {}, { allJourneys });
  res.json({
    eventsCount: dummyEvents.length,
    convertingJourneys: journeys.length,
    nonConvertingJourneys: allJourneys.length - journeys.length,
    markov,
    shapley,
  });
});

// --- Blended Stats ---
app.post('/api/blended/compute', (req, res) => {
  try {
    const { channelStats } = req.body;
    const data = channelStats || dummyChannelStats;
    const result = computeBlendedStats(data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/blended/over-time', (req, res) => {
  try {
    const { dailyChannelStats } = req.body;
    const data = dailyChannelStats || dummyChannelStats;
    const result = computeBlendedStatsOverTime(data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/blended/demo', (_req, res) => {
  const snapshot = computeBlendedStats(dummyChannelStats);
  const overTime = computeBlendedStatsOverTime(dummyChannelStats);
  res.json({ snapshot, overTime });
});

// --- Customer Metrics ---
app.post('/api/customer/ltv', (req, res) => {
  try {
    const { orders } = req.body;
    const data = orders || dummyOrders;
    const overall = computeLtv(data);
    const byChannel = computeLtvByChannel(data, dummyAttributionData);
    const windowed = {
      '7day': computeWindowedLtv(data, 7),
      '30day': computeWindowedLtv(data, 30),
      '90day': computeWindowedLtv(data, 90),
    };
    res.json({ overall, byChannel, windowed });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/customer/cohorts', (req, res) => {
  try {
    const { orders } = req.body;
    const data = orders || dummyOrders;
    const cohorts = computeCohortMetrics(data);
    const repeatRate = computeRepeatRate(data);
    res.json({ cohorts, repeatRate });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/customer/demo', (_req, res) => {
  const overall = computeLtv(dummyOrders);
  const byChannel = computeLtvByChannel(dummyOrders, dummyAttributionData);
  const cohorts = computeCohortMetrics(dummyOrders);
  const repeatRate = computeRepeatRate(dummyOrders);
  const windowed = {
    '7day': computeWindowedLtv(dummyOrders, 7),
    '30day': computeWindowedLtv(dummyOrders, 30),
    '90day': computeWindowedLtv(dummyOrders, 90),
  };
  res.json({ overall, byChannel, cohorts, repeatRate, windowed });
});

// --- Funnel Analysis ---
app.post('/api/funnel/compute', (req, res) => {
  try {
    const { events } = req.body;
    const data = events || dummyEvents;
    const result = computeFunnelByChannel(data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/funnel/over-time', (req, res) => {
  try {
    const { events, granularity = 'daily' } = req.body;
    const data = events || dummyEvents;
    const result = computeFunnelOverTime(data, granularity);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/funnel/dropoffs', (req, res) => {
  try {
    const { events } = req.body;
    const data = events || dummyEvents;
    const result = computeDropoffsByChannel(data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/funnel/demo', (_req, res) => {
  const funnel = computeFunnelByChannel(dummyEvents);
  const dropoffs = computeDropoffsByChannel(dummyEvents);
  const overTime = computeFunnelOverTime(dummyEvents, 'daily');
  res.json({ funnel, dropoffs, overTime });
});

// --- Start ---
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Attribution Engine running on port ${PORT}`);
});
