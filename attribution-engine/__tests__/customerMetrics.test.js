import { describe, it, expect } from 'vitest';
import { computeLtv, computeLtvByChannel, computeCohortMetrics, computeRepeatRate, computeWindowedLtv } from '../domain/customerMetrics.js';

const orders = [
  { orderId: 'O1', customerId: 'C1', revenue: 100, date: '2026-03-01' },
  { orderId: 'O2', customerId: 'C1', revenue: 150, date: '2026-03-15' },
  { orderId: 'O3', customerId: 'C2', revenue: 80, date: '2026-03-05' },
  { orderId: 'O4', customerId: 'C3', revenue: 200, date: '2026-04-01' },
  { orderId: 'O5', customerId: 'C3', revenue: 120, date: '2026-04-10' },
  { orderId: 'O6', customerId: 'C4', revenue: 50, date: '2026-04-02' },
];

describe('customerMetrics', () => {
  describe('computeLtv', () => {
    it('computes overall LTV', () => {
      const result = computeLtv(orders);
      expect(result.uniqueCustomers).toBe(4);
      expect(result.totalRevenue).toBe(700);
      expect(result.ltv).toBe(175);
    });

    it('handles empty orders', () => {
      const result = computeLtv([]);
      expect(result.ltv).toBe(0);
    });
  });

  describe('computeLtvByChannel', () => {
    it('computes LTV per acquisition channel', () => {
      const attr = [
        { customerId: 'C1', acquisitionChannel: 'meta' },
        { customerId: 'C2', acquisitionChannel: 'google' },
        { customerId: 'C3', acquisitionChannel: 'meta' },
        { customerId: 'C4', acquisitionChannel: 'tiktok' },
      ];
      const result = computeLtvByChannel(orders, attr);
      expect(result.meta.customers).toBe(2);
      expect(result.meta.totalRevenue).toBe(570);
      expect(result.meta.ltv).toBe(285);
      expect(result.google.ltv).toBe(80);
      expect(result.tiktok.ltv).toBe(50);
    });
  });

  describe('computeCohortMetrics', () => {
    it('groups by month of first order', () => {
      const result = computeCohortMetrics(orders);
      expect(result.length).toBe(2);
      expect(result[0].cohort).toBe('2026-03');
      expect(result[1].cohort).toBe('2026-04');
    });

    it('computes repeat rate per cohort', () => {
      const result = computeCohortMetrics(orders);
      const marchCohort = result.find((c) => c.cohort === '2026-03');
      expect(marchCohort.customers).toBe(2);
      expect(marchCohort.repeatRate).toBe(50);
    });

    it('computes avg orders per customer', () => {
      const result = computeCohortMetrics(orders);
      const marchCohort = result.find((c) => c.cohort === '2026-03');
      expect(marchCohort.avgOrdersPerCustomer).toBe(1.5);
    });
  });

  describe('computeRepeatRate', () => {
    it('computes overall repeat rate', () => {
      const result = computeRepeatRate(orders);
      expect(result.totalCustomers).toBe(4);
      expect(result.repeatCustomers).toBe(2);
      expect(result.repeatRate).toBe(50);
    });

    it('returns 0 for single orders', () => {
      const result = computeRepeatRate([orders[2]]);
      expect(result.repeatRate).toBe(0);
    });
  });

  describe('computeWindowedLtv', () => {
    it('computes 7-day LTV', () => {
      const result = computeWindowedLtv(orders, 7);
      expect(result.windowDays).toBe(7);
      expect(result.uniqueCustomers).toBeGreaterThan(0);
    });

    it('30-day LTV includes more revenue than 7-day', () => {
      const ltv7 = computeWindowedLtv(orders, 7);
      const ltv30 = computeWindowedLtv(orders, 30);
      expect(ltv30.totalRevenue).toBeGreaterThanOrEqual(ltv7.totalRevenue);
    });

    it('handles empty orders', () => {
      const result = computeWindowedLtv([], 30);
      expect(result.ltv).toBe(0);
    });
  });
});
