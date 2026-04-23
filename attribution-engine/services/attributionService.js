import { applyModel, listModels } from '../domain/attributionModels.js';
import { tripleAttribution, tripleAttributionWithWindow } from '../domain/channelAttribution.js';
import { markovAttribution, shapleyAttribution, journeysToPaths } from '../domain/dataDrivenModels.js';
import { buildJourneys, filterByWindow, splitByConversion } from './journeyBuilder.js';
import * as metrics from '../domain/metrics.js';

function aggregateByChannel(attributedTouchpoints) {
  const channels = {};

  for (const tp of attributedTouchpoints) {
    const ch = tp.channel || 'unknown';
    if (!channels[ch]) {
      channels[ch] = { channel: ch, attributedRevenue: 0, touchpoints: 0 };
    }
    channels[ch].attributedRevenue += tp.credit || 0;
    channels[ch].touchpoints += 1;
  }

  return channels;
}

export function computeAttribution(journeys, model, options = {}) {
  const windowDays = options.windowDays;
  const channelTotals = {};
  let totalAttributed = 0;
  let totalConversions = 0;

  for (const journey of journeys) {
    const j = windowDays ? filterByWindow(journey, windowDays) : journey;
    const sessions = splitByConversion(j);

    for (const session of sessions) {
      if (!session.touchpoints.length) continue;

      const value = session.conversion.revenue || session.conversion.value || 0;

      if (model === 'tripleAttribution') {
        const result = windowDays
          ? tripleAttributionWithWindow(session.touchpoints, value, windowDays, session.conversion.timestamp)
          : tripleAttribution(session.touchpoints, value);

        for (const [ch, data] of Object.entries(result.channels)) {
          if (!channelTotals[ch]) {
            channelTotals[ch] = { channel: ch, attributedRevenue: 0, conversions: 0, touchpoints: 0 };
          }
          channelTotals[ch].attributedRevenue += data.credit;
          channelTotals[ch].conversions += 1;
          channelTotals[ch].touchpoints += data.touchpointCount;
        }
        totalConversions += 1;
      } else {
        const attributed = applyModel(model, session.touchpoints, value, options);
        const byChannel = aggregateByChannel(attributed);

        for (const [ch, data] of Object.entries(byChannel)) {
          if (!channelTotals[ch]) {
            channelTotals[ch] = { channel: ch, attributedRevenue: 0, conversions: 0, touchpoints: 0 };
          }
          channelTotals[ch].attributedRevenue += data.attributedRevenue;
          channelTotals[ch].touchpoints += data.touchpoints;
        }
        totalAttributed += value;
        totalConversions += 1;
      }
    }
  }

  const channelList = Object.values(channelTotals).map((ch) => ({
    ...ch,
    roas: options.channelSpend?.[ch.channel]
      ? metrics.roas(ch.attributedRevenue, options.channelSpend[ch.channel])
      : null,
    cpa: ch.conversions
      ? metrics.cpa(options.channelSpend?.[ch.channel] || 0, ch.conversions)
      : null,
  }));

  return {
    model,
    totalConversions,
    channels: channelList,
  };
}

export function computeDataDriven(journeys, model, options = {}, { allJourneys } = {}) {
  const windowDays = options.windowDays;
  const source = allJourneys || journeys;
  const filtered = windowDays
    ? source.map((j) => filterByWindow(j, windowDays))
    : source;

  const paths = journeysToPaths(filtered);
  const convertingPaths = paths.filter((p) => p.converted);
  const totalRevenue = convertingPaths.reduce((s, p) => s + p.value, 0);

  let result;
  if (model === 'markov') {
    result = markovAttribution(paths);
  } else if (model === 'shapley') {
    result = shapleyAttribution(paths, {
      monteCarlo: options.monteCarlo,
      samples: options.samples,
    });
  } else {
    throw new Error(`Unknown data-driven model: ${model}`);
  }

  const channels = Object.entries(result.channels).map(([channel, data]) => ({
    channel,
    ...data,
    attributedRevenue: data.share * totalRevenue,
    conversions: Math.round(data.share * convertingPaths.length),
    roas: options.channelSpend?.[channel]
      ? metrics.roas(data.share * totalRevenue, options.channelSpend[channel])
      : null,
  }));

  return {
    model,
    totalConversions: convertingPaths.length,
    totalRevenue,
    baselineConversion: result.baselineConversion || null,
    channels,
  };
}

export function computeAllModels(journeys, options = {}) {
  const standardModels = listModels();
  const allModels = [...standardModels, 'tripleAttribution'];

  const results = {};
  for (const model of allModels) {
    results[model] = computeAttribution(journeys, model, options);
  }

  results.markov = computeDataDriven(journeys, 'markov', options, { allJourneys: options._allJourneys });
  results.shapley = computeDataDriven(journeys, 'shapley', options, { allJourneys: options._allJourneys });

  return results;
}

export function computeFromEvents(events, model, options = {}) {
  const journeys = buildJourneys(events);
  const allJourneys = buildJourneys(events, { includeNonConverting: true });

  if (model === 'all') return computeAllModels(journeys, { ...options, _allJourneys: allJourneys });
  if (model === 'markov' || model === 'shapley') return computeDataDriven(journeys, model, options, { allJourneys });
  return computeAttribution(journeys, model, options);
}
