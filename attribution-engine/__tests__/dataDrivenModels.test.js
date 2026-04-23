import { describe, it, expect } from 'vitest';
import { markovAttribution, shapleyAttribution, journeysToPaths } from '../domain/dataDrivenModels.js';

// Simple 2-channel dataset
const simplePaths = [
  { channels: ['meta', 'google'], converted: true, value: 100 },
  { channels: ['meta'], converted: true, value: 80 },
  { channels: ['google'], converted: true, value: 60 },
  { channels: ['meta', 'google'], converted: false, value: 0 },
  { channels: ['google'], converted: false, value: 0 },
];

// Multi-channel dataset
const multiPaths = [
  { channels: ['meta', 'google', 'tiktok'], converted: true, value: 200 },
  { channels: ['meta', 'google'], converted: true, value: 150 },
  { channels: ['google', 'tiktok'], converted: true, value: 120 },
  { channels: ['meta'], converted: true, value: 100 },
  { channels: ['tiktok'], converted: true, value: 80 },
  { channels: ['meta', 'tiktok'], converted: false, value: 0 },
  { channels: ['google'], converted: false, value: 0 },
  { channels: ['meta'], converted: false, value: 0 },
];

// Single channel
const singlePaths = [
  { channels: ['meta'], converted: true, value: 100 },
  { channels: ['meta'], converted: true, value: 50 },
  { channels: ['meta'], converted: false, value: 0 },
];

describe('Markov Chain Attribution', () => {
  it('returns shares that sum to 1', () => {
    const result = markovAttribution(simplePaths);
    const totalShare = Object.values(result.channels)
      .reduce((s, c) => s + c.share, 0);
    expect(totalShare).toBeCloseTo(1, 5);
  });

  it('returns positive removal effects for all channels', () => {
    const result = markovAttribution(simplePaths);
    for (const data of Object.values(result.channels)) {
      expect(data.removalEffect).toBeGreaterThanOrEqual(0);
    }
  });

  it('computes baseline conversion probability', () => {
    const result = markovAttribution(simplePaths);
    expect(result.baselineConversion).toBeGreaterThan(0);
    expect(result.baselineConversion).toBeLessThanOrEqual(1);
  });

  it('handles single channel', () => {
    const result = markovAttribution(singlePaths);
    expect(result.channels.meta.share).toBe(1);
    expect(result.channels.meta.removalEffect).toBeGreaterThan(0);
  });

  it('handles multi-channel journeys', () => {
    const result = markovAttribution(multiPaths);
    expect(Object.keys(result.channels).length).toBe(3);
    const totalShare = Object.values(result.channels)
      .reduce((s, c) => s + c.share, 0);
    expect(totalShare).toBeCloseTo(1, 5);
  });

  it('handles empty paths', () => {
    const result = markovAttribution([]);
    expect(Object.keys(result.channels).length).toBe(0);
    expect(result.baselineConversion).toBe(0);
  });

  it('channel with higher removal effect gets more credit', () => {
    const paths = [
      { channels: ['meta', 'google'], converted: true, value: 100 },
      { channels: ['meta'], converted: true, value: 100 },
      { channels: ['meta'], converted: true, value: 100 },
      { channels: ['google'], converted: false, value: 0 },
      { channels: ['google'], converted: false, value: 0 },
    ];
    const result = markovAttribution(paths);
    expect(result.channels.meta.share).toBeGreaterThan(result.channels.google.share);
  });
});

describe('Shapley Value Attribution', () => {
  it('returns shares that sum to ~1', () => {
    const result = shapleyAttribution(simplePaths);
    const totalShare = Object.values(result.channels)
      .reduce((s, c) => s + c.share, 0);
    expect(totalShare).toBeCloseTo(1, 2);
  });

  it('returns positive Shapley values for contributing channels', () => {
    const result = shapleyAttribution(simplePaths);
    for (const data of Object.values(result.channels)) {
      expect(data.shapleyValue).toBeGreaterThanOrEqual(0);
    }
  });

  it('handles single channel — gets 100% credit', () => {
    const result = shapleyAttribution(singlePaths);
    expect(result.channels.meta.share).toBeCloseTo(1, 5);
  });

  it('handles multi-channel journeys', () => {
    const result = shapleyAttribution(multiPaths);
    expect(Object.keys(result.channels).length).toBe(3);
    const totalShare = Object.values(result.channels)
      .reduce((s, c) => s + c.share, 0);
    expect(totalShare).toBeCloseTo(1, 2);
  });

  it('handles empty paths', () => {
    const result = shapleyAttribution([]);
    expect(Object.keys(result.channels).length).toBe(0);
  });

  it('channel appearing in more converting paths gets more credit', () => {
    const paths = [
      { channels: ['meta'], converted: true, value: 100 },
      { channels: ['meta'], converted: true, value: 100 },
      { channels: ['meta', 'google'], converted: true, value: 100 },
      { channels: ['google'], converted: false, value: 0 },
    ];
    const result = shapleyAttribution(paths);
    expect(result.channels.meta.share).toBeGreaterThan(result.channels.google.share);
  });

  it('Monte Carlo produces similar results to exact', () => {
    const exact = shapleyAttribution(simplePaths);
    const mc = shapleyAttribution(simplePaths, { monteCarlo: true, samples: 50000 });

    for (const channel of Object.keys(exact.channels)) {
      expect(mc.channels[channel].share).toBeCloseTo(exact.channels[channel].share, 1);
    }
  });
});

describe('journeysToPaths', () => {
  it('converts journey format to path format', () => {
    const journeys = [
      {
        customerId: 'C1',
        touchpoints: [
          { channel: 'meta', timestamp: '2026-04-01' },
          { channel: 'google', timestamp: '2026-04-02' },
        ],
        conversions: [{ revenue: 100, timestamp: '2026-04-03' }],
      },
      {
        customerId: 'C2',
        touchpoints: [{ channel: 'tiktok', timestamp: '2026-04-01' }],
        conversions: [],
      },
    ];

    const paths = journeysToPaths(journeys);
    expect(paths.length).toBe(2);
    expect(paths[0].channels).toEqual(['meta', 'google']);
    expect(paths[0].converted).toBe(true);
    expect(paths[0].value).toBe(100);
    expect(paths[1].converted).toBe(false);
  });
});

describe('Markov vs Shapley consistency', () => {
  it('both models agree on relative channel importance for clear cases', () => {
    const paths = [
      { channels: ['meta'], converted: true, value: 100 },
      { channels: ['meta'], converted: true, value: 100 },
      { channels: ['meta'], converted: true, value: 100 },
      { channels: ['meta', 'google'], converted: true, value: 100 },
      { channels: ['google'], converted: false, value: 0 },
      { channels: ['google'], converted: false, value: 0 },
    ];

    const markov = markovAttribution(paths);
    const shapley = shapleyAttribution(paths);

    expect(markov.channels.meta.share).toBeGreaterThan(markov.channels.google.share);
    expect(shapley.channels.meta.share).toBeGreaterThan(shapley.channels.google.share);
  });
});
