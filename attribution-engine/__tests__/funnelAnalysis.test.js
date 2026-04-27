import { describe, it, expect } from 'vitest';
import { computeFunnel, computeFunnelByChannel, computeFunnelOverTime, computeDropoffs, computeDropoffsByChannel } from '../domain/funnelAnalysis.js';

const events = [
  // User 1: full funnel via meta
  { customerId: 'U1', type: 'view_item', channel: 'meta', timestamp: '2026-04-01T10:00:00Z' },
  { customerId: 'U1', type: 'add_to_cart', channel: 'meta', timestamp: '2026-04-01T10:05:00Z' },
  { customerId: 'U1', type: 'begin_checkout', channel: 'meta', timestamp: '2026-04-01T10:10:00Z' },
  { customerId: 'U1', type: 'purchase', channel: 'meta', timestamp: '2026-04-01T10:15:00Z', revenue: 100 },

  // User 2: view + cart, no checkout (cart abandonment) via google
  { customerId: 'U2', type: 'view_item', channel: 'google', timestamp: '2026-04-01T11:00:00Z' },
  { customerId: 'U2', type: 'add_to_cart', channel: 'google', timestamp: '2026-04-01T11:05:00Z' },

  // User 3: view + cart + checkout, no purchase (checkout abandonment) via meta
  { customerId: 'U3', type: 'view_item', channel: 'meta', timestamp: '2026-04-02T09:00:00Z' },
  { customerId: 'U3', type: 'add_to_cart', channel: 'meta', timestamp: '2026-04-02T09:05:00Z' },
  { customerId: 'U3', type: 'begin_checkout', channel: 'meta', timestamp: '2026-04-02T09:10:00Z' },

  // User 4: view only (bounced) via tiktok
  { customerId: 'U4', type: 'view_item', channel: 'tiktok', timestamp: '2026-04-02T14:00:00Z' },

  // User 5: full funnel via google
  { customerId: 'U5', type: 'view_item', channel: 'google', timestamp: '2026-04-03T10:00:00Z' },
  { customerId: 'U5', type: 'add_to_cart', channel: 'google', timestamp: '2026-04-03T10:05:00Z' },
  { customerId: 'U5', type: 'begin_checkout', channel: 'google', timestamp: '2026-04-03T10:10:00Z' },
  { customerId: 'U5', type: 'purchase', channel: 'google', timestamp: '2026-04-03T10:15:00Z', revenue: 200 },
];

describe('funnelAnalysis', () => {
  describe('computeFunnel', () => {
    it('counts unique users per stage', () => {
      const result = computeFunnel(events);
      expect(result.uniqueUsers.view_item).toBe(5);
      expect(result.uniqueUsers.add_to_cart).toBe(4);
      expect(result.uniqueUsers.begin_checkout).toBe(3);
      expect(result.uniqueUsers.purchase).toBe(2);
    });

    it('computes funnel rates', () => {
      const result = computeFunnel(events);
      expect(result.rates.viewToCartRate).toBe(80);
      expect(result.rates.cartToCheckoutRate).toBe(75);
      expect(result.rates.checkoutToPurchaseRate).toBeCloseTo(66.67, 1);
      expect(result.rates.overallCvr).toBe(40);
    });

    it('computes abandonment rates', () => {
      const result = computeFunnel(events);
      expect(result.abandonment.cartAbandonmentRate).toBe(50);
      expect(result.abandonment.checkoutAbandonmentRate).toBeCloseTo(33.33, 1);
    });

    it('handles empty events', () => {
      const result = computeFunnel([]);
      expect(result.uniqueUsers.view_item).toBe(0);
      expect(result.rates.overallCvr).toBe(0);
    });

    it('counts total events (not just unique)', () => {
      const result = computeFunnel(events);
      expect(result.counts.view_item).toBe(5);
      expect(result.counts.purchase).toBe(2);
    });
  });

  describe('computeFunnelByChannel', () => {
    it('returns overall + per-channel breakdown', () => {
      const result = computeFunnelByChannel(events);
      expect(result.overall).toBeDefined();
      expect(result.channels.meta).toBeDefined();
      expect(result.channels.google).toBeDefined();
      expect(result.channels.tiktok).toBeDefined();
    });

    it('meta has 2 view_item users, 2 add_to_cart, 2 checkout, 1 purchase', () => {
      const meta = computeFunnelByChannel(events).channels.meta;
      expect(meta.uniqueUsers.view_item).toBe(2);
      expect(meta.uniqueUsers.add_to_cart).toBe(2);
      expect(meta.uniqueUsers.begin_checkout).toBe(2);
      expect(meta.uniqueUsers.purchase).toBe(1);
    });

    it('tiktok has 1 view_item user only', () => {
      const tiktok = computeFunnelByChannel(events).channels.tiktok;
      expect(tiktok.uniqueUsers.view_item).toBe(1);
      expect(tiktok.uniqueUsers.add_to_cart).toBe(0);
      expect(tiktok.rates.viewToCartRate).toBe(0);
    });

    it('google has correct funnel', () => {
      const google = computeFunnelByChannel(events).channels.google;
      expect(google.uniqueUsers.view_item).toBe(2);
      expect(google.uniqueUsers.purchase).toBe(1);
      expect(google.rates.overallCvr).toBe(50);
    });
  });

  describe('computeFunnelOverTime', () => {
    it('returns daily buckets sorted by date', () => {
      const result = computeFunnelOverTime(events, 'daily');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].period).toBe('2026-04-01');
    });

    it('each bucket has funnel data', () => {
      const result = computeFunnelOverTime(events, 'daily');
      const day1 = result[0];
      expect(day1.uniqueUsers).toBeDefined();
      expect(day1.rates).toBeDefined();
      expect(day1.abandonment).toBeDefined();
    });

    it('monthly granularity groups all into one period', () => {
      const result = computeFunnelOverTime(events, 'monthly');
      expect(result.length).toBe(1);
      expect(result[0].period).toBe('2026-04');
    });
  });

  describe('computeDropoffs', () => {
    it('categorizes users by where they dropped off', () => {
      const result = computeDropoffs(events);
      expect(result.counts.view_only).toBe(1);
      expect(result.counts.added_not_checkout).toBe(1);
      expect(result.counts.checkout_not_purchase).toBe(1);
      expect(result.counts.purchased).toBe(2);
      expect(result.total).toBe(5);
    });

    it('computes dropoff percentages', () => {
      const result = computeDropoffs(events);
      expect(result.rates.view_only).toBe(20);
      expect(result.rates.added_not_checkout).toBe(20);
      expect(result.rates.checkout_not_purchase).toBe(20);
      expect(result.rates.purchased).toBe(40);
    });
  });

  describe('computeDropoffsByChannel', () => {
    it('returns overall + per channel', () => {
      const result = computeDropoffsByChannel(events);
      expect(result.overall).toBeDefined();
      expect(result.channels.meta).toBeDefined();
    });

    it('meta: 1 purchased, 1 checkout_not_purchase', () => {
      const meta = computeDropoffsByChannel(events).channels.meta;
      expect(meta.counts.purchased).toBe(1);
      expect(meta.counts.checkout_not_purchase).toBe(1);
    });
  });
});
