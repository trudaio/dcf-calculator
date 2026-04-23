const TOUCHPOINT_TYPES = new Set(['click', 'view', 'impression', 'email_open', 'email_click', 'sms_click', 'social_click', 'referral', 'organic', 'direct']);
const CONVERSION_TYPES = new Set(['purchase', 'order', 'subscription']);

export function buildJourney(events, customerId) {
  const sorted = [...events]
    .filter((e) => e.customerId === customerId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const touchpoints = [];
  const conversions = [];

  for (const event of sorted) {
    const type = event.type || 'click';
    if (CONVERSION_TYPES.has(type)) {
      conversions.push(event);
    } else if (TOUCHPOINT_TYPES.has(type)) {
      touchpoints.push(event);
    }
  }

  return { customerId, touchpoints, conversions };
}

export function buildJourneys(allEvents, { includeNonConverting = false } = {}) {
  const byCustomer = {};

  for (const event of allEvents) {
    const cid = event.customerId;
    if (!byCustomer[cid]) byCustomer[cid] = [];
    byCustomer[cid].push(event);
  }

  const journeys = [];
  for (const [customerId, events] of Object.entries(byCustomer)) {
    const journey = buildJourney(events, customerId);
    if (journey.conversions.length > 0 || includeNonConverting) {
      journeys.push(journey);
    }
  }

  return journeys;
}

export function filterByWindow(journey, windowDays) {
  if (!journey.conversions.length) return { ...journey, touchpoints: [] };

  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const firstConversion = new Date(journey.conversions[0].timestamp).getTime();

  const filtered = journey.touchpoints.filter((t) => {
    const tTime = new Date(t.timestamp).getTime();
    return firstConversion - tTime <= windowMs && tTime <= firstConversion;
  });

  return { ...journey, touchpoints: filtered };
}

export function splitByConversion(journey) {
  if (!journey.conversions.length) return [];

  const sessions = [];
  let tpIndex = 0;

  for (const conversion of journey.conversions) {
    const convTime = new Date(conversion.timestamp).getTime();
    const sessionTouchpoints = [];

    while (tpIndex < journey.touchpoints.length) {
      const tp = journey.touchpoints[tpIndex];
      if (new Date(tp.timestamp).getTime() <= convTime) {
        sessionTouchpoints.push(tp);
        tpIndex++;
      } else {
        break;
      }
    }

    sessions.push({
      customerId: journey.customerId,
      touchpoints: sessionTouchpoints,
      conversion,
    });
  }

  return sessions;
}
