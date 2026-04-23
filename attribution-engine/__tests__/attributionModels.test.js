import { describe, it, expect } from 'vitest';
import { firstClick, lastClick, linear, positionBased, timeDecay, applyModel, listModels } from '../domain/attributionModels.js';

const touchpoints = [
  { timestamp: '2026-04-01T10:00:00Z', channel: 'meta', type: 'click' },
  { timestamp: '2026-04-03T14:00:00Z', channel: 'google', type: 'click' },
  { timestamp: '2026-04-05T09:00:00Z', channel: 'tiktok', type: 'click' },
];

const VALUE = 100;

describe('attributionModels', () => {
  describe('firstClick', () => {
    it('gives 100% to first touchpoint', () => {
      const result = firstClick(touchpoints, VALUE);
      expect(result[0].credit).toBe(100);
      expect(result[1].credit).toBe(0);
      expect(result[2].credit).toBe(0);
    });

    it('handles single touchpoint', () => {
      const result = firstClick([touchpoints[0]], VALUE);
      expect(result[0].credit).toBe(100);
    });

    it('handles empty array', () => {
      expect(firstClick([], VALUE)).toEqual([]);
    });
  });

  describe('lastClick', () => {
    it('gives 100% to last touchpoint', () => {
      const result = lastClick(touchpoints, VALUE);
      expect(result[0].credit).toBe(0);
      expect(result[1].credit).toBe(0);
      expect(result[2].credit).toBe(100);
    });
  });

  describe('linear', () => {
    it('distributes equally across all touchpoints', () => {
      const result = linear(touchpoints, VALUE);
      const share = VALUE / 3;
      expect(result[0].credit).toBeCloseTo(share, 2);
      expect(result[1].credit).toBeCloseTo(share, 2);
      expect(result[2].credit).toBeCloseTo(share, 2);
    });

    it('total credits sum to conversion value', () => {
      const result = linear(touchpoints, VALUE);
      const total = result.reduce((s, t) => s + t.credit, 0);
      expect(total).toBeCloseTo(VALUE, 5);
    });
  });

  describe('positionBased', () => {
    it('distributes 40/20/40 for 3 touchpoints', () => {
      const result = positionBased(touchpoints, VALUE);
      expect(result[0].credit).toBe(40);
      expect(result[1].credit).toBe(20);
      expect(result[2].credit).toBe(40);
    });

    it('splits proportionally for 2 touchpoints', () => {
      const result = positionBased(touchpoints.slice(0, 2), VALUE);
      expect(result[0].credit).toBe(50);
      expect(result[1].credit).toBe(50);
    });

    it('gives 100% for single touchpoint', () => {
      const result = positionBased([touchpoints[0]], VALUE);
      expect(result[0].credit).toBe(100);
    });

    it('distributes middle evenly for 5 touchpoints', () => {
      const tp5 = [
        { timestamp: '2026-04-01T10:00:00Z', channel: 'meta' },
        { timestamp: '2026-04-02T10:00:00Z', channel: 'google' },
        { timestamp: '2026-04-03T10:00:00Z', channel: 'tiktok' },
        { timestamp: '2026-04-04T10:00:00Z', channel: 'email' },
        { timestamp: '2026-04-05T10:00:00Z', channel: 'organic' },
      ];
      const result = positionBased(tp5, VALUE);
      expect(result[0].credit).toBe(40);
      expect(result[4].credit).toBe(40);
      const middleEach = 20 / 3;
      expect(result[1].credit).toBeCloseTo(middleEach, 5);
      expect(result[2].credit).toBeCloseTo(middleEach, 5);
      expect(result[3].credit).toBeCloseTo(middleEach, 5);
    });

    it('total credits sum to value', () => {
      const result = positionBased(touchpoints, VALUE);
      const total = result.reduce((s, t) => s + t.credit, 0);
      expect(total).toBeCloseTo(VALUE, 5);
    });
  });

  describe('timeDecay', () => {
    it('gives most credit to the touchpoint closest to conversion', () => {
      const result = timeDecay(touchpoints, VALUE);
      expect(result[2].credit).toBeGreaterThan(result[1].credit);
      expect(result[1].credit).toBeGreaterThan(result[0].credit);
    });

    it('total credits sum to value', () => {
      const result = timeDecay(touchpoints, VALUE);
      const total = result.reduce((s, t) => s + t.credit, 0);
      expect(total).toBeCloseTo(VALUE, 5);
    });

    it('shorter half-life concentrates more on recent', () => {
      const short = timeDecay(touchpoints, VALUE, 1);
      const long = timeDecay(touchpoints, VALUE, 30);
      expect(short[2].credit).toBeGreaterThan(long[2].credit);
    });
  });

  describe('applyModel', () => {
    it('dispatches to correct model', () => {
      const fc = applyModel('firstClick', touchpoints, VALUE);
      expect(fc[0].credit).toBe(100);

      const lc = applyModel('lastClick', touchpoints, VALUE);
      expect(lc[2].credit).toBe(100);
    });

    it('throws for unknown model', () => {
      expect(() => applyModel('unknown', touchpoints, VALUE)).toThrow('Unknown attribution model');
    });

    it('passes options to positionBased', () => {
      const result = applyModel('positionBased', touchpoints, VALUE, {
        weights: { first: 0.3, last: 0.5, middle: 0.2 },
      });
      expect(result[0].credit).toBe(30);
      expect(result[2].credit).toBe(50);
    });
  });

  describe('listModels', () => {
    it('returns all model names', () => {
      const models = listModels();
      expect(models).toContain('firstClick');
      expect(models).toContain('lastClick');
      expect(models).toContain('linear');
      expect(models).toContain('positionBased');
      expect(models).toContain('timeDecay');
      expect(models.length).toBe(5);
    });
  });
});
