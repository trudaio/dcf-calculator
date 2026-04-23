import { describe, it, expect } from 'vitest';
import { tripleAttribution, tripleAttributionWithWindow, tripleAttributionBatch } from '../domain/channelAttribution.js';

const touchpoints = [
  { timestamp: '2026-04-01T10:00:00Z', channel: 'meta', type: 'click' },
  { timestamp: '2026-04-03T14:00:00Z', channel: 'google', type: 'click' },
  { timestamp: '2026-04-05T09:00:00Z', channel: 'tiktok', type: 'view' },
];

describe('channelAttribution — Triple Attribution', () => {
  describe('tripleAttribution', () => {
    it('gives full credit to each channel independently', () => {
      const result = tripleAttribution(touchpoints, 100);
      expect(result.channels.meta.credit).toBe(100);
      expect(result.channels.google.credit).toBe(100);
      expect(result.channels.tiktok.credit).toBe(100);
    });

    it('total exceeds conversion value (by design — independent per channel)', () => {
      const result = tripleAttribution(touchpoints, 100);
      expect(result.total).toBe(300);
    });

    it('handles single channel', () => {
      const result = tripleAttribution([touchpoints[0]], 50);
      expect(Object.keys(result.channels).length).toBe(1);
      expect(result.channels.meta.credit).toBe(50);
      expect(result.total).toBe(50);
    });

    it('handles empty touchpoints', () => {
      const result = tripleAttribution([], 100);
      expect(Object.keys(result.channels).length).toBe(0);
      expect(result.total).toBe(0);
    });

    it('uses last touchpoint per channel when multiple exist', () => {
      const tps = [
        { timestamp: '2026-04-01T10:00:00Z', channel: 'meta', adId: 'ad_1' },
        { timestamp: '2026-04-03T10:00:00Z', channel: 'meta', adId: 'ad_2' },
        { timestamp: '2026-04-05T10:00:00Z', channel: 'google', adId: 'ad_3' },
      ];
      const result = tripleAttribution(tps, 100);
      expect(result.channels.meta.lastTouchpoint.adId).toBe('ad_2');
      expect(result.channels.meta.touchpointCount).toBe(2);
    });
  });

  describe('tripleAttributionWithWindow', () => {
    it('filters touchpoints outside the window', () => {
      const result = tripleAttributionWithWindow(
        touchpoints, 100, 3, '2026-04-06T00:00:00Z'
      );
      expect(result.channels.tiktok).toBeDefined();
      expect(result.channels.google).toBeDefined();
      expect(result.channels.meta).toBeUndefined();
    });

    it('includes all touchpoints with large window', () => {
      const result = tripleAttributionWithWindow(
        touchpoints, 100, 30, '2026-04-06T00:00:00Z'
      );
      expect(Object.keys(result.channels).length).toBe(3);
    });
  });

  describe('tripleAttributionBatch', () => {
    it('aggregates across multiple journeys', () => {
      const journeys = [
        { touchpoints: [{ timestamp: '2026-04-01T10:00:00Z', channel: 'meta' }], conversionValue: 100 },
        { touchpoints: [{ timestamp: '2026-04-02T10:00:00Z', channel: 'meta' }, { timestamp: '2026-04-03T10:00:00Z', channel: 'google' }], conversionValue: 200 },
      ];
      const result = tripleAttributionBatch(journeys);
      expect(result.meta.attributedRevenue).toBe(300);
      expect(result.meta.conversions).toBe(2);
      expect(result.google.attributedRevenue).toBe(200);
      expect(result.google.conversions).toBe(1);
    });
  });
});
