import { describe, it, expect } from 'vitest';
import * as m from '../domain/metrics.js';

describe('metrics', () => {
  describe('roas', () => {
    it('computes ROAS correctly', () => {
      expect(m.roas(20000, 5000)).toBe(4);
    });
    it('returns 0 when spend is 0', () => {
      expect(m.roas(1000, 0)).toBe(0);
    });
  });

  describe('blendedRoas', () => {
    it('computes blended ROAS', () => {
      expect(m.blendedRoas(50000, 12500)).toBe(4);
    });
  });

  describe('ncRoas', () => {
    it('computes new customer ROAS', () => {
      expect(m.ncRoas(28000, 12000, 1500)).toBeCloseTo(2.074, 2);
    });
    it('works without custom ad spend', () => {
      expect(m.ncRoas(28000, 14000)).toBe(2);
    });
  });

  describe('mer', () => {
    it('computes MER', () => {
      expect(m.mer(12000, 1500, 50000)).toBe(0.27);
    });
    it('returns 0 when revenue is 0', () => {
      expect(m.mer(1000, 500, 0)).toBe(0);
    });
  });

  describe('cpa', () => {
    it('computes CPA from Triple Whale docs example', () => {
      expect(m.cpa(11500, 230)).toBe(50);
    });
  });

  describe('cac', () => {
    it('computes full CAC', () => {
      const costs = { marketingCost: 12000, wages: 5000, software: 800, overhead: 1200 };
      expect(m.cac(costs, 190)).toBe(100);
    });
  });

  describe('ltv', () => {
    it('computes LTV', () => {
      expect(m.ltv(100000, 500)).toBe(200);
    });
  });

  describe('clv', () => {
    it('computes CLV', () => {
      expect(m.clv(2, 100, 0.4, 3)).toBe(240);
    });
  });

  describe('aov', () => {
    it('computes AOV', () => {
      expect(m.aov(50000, 400)).toBe(125);
    });
  });

  describe('cvr', () => {
    it('computes conversion rate', () => {
      expect(m.cvr(420, 18000)).toBeCloseTo(2.333, 2);
    });
  });

  describe('netProfit', () => {
    it('computes net profit', () => {
      const result = m.netProfit(55000, {
        refunds: 1200, adSpend: 12000, cogs: 18000, fees: 1500, shipping: 2000, taxes: 800,
      });
      expect(result).toBe(19500);
    });
    it('works with defaults', () => {
      expect(m.netProfit(10000)).toBe(10000);
    });
  });

  describe('breakevenRoas', () => {
    it('computes breakeven ROAS from Triple Whale docs', () => {
      expect(m.breakevenRoas(0.25)).toBe(4);
    });
  });

  describe('ctr', () => {
    it('computes CTR', () => {
      expect(m.ctr(5200, 350000)).toBeCloseTo(1.486, 2);
    });
  });

  describe('cpm', () => {
    it('computes CPM', () => {
      expect(m.cpm(12000, 350000)).toBeCloseTo(34.286, 2);
    });
  });

  describe('orderRevenue', () => {
    it('computes order revenue = grossSales + shipping + taxes - discounts', () => {
      expect(m.orderRevenue(50000, 3500, 4000, 2500)).toBe(55000);
    });
    it('works with just gross sales', () => {
      expect(m.orderRevenue(1000)).toBe(1000);
    });
  });

  describe('ncpa', () => {
    it('computes NCPA', () => {
      expect(m.ncpa(12000, 1500, 230)).toBeCloseTo(58.696, 2);
    });
  });

  describe('bounceRate', () => {
    it('computes bounce rate', () => {
      expect(m.bounceRate(7200, 18000)).toBe(40);
    });
  });

  describe('ltvCacRatio', () => {
    it('computes LTV:CAC ratio', () => {
      expect(m.ltvCacRatio(300, 100)).toBe(3);
    });
    it('healthy ratio is >= 3:1', () => {
      expect(m.ltvCacRatio(300, 100)).toBeGreaterThanOrEqual(3);
    });
  });

  describe('computeAllMetrics', () => {
    it('returns all metrics from a single input object', () => {
      const result = m.computeAllMetrics({
        grossSales: 50000, shipping: 3500, taxes: 4000, discounts: 2500,
        adSpend: 12000, customAdSpend: 1500, sessions: 18000,
        totalOrders: 420, newCustomers: 230, customers: 280, uniqueCustomers: 280,
        profitMargin: 0.25, clicks: 5200, impressions: 350000, bounces: 7200,
        newCustomerRevenue: 28000, newCustomerOrders: 230,
        avgFreq: 1.5, avgValue: 131, avgMargin: 0.45, avgLifespan: 2.5,
        costs: { marketingCost: 12000, wages: 5000, software: 800, overhead: 1200 },
      });
      expect(result.orderRevenue).toBe(55000);
      expect(result.roas).toBeCloseTo(4.583, 2);
      expect(result.breakevenRoas).toBe(4);
      expect(result.bounceRate).toBe(40);
      expect(result.clv).toBeCloseTo(221.0625, 2);
    });
  });
});
