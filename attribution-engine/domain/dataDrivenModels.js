// Markov Chain Attribution
// Models customer journeys as state transitions. Credits channels based on
// "removal effect" — how much conversion probability drops when a channel is removed.

const START = '__START__';
const CONVERTED = '__CONVERTED__';
const NULL = '__NULL__';

function buildTransitionCounts(paths) {
  const counts = {};

  const inc = (from, to) => {
    if (!counts[from]) counts[from] = {};
    counts[from][to] = (counts[from][to] || 0) + 1;
  };

  for (const path of paths) {
    let prev = START;
    for (const channel of path.channels) {
      inc(prev, channel);
      prev = channel;
    }
    inc(prev, path.converted ? CONVERTED : NULL);
  }

  return counts;
}

function normalizeMatrix(counts) {
  const matrix = {};
  for (const [from, transitions] of Object.entries(counts)) {
    const total = Object.values(transitions).reduce((s, v) => s + v, 0);
    matrix[from] = {};
    for (const [to, count] of Object.entries(transitions)) {
      matrix[from][to] = total > 0 ? count / total : 0;
    }
  }
  return matrix;
}

function getConversionProbability(matrix, maxIter = 200, tolerance = 1e-10) {
  const states = new Set();
  for (const from of Object.keys(matrix)) {
    states.add(from);
    for (const to of Object.keys(matrix[from] || {})) {
      states.add(to);
    }
  }

  let probs = {};
  for (const s of states) probs[s] = s === START ? 1 : 0;

  for (let i = 0; i < maxIter; i++) {
    const next = {};
    for (const s of states) next[s] = 0;

    next[CONVERTED] = probs[CONVERTED] || 0;
    next[NULL] = probs[NULL] || 0;

    for (const from of states) {
      if (from === CONVERTED || from === NULL) continue;
      const p = probs[from] || 0;
      if (p === 0) continue;
      const transitions = matrix[from] || {};
      for (const [to, prob] of Object.entries(transitions)) {
        next[to] = (next[to] || 0) + p * prob;
      }
    }

    for (const s of states) {
      if (s !== CONVERTED && s !== NULL) next[s] = 0;
    }

    probs[START] = 0;

    const diff = Math.abs((next[CONVERTED] || 0) - (probs[CONVERTED] || 0));
    probs = next;
    if (diff < tolerance) break;
  }

  return probs[CONVERTED] || 0;
}

function computeConversionProbAbsorbing(matrix, channels) {
  const transient = [START, ...channels];
  const n = transient.length;
  const idx = {};
  transient.forEach((s, i) => (idx[s] = i));

  const Q = Array.from({ length: n }, () => Array(n).fill(0));
  const R = Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const from = transient[i];
    const transitions = matrix[from] || {};
    for (const [to, prob] of Object.entries(transitions)) {
      if (to === CONVERTED) {
        R[i] += prob;
      } else if (idx[to] !== undefined) {
        Q[i][idx[to]] += prob;
      }
    }
  }

  // N = (I - Q)^(-1), solve (I-Q) * N = I via Gaussian elimination
  const IminusQ = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) - Q[i][j])
  );

  const augmented = IminusQ.map((row, i) => {
    const ext = Array(n).fill(0);
    ext[i] = 1;
    return [...row, ...ext];
  });

  for (let col = 0; col < n; col++) {
    let pivot = -1;
    for (let row = col; row < n; row++) {
      if (Math.abs(augmented[row][col]) > 1e-12) { pivot = row; break; }
    }
    if (pivot === -1) continue;
    [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];

    const div = augmented[col][col];
    for (let j = 0; j < 2 * n; j++) augmented[col][j] /= div;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      for (let j = 0; j < 2 * n; j++) augmented[row][j] -= factor * augmented[col][j];
    }
  }

  const N = augmented.map((row) => row.slice(n));

  // B = N * R gives absorption probabilities from each transient state
  const B = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      B[i] += N[i][j] * R[j];
    }
  }

  return B[idx[START]] || 0;
}

function removeChannel(matrix, channel) {
  const cleaned = {};
  for (const [from, transitions] of Object.entries(matrix)) {
    if (from === channel) continue;
    cleaned[from] = {};
    let remaining = 0;
    for (const [to, prob] of Object.entries(transitions)) {
      if (to === channel) continue;
      cleaned[from][to] = prob;
      remaining += prob;
    }
    if (remaining > 0 && remaining < 1) {
      for (const to of Object.keys(cleaned[from])) {
        cleaned[from][to] /= remaining;
      }
    }
  }
  return cleaned;
}

