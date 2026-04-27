const safe = (n, d) => (d === 0 ? 0 : n / d);

function computeChannelMetrics(ch) {
  return {
    channel: ch.channel,
    spend: ch.spend || 0,
    revenue: ch.revenue || 0,
    orders: ch.orders || 0,
    newCustomerOrders: ch.newCustomerOrders || 0,
    sessions: ch.sessions || 0,
    roas: safe(ch.revenue, ch.spend),
    cpa: safe(ch.spend, ch.orders),
    ncpa: safe(ch.spend, ch.newCustomerOrders),
    aov: safe(ch.revenue, ch.orders),
    cvr: safe(ch.orders, ch.sessions) * 100,
  };
}

export function computeBlendedStats(channelStats) {
  const totals = { spend: 0, revenue: 0, orders: 0, newCustomerOrders: 0, sessions: 0 };

  for (const ch of channelStats) {
    totals.spend += ch.spend || 0;
    totals.revenue += ch.revenue || 0;
    totals.orders += ch.orders || 0;
    totals.newCustomerOrders += ch.newCustomerOrders || 0;
    totals.sessions += ch.sessions || 0;
  }

  return {
    blended: {
      totalSpend: totals.spend,
      totalRevenue: totals.revenue,
      totalOrders: totals.orders,
      totalNewCustomerOrders: totals.newCustomerOrders,
      totalSessions: totals.sessions,
      blendedRoas: safe(totals.revenue, totals.spend),
      blendedCpa: safe(totals.spend, totals.orders),
      blendedMer: safe(totals.spend, totals.revenue),
      blendedNcpa: safe(totals.spend, totals.newCustomerOrders),
      blendedAov: safe(totals.revenue, totals.orders),
      blendedCvr: safe(totals.orders, totals.sessions) * 100,
    },
    channels: channelStats.map(computeChannelMetrics),
  };
}

export function computeBlendedStatsOverTime(dailyChannelStats) {
  const byDate = {};

  for (const entry of dailyChannelStats) {
    const date = entry.date;
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(entry);
  }

  const daily = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, channels]) => ({
      date,
      ...computeBlendedStats(channels),
    }));

  const weekly = aggregateByPeriod(dailyChannelStats, (d) => {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(dt.setDate(diff)).toISOString().slice(0, 10);
  });

  const monthly = aggregateByPeriod(dailyChannelStats, (d) => d.slice(0, 7));

  return { daily, weekly, monthly };
}

function aggregateByPeriod(entries, periodFn) {
  const buckets = {};

  for (const entry of entries) {
    const period = periodFn(entry.date);
    const channel = entry.channel || 'unknown';
    const key = `${period}|${channel}`;

    if (!buckets[key]) {
      buckets[key] = { date: period, channel, spend: 0, revenue: 0, orders: 0, newCustomerOrders: 0, sessions: 0 };
    }
    buckets[key].spend += entry.spend || 0;
    buckets[key].revenue += entry.revenue || 0;
    buckets[key].orders += entry.orders || 0;
    buckets[key].newCustomerOrders += entry.newCustomerOrders || 0;
    buckets[key].sessions += entry.sessions || 0;
  }

  const byPeriod = {};
  for (const agg of Object.values(buckets)) {
    if (!byPeriod[agg.date]) byPeriod[agg.date] = [];
    byPeriod[agg.date].push(agg);
  }

  return Object.entries(byPeriod)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, channels]) => ({
      date,
      ...computeBlendedStats(channels),
    }));
}
