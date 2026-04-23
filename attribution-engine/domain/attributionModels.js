function sorted(touchpoints) {
  return [...touchpoints].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function firstClick(touchpoints, value) {
  if (!touchpoints.length) return [];
  const tp = sorted(touchpoints);
  return tp.map((t, i) => ({
    ...t,
    credit: i === 0 ? value : 0,
  }));
}

export function lastClick(touchpoints, value) {
  if (!touchpoints.length) return [];
  const tp = sorted(touchpoints);
  return tp.map((t, i) => ({
    ...t,
    credit: i === tp.length - 1 ? value : 0,
  }));
}

export function linear(touchpoints, value) {
  if (!touchpoints.length) return [];
  const tp = sorted(touchpoints);
  const share = value / tp.length;
  return tp.map((t) => ({ ...t, credit: share }));
}

export function positionBased(touchpoints, value, weights = { first: 0.4, last: 0.4, middle: 0.2 }) {
  if (!touchpoints.length) return [];
  const tp = sorted(touchpoints);

  if (tp.length === 1) {
    return [{ ...tp[0], credit: value }];
  }

  if (tp.length === 2) {
    const firstShare = weights.first / (weights.first + weights.last);
    return [
      { ...tp[0], credit: value * firstShare },
      { ...tp[1], credit: value * (1 - firstShare) },
    ];
  }

  const middleCount = tp.length - 2;
  const middleShare = (value * weights.middle) / middleCount;

  return tp.map((t, i) => {
    if (i === 0) return { ...t, credit: value * weights.first };
    if (i === tp.length - 1) return { ...t, credit: value * weights.last };
    return { ...t, credit: middleShare };
  });
}

export function timeDecay(touchpoints, value, halfLifeDays = 7) {
  if (!touchpoints.length) return [];
  const tp = sorted(touchpoints);
  const conversionTime = new Date(tp[tp.length - 1].timestamp).getTime();
  const halfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000;

  const rawWeights = tp.map((t) => {
    const diff = new Date(t.timestamp).getTime() - conversionTime;
    return Math.pow(2, diff / halfLifeMs);
  });

  const totalWeight = rawWeights.reduce((sum, w) => sum + w, 0);

  return tp.map((t, i) => ({
    ...t,
    credit: totalWeight === 0 ? 0 : value * (rawWeights[i] / totalWeight),
  }));
}

const models = { firstClick, lastClick, linear, positionBased, timeDecay };

export function applyModel(modelName, touchpoints, value, options = {}) {
  const fn = models[modelName];
  if (!fn) throw new Error(`Unknown attribution model: ${modelName}`);

  if (modelName === 'positionBased') return fn(touchpoints, value, options.weights);
  if (modelName === 'timeDecay') return fn(touchpoints, value, options.halfLifeDays);
  return fn(touchpoints, value);
}

export function listModels() {
  return Object.keys(models);
}
