import { describe, it, expect } from 'vitest';
import { buildJourney, buildJourneys, filterByWindow, splitByConversion } from '../services/journeyBuilder.js';

const events = [
  { customerId: 'C1', type: 'click', channel: 'meta', timestamp: '2026-04-01T10:00:00Z' },
  { customerId: 'C1', type: 'click', channel: 'google', timestamp: '2026-04-03T14:00:00Z' },
  { customerId: 'C1', type: 'purchase', channel: 'direct', timestamp: '2026-04-05T16:00:00Z', revenue: 100 },
  { customerId: 'C2', type: 'click', channel: 'tiktok', timestamp: '2026-04-02T09:00:00Z' },
  { customerId: 'C2', type: 'purchase', channel: 'direct', timestamp: '2026-04-04T12:00:00Z', revenue: 50 },
  { customerId: 'C3', type: 'click', channel: 'meta', timestamp: '2026-04-06T10:00:00Z' },
];

describe('journeyBuilder', () => {
  describe('buildJourney', () => {
    it('separates touchpoints and conversions', () => {
      const journey = buildJourney(events, 'C1');
      expect(journey.touchpoints.length).toBe(2);
      expect(journey.conversions.length).toBe(1);
      expect(journey.conversions[0].revenue).toBe(100);
    });

    it('sorts events chronologically', () => {
      const shuffled = [events[1], events[0], events[2]];
      const journey = buildJourney(shuffled, 'C1');
      expect(journey.touchpoints[0].channel).toBe('meta');
      expect(journey.touchpoints[1].channel).toBe('google');
    });
  });

  describe('buildJourneys', () => {
    it('builds journeys only for customers with conversions', () => {
      const journeys = buildJourneys(events);
      expect(journeys.length).toBe(2);
      const ids = journeys.map((j) => j.customerId).sort();
      expect(ids).toEqual(['C1', 'C2']);
    });

    it('excludes customers with no conversions', () => {
      const journeys = buildJourneys(events);
      expect(journeys.find((j) => j.customerId === 'C3')).toBeUndefined();
    });
  });

  describe('filterByWindow', () => {
    it('filters touchpoints outside the attribution window', () => {
      const journey = buildJourney(events, 'C1');
      const filtered = filterByWindow(journey, 3);
      expect(filtered.touchpoints.length).toBe(1);
      expect(filtered.touchpoints[0].channel).toBe('google');
    });

    it('keeps all touchpoints with large window', () => {
      const journey = buildJourney(events, 'C1');
      const filtered = filterByWindow(journey, 30);
      expect(filtered.touchpoints.length).toBe(2);
    });
  });

  describe('splitByConversion', () => {
    it('splits journey into sessions per conversion', () => {
      const multiConvEvents = [
        { customerId: 'CX', type: 'click', channel: 'meta', timestamp: '2026-04-01T10:00:00Z' },
        { customerId: 'CX', type: 'purchase', channel: 'direct', timestamp: '2026-04-02T10:00:00Z', revenue: 50 },
        { customerId: 'CX', type: 'click', channel: 'google', timestamp: '2026-04-05T10:00:00Z' },
        { customerId: 'CX', type: 'purchase', channel: 'direct', timestamp: '2026-04-06T10:00:00Z', revenue: 80 },
      ];
      const journey = buildJourney(multiConvEvents, 'CX');
      const sessions = splitByConversion(journey);
      expect(sessions.length).toBe(2);
      expect(sessions[0].touchpoints.length).toBe(1);
      expect(sessions[0].conversion.revenue).toBe(50);
      expect(sessions[1].touchpoints.length).toBe(1);
      expect(sessions[1].conversion.revenue).toBe(80);
    });
  });
});
