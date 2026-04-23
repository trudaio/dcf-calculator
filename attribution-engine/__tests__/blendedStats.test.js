import { describe, it, expect } from 'vitest';
import { computeBlendedStats, computeBlendedStatsOverTime } from '../domain/blendedStats.js';

const channelStats = [
  { channel: 'meta', spend: 850, revenue: 3200, orders: 42, newCustomerOrders: 28, sessions: 4200 },
  { channel: 'google', spend: 620, revenue: 2100, orders: 31, newCustomerOrders: 22, sessions: 3100 },
  { channel: 'tiktok', spend: 400, revenue: 1500, orders: 18, newCustomerOrders: 15, sessions: 2800 },
  { channel: 'email', spend: 50, revenue: 800, orders: 15, newCustomerOrders: 3, sessions: 900 },
];

describe('blendedStats', () => {
  describe('computeBlendedStats', () => {
    it('sums totals correctly', () => {
      const result = computeBlendedStats(channelStats);
      expect(result.blended.totalSpend).toBe(1920);
      expect(result.blended.totalRevenue).toBe(7600);
      expect(result.blended.totalOrders).toBe(106);
      expect(result.blended.totalNewCustomerOrders).toBe(68);
      expect(result.blended.totalSessions).toBe(11000);
    });

    it('computes blended ROAS', () => {
      const result = computeBlendedStats(channelStats);
      expect(result.blended.blendedRoas).toBeCloseTo(3.958, 2);
    });

    it('computes blended MER', () => {
      const result = computeBlendedStats(channelStats);
      expect(result.blended.blendedMer).toBeCloseTo(0.2526, 3);
    });

    it('computes blended CPA', () => {
      const result = computeBlendedStats(channelStats);
      expect(result.blended.blendedCpa).toBeCloseTo(18.113, 2);
    });

    it('returns per-channel breakdown', () => {
      const result = computeBlendedStats(channelStats);
      expect(result.channels.length).toBe(4);
      const meta = result.channels.find((c) => c.channel === 'meta');
      expect(meta.roas).toBeCloseTo(3.765, 2);
      expect(meta.cpa).toBeCloseTo(20.238, 2);
    });

    it('handles empty input', () => {
      const result = computeBlendedStats([]);
      expect(result.blended.totalSpend).toBe(0);
      expect(result.blended.blendedRoas).toBe(0);
    });
  });

  describe('computeBlendedStatsOverTime', () => {
    const dailyStats = [
      { date: '2026-04-01', channel: 'meta', spend: 850, revenue: 3200, orders: 42, newCustomerOrders: 28, sessions: 4200 },
      { date: '2026-04-01', channel: 'google', spend: 620, revenue: 2100, orders: 31, newCustomerOrders: 22, sessions: 3100 },
      { date: '2026-04-02', channel: 'meta', spend: 900, revenue: 3500, orders: 45, newCustomerOrders: 30, sessions: 4500 },
      { date: '2026-04-02', channel: 'google', spend: 580, revenue: 1900, orders: 28, newCustomerOrders: 20, sessions: 2900 },
    ];

    it('returns daily aggregations', () => {
      const result = computeBlendedStatsOverTime(dailyStats);
      expect(result.daily.length).toBe(2);
      expect(result.daily[0].date).toBe('2026-04-01');
      expect(result.daily[0].blended.totalSpend).toBe(1470);
    });

    it('returns weekly aggregations', () => {
      const result = computeBlendedStatsOverTime(dailyStats);
      expect(result.weekly.length).toBeGreaterThan(0);
    });

    it('returns monthly aggregations', () => {
      const result = computeBlendedStatsOverTime(dailyStats);
      expect(result.monthly.length).toBe(1);
      expect(result.monthly[0].date).toBe('2026-04');
    });
  });
});