export function markovAttribution(paths) {
  if (!paths.length) return { channels: {}, baselineConversion: 0 };

  const channels = [...new Set(paths.flatMap((p) => p.channels))];
  const counts = buildTransitionCounts(paths);
  const matrix = normalizeMatrix(counts);

  const baseline = computeConversionProbAbsorbing(matrix, channels);
  if (baseline === 0) return { channels: {}, baselineConversion: 0 };

  const removalEffects = {};
  for (const channel of channels) {
    const reduced = removeChannel(matrix, channel);
    const remainingChannels = channels.filter((c) => c !== channel);
    const probWithout = computeConversionProbAbsorbing(reduced, remainingChannels);
    removalEffects[channel] = Math.max(0, 1 - probWithout / baseline);
  }

  const totalEffect = Object.values(removalEffects).reduce((s, v) => s + v, 0);

  const result = {};
  for (const channel of channels) {
    result[channel] = {
      removalEffect: removalEffects[channel],
      share: totalEffect > 0 ? removalEffects[channel] / totalEffect : 0,
    };
  }

  return { channels: result, baselineConversion: baseline };
}

// Shapley Value Attribution
// Game theory approach: fairly distributes credit by computing each channel's
// average marginal contribution across all possible coalitions.

function getSubsets(arr) {
  const result = [[]];
  for (const item of arr) {
    const len = result.length;
    for (let i = 0; i < len; i++) {
      result.push([...result[i], item]);
    }
  }
  return result;
}

function factorial(n) {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

function coalitionConversionRate(paths, coalition) {
  if (coalition.length === 0) return 0;

  const coalitionSet = new Set(coalition);
  const matching = paths.filter((p) =>
    coalition.every((ch) => p.channels.includes(ch))
  );

  if (matching.length === 0) return 0;
  return matching.filter((p) => p.converted).length / matching.length;
}

export function shapleyAttribution(paths, { monteCarlo = false, samples = 10000 } = {}) {
  if (!paths.length) return { channels: {} };

  const channels = [...new Set(paths.flatMap((p) => p.channels))];

  if (channels.length > 12 || monteCarlo) {
    return shapleyMonteCarlo(paths, channels, samples);
  }

  return shapleyExact(paths, channels);
}

function shapleyExact(paths, channels) {
  const n = channels.length;
  const nFact = factorial(n);
  const values = {};
  channels.forEach((c) => (values[c] = 0));

  const subsets = getSubsets(channels);
  const cache = new Map();
  for (const s of subsets) {
    const key = [...s].sort().join('|');
    cache.set(key, coalitionConversionRate(paths, s));
  }

  const getVal = (coalition) => {
    const key = [...coalition].sort().join('|');
    return cache.get(key) || 0;
  };

  for (const channel of channels) {
    const others = channels.filter((c) => c !== channel);
    const otherSubsets = getSubsets(others);

    for (const S of otherSubsets) {
      const sSize = S.length;
      const weight = factorial(sSize) * factorial(n - sSize - 1) / nFact;
      const withChannel = getVal([...S, channel]);
      const without = getVal(S);
      values[channel] += weight * (withChannel - without);
    }
  }

  const clipped = {};
  for (const channel of channels) clipped[channel] = Math.max(0, values[channel]);
  const totalClipped = Object.values(clipped).reduce((s, v) => s + v, 0);

  const result = {};
  for (const channel of channels) {
    result[channel] = {
      shapleyValue: values[channel],
      share: totalClipped > 0 ? clipped[channel] / totalClipped : 0,
    };
  }

  return { channels: result };
}

function shapleyMonteCarlo(paths, channels, samples) {
  const n = channels.length;
  const values = {};
  channels.forEach((c) => (values[c] = 0));

  const cache = new Map();
  const getVal = (coalition) => {
    const key = [...coalition].sort().join('|');
    if (!cache.has(key)) {
      cache.set(key, coalitionConversionRate(paths, coalition));
    }
    return cache.get(key);
  };

  for (let i = 0; i < samples; i++) {
    const perm = shuffle([...channels]);
    const coalition = [];

    for (const channel of perm) {
      const withVal = getVal([...coalition, channel]);
      const withoutVal = coalition.length > 0 ? getVal(coalition) : 0;
      values[channel] += withVal - withoutVal;
      coalition.push(channel);
    }
  }

  for (const channel of channels) {
    values[channel] /= samples;
  }

  const clipped = {};
  for (const channel of channels) clipped[channel] = Math.max(0, values[channel]);
  const totalClipped = Object.values(clipped).reduce((s, v) => s + v, 0);

  const result = {};
  for (const channel of channels) {
    result[channel] = {
      shapleyValue: values[channel],
      share: totalClipped > 0 ? clipped[channel] / totalClipped : 0,
    };
  }

  return { channels: result };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Convenience: convert journey-based data to path format needed by these models
export function journeysToPaths(journeys) {
  const paths = [];

  for (const journey of journeys) {
    const channels = journey.touchpoints.map((t) => t.channel);
    if (journey.conversions && journey.conversions.length > 0) {
      paths.push({ channels, converted: true, value: journey.conversions[0].revenue || 0 });
    } else {
      paths.push({ channels, converted: false, value: 0 });
    }
  }

  return paths;
}
