import { describe, it, expect } from 'vitest';
import { computeAttribution, computeAllModels, computeFromEvents, computeDataDriven } from '../services/attributionService.js';
import { buildJourneys } from '../services/journeyBuilder.js';

const events = [
  { customerId: 'C1', type: 'click', channel: 'meta', timestamp: '2026-04-01T10:00:00Z' },
  { customerId: 'C1', type: 'click', channel: 'google', timestamp: '2026-04-03T14:00:00Z' },
  { customerId: 'C1', type: 'click', channel: 'tiktok', timestamp: '2026-04-05T09:00:00Z' },
  { customerId: 'C1', type: 'purchase', channel: 'direct', timestamp: '2026-04-06T16:00:00Z', revenue: 100 },

  { customerId: 'C2', type: 'click', channel: 'meta', timestamp: '2026-04-02T08:00:00Z' },
  { customerId: 'C2', type: 'click', channel: 'google', timestamp: '2026-04-04T11:00:00Z' },
  { customerId: 'C2', type: 'purchase', channel: 'direct', timestamp: '2026-04-05T20:00:00Z', revenue: 200 },
];

const journeys = buildJourneys(events);

describe('attributionService', () => {
  describe('computeAttribution', () => {
    it('firstClick attributes all to first channel', () => {
      const result = computeAttribution(journeys, 'firstClick');
      const meta = result.channels.find((c) => c.channel === 'meta');
      expect(meta.attributedRevenue).toBe(300);
      expect(result.totalConversions).toBe(2);
    });

    it('lastClick attributes all to last channel before purchase', () => {
      const result = computeAttribution(journeys, 'lastClick');
      const tiktok = result.channels.find((c) => c.channel === 'tiktok');
      const google = result.channels.find((c) => c.channel === 'google');
      expect(tiktok.attributedRevenue).toBe(100);
      expect(google.attributedRevenue).toBe(200);
    });

    it('linear distributes evenly', () => {
      const result = computeAttribution(journeys, 'linear');
      const total = result.channels.reduce((s, c) => s + c.attributedRevenue, 0);
      expect(total).toBeCloseTo(300, 1);
    });

    it('tripleAttribution gives full credit per channel', () => {
      const result = computeAttribution(journeys, 'tripleAttribution');
      const meta = result.channels.find((c) => c.channel === 'meta');
      expect(meta.attributedRevenue).toBe(300);
      expect(meta.conversions).toBe(2);

      const google = result.channels.find((c) => c.channel === 'google');
      expect(google.attributedRevenue).toBe(300);
    });
  });

  describe('computeDataDriven', () => {
    it('markov returns attributed revenue that sums to total', () => {
      const result = computeDataDriven(journeys, 'markov');
      const totalAttributed = result.channels.reduce((s, c) => s + c.attributedRevenue, 0);
      expect(totalAttributed).toBeCloseTo(result.totalRevenue, 1);
    });

    it('shapley returns attributed revenue that sums to total', () => {
      const result = computeDataDriven(journeys, 'shapley');
      const totalAttributed = result.channels.reduce((s, c) => s + c.attributedRevenue, 0);
      expect(totalAttributed).toBeCloseTo(result.totalRevenue, 0);
    });

    it('markov reports correct total conversions', () => {
      const result = computeDataDriven(journeys, 'markov');
      expect(result.totalConversions).toBe(2);
    });

    it('shapley reports correct total conversions', () => {
      const result = computeDataDriven(journeys, 'shapley');
      expect(result.totalConversions).toBe(2);
    });

    it('throws for unknown data-driven model', () => {
      expect(() => computeDataDriven(journeys, 'unknown')).toThrow();
    });
  });

  describe('computeAllModels', () => {
    it('returns results for all 8 models (5 standard + triple + markov + shapley)', () => {
      const result = computeAllModels(journeys);
      expect(Object.keys(result).length).toBe(8);
      expect(result.firstClick).toBeDefined();
      expect(result.lastClick).toBeDefined();
      expect(result.linear).toBeDefined();
      expect(result.positionBased).toBeDefined();
      expect(result.timeDecay).toBeDefined();
      expect(result.tripleAttribution).toBeDefined();
      expect(result.markov).toBeDefined();
      expect(result.shapley).toBeDefined();
    });

    it('all models report same number of conversions', () => {
      const result = computeAllModels(journeys);
      for (const model of Object.values(result)) {
        expect(model.totalConversions).toBe(2);
      }
    });
  });

  describe('computeFromEvents', () => {
    it('builds journeys and computes attribution', () => {
      const result = computeFromEvents(events, 'lastClick');
      expect(result.totalConversions).toBe(2);
    });

    it('returns all 8 models when model is "all"', () => {
      const result = computeFromEvents(events, 'all');
      expect(Object.keys(result).length).toBe(8);
    });

    it('supports markov via computeFromEvents', () => {
      const result = computeFromEvents(events, 'markov');
      expect(result.model).toBe('markov');
      expect(result.channels.length).toBeGreaterThan(0);
    });

    it('supports shapley via computeFromEvents', () => {
      const result = computeFromEvents(events, 'shapley');
      expect(result.model).toBe('shapley');
      expect(result.channels.length).toBeGreaterThan(0);
    });
  });
});
