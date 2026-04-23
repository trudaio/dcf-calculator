const safe = (n, d) => (d === 0 ? 0 : n / d);

const FUNNEL_STAGES = ['view_item', 'add_to_cart', 'begin_checkout', 'purchase'];

export function computeFunnel(events) {
  const counts = {};
  for (const stage of FUNNEL_STAGES) counts[stage] = 0;

  const uniqueByStage = {};
  for (const stage of FUNNEL_STAGES) uniqueByStage[stage] = new Set();

  for (const e of events) {
    if (counts[e.type] !== undefined) {
      counts[e.type]++;
      uniqueByStage[e.type].add(e.customerId);
    }
  }

  const uniqueCounts = {};
  for (const stage of FUNNEL_STAGES) uniqueCounts[stage] = uniqueByStage[stage].size;

  return {
    counts,
    uniqueUsers: uniqueCounts,
    rates: {
      viewToCartRate: safe(uniqueCounts.add_to_cart, uniqueCounts.view_item) * 100,
      cartToCheckoutRate: safe(uniqueCounts.begin_checkout, uniqueCounts.add_to_cart) * 100,
      checkoutToPurchaseRate: safe(uniqueCounts.purchase, uniqueCounts.begin_checkout) * 100,
      overallCvr: safe(uniqueCounts.purchase, uniqueCounts.view_item) * 100,
    },
    abandonment: {
      cartAbandonmentRate: safe(uniqueCounts.add_to_cart - uniqueCounts.purchase, uniqueCounts.add_to_cart) * 100,
      checkoutAbandonmentRate: safe(uniqueCounts.begin_checkout - uniqueCounts.purchase, uniqueCounts.begin_checkout) * 100,
    },
  };
}

export function computeFunnelByChannel(events) {
  const byChannel = {};

  for (const e of events) {
    const ch = e.channel;
    if (!ch) continue;
    if (!byChannel[ch]) byChannel[ch] = [];
    byChannel[ch].push(e);
  }

  const channels = {};
  for (const [channel, channelEvents] of Object.entries(byChannel)) {
    channels[channel] = computeFunnel(channelEvents);
  }

  return {
    overall: computeFunnel(events),
    channels,
  };
}

export function computeFunnelOverTime(events, granularity = 'daily') {
  const bucketFn = granularity === 'monthly'
    ? (ts) => ts.slice(0, 7)
    : granularity === 'weekly'
      ? (ts) => {
          const dt = new Date(ts);
          const day = dt.getDay();
          const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
          return new Date(dt.setDate(diff)).toISOString().slice(0, 10);
        }
      : (ts) => ts.slice(0, 10);

  const byPeriod = {};

  for (const e of events) {
    const period = bucketFn(e.timestamp);
    if (!byPeriod[period]) byPeriod[period] = [];
    byPeriod[period].push(e);
  }

  return Object.entries(byPeriod)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, periodEvents]) => ({
      period,
      ...computeFunnel(periodEvents),
    }));
}

export function computeDropoffs(events) {
  const customerStages = {};

  for (const e of events) {
    if (!FUNNEL_STAGES.includes(e.type)) continue;
    const cid = e.customerId;
    if (!customerStages[cid]) customerStages[cid] = new Set();
    customerStages[cid].add(e.type);
  }

  const dropoffs = {
    view_only: 0,
    added_not_checkout: 0,
    checkout_not_purchase: 0,
    purchased: 0,
  };

  for (const stages of Object.values(customerStages)) {
    if (stages.has('purchase')) {
      dropoffs.purchased++;
    } else if (stages.has('begin_checkout')) {
      dropoffs.checkout_not_purchase++;
    } else if (stages.has('add_to_cart')) {
      dropoffs.added_not_checkout++;
    } else if (stages.has('view_item')) {
      dropoffs.view_only++;
    }
  }

  const total = Object.values(dropoffs).reduce((s, v) => s + v, 0);

  return {
    counts: dropoffs,
    rates: {
      view_only: safe(dropoffs.view_only, total) * 100,
      added_not_checkout: safe(dropoffs.added_not_checkout, total) * 100,
      checkout_not_purchase: safe(dropoffs.checkout_not_purchase, total) * 100,
      purchased: safe(dropoffs.purchased, total) * 100,
    },
    total,
  };
}

export function computeDropoffsByChannel(events) {
  const byChannel = {};
  for (const e of events) {
    const ch = e.channel;
    if (!ch) continue;
    if (!byChannel[ch]) byChannel[ch] = [];
    byChannel[ch].push(e);
  }

  const channels = {};
  for (const [channel, channelEvents] of Object.entries(byChannel)) {
    channels[channel] = computeDropoffs(channelEvents);
  }

  return {
    overall: computeDropoffs(events),
    channels,
  };
}
