function sorted(touchpoints) {
  return [...touchpoints].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function tripleAttribution(touchpoints, conversionValue) {
  if (!touchpoints.length) return { channels: {}, total: 0 };

  const tp = sorted(touchpoints);
  const byChannel = {};

  for (const t of tp) {
    const ch = t.channel;
    if (!byChannel[ch]) byChannel[ch] = [];
    byChannel[ch].push(t);
  }

  const channels = {};
  for (const [channel, events] of Object.entries(byChannel)) {
    const lastEvent = events[events.length - 1];
    channels[channel] = {
      credit: conversionValue,
      lastTouchpoint: lastEvent,
      touchpointCount: events.length,
    };
  }

  return {
    channels,
    total: Object.keys(channels).length * conversionValue,
  };
}

export function tripleAttributionWithWindow(touchpoints, conversionValue, windowDays, conversionTimestamp = null) {
  const convTime = conversionTimestamp
    ? new Date(conversionTimestamp).getTime()
    : Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  const filtered = touchpoints.filter((t) => {
    const tTime = new Date(t.timestamp).getTime();
    return convTime - tTime <= windowMs && tTime <= convTime;
  });

  return tripleAttribution(filtered, conversionValue);
}

export function tripleAttributionBatch(journeys) {
  const channelTotals = {};

  for (const journey of journeys) {
    const { touchpoints, conversionValue } = journey;
    const result = tripleAttribution(touchpoints, conversionValue);

    for (const [channel, data] of Object.entries(result.channels)) {
      if (!channelTotals[channel]) {
        channelTotals[channel] = { attributedRevenue: 0, conversions: 0, touchpoints: 0 };
      }
      channelTotals[channel].attributedRevenue += data.credit;
      channelTotals[channel].conversions += 1;
      channelTotals[channel].touchpoints += data.touchpointCount;
    }
  }

  return channelTotals;
}
