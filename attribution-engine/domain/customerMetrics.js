const safe = (n, d) => (d === 0 ? 0 : n / d);

export function computeLtv(orders) {
  if (!orders.length) return { ltv: 0, uniqueCustomers: 0, totalRevenue: 0 };

  const customers = new Set(orders.map((o) => o.customerId));
  const totalRevenue = orders.reduce((sum, o) => sum + (o.revenue || 0), 0);

  return {
    ltv: safe(totalRevenue, customers.size),
    uniqueCustomers: customers.size,
    totalRevenue,
  };
}

export function computeLtvByChannel(orders, attributionData) {
  const channelCustomers = {};

  for (const attr of attributionData) {
    const ch = attr.acquisitionChannel;
    if (!channelCustomers[ch]) channelCustomers[ch] = new Set();
    channelCustomers[ch].add(attr.customerId);
  }

  const customerRevenue = {};
  for (const order of orders) {
    if (!customerRevenue[order.customerId]) customerRevenue[order.customerId] = 0;
    customerRevenue[order.customerId] += order.revenue || 0;
  }

  const result = {};
  for (const [channel, customerSet] of Object.entries(channelCustomers)) {
    let totalRevenue = 0;
    for (const cid of customerSet) {
      totalRevenue += customerRevenue[cid] || 0;
    }
    result[channel] = {
      ltv: safe(totalRevenue, customerSet.size),
      customers: customerSet.size,
      totalRevenue,
    };
  }

  return result;
}

export function computeCohortMetrics(orders) {
  if (!orders.length) return [];

  const customerFirstOrder = {};
  const customerOrders = {};

  for (const order of orders) {
    const cid = order.customerId;
    const date = new Date(order.date || order.timestamp);

    if (!customerFirstOrder[cid] || date < customerFirstOrder[cid]) {
      customerFirstOrder[cid] = date;
    }

    if (!customerOrders[cid]) customerOrders[cid] = [];
    customerOrders[cid].push(order);
  }

  const cohorts = {};
  for (const [cid, firstDate] of Object.entries(customerFirstOrder)) {
    const cohortKey = firstDate.toISOString().slice(0, 7);
    if (!cohorts[cohortKey]) cohorts[cohortKey] = [];
    cohorts[cohortKey].push(cid);
  }

  return Object.entries(cohorts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cohort, customerIds]) => {
      let totalRevenue = 0;
      let totalOrders = 0;
      let repeatCustomers = 0;

      for (const cid of customerIds) {
        const ords = customerOrders[cid];
        totalOrders += ords.length;
        totalRevenue += ords.reduce((s, o) => s + (o.revenue || 0), 0);
        if (ords.length > 1) repeatCustomers++;
      }

      return {
        cohort,
        customers: customerIds.length,
        totalRevenue,
        totalOrders,
        avgOrdersPerCustomer: safe(totalOrders, customerIds.length),
        avgRevenuePerCustomer: safe(totalRevenue, customerIds.length),
        repeatRate: safe(repeatCustomers, customerIds.length) * 100,
      };
    });
}

export function computeRepeatRate(orders) {
  const customerOrderCount = {};
  for (const order of orders) {
    customerOrderCount[order.customerId] = (customerOrderCount[order.customerId] || 0) + 1;
  }

  const total = Object.keys(customerOrderCount).length;
  const repeat = Object.values(customerOrderCount).filter((c) => c > 1).length;

  return {
    totalCustomers: total,
    repeatCustomers: repeat,
    repeatRate: safe(repeat, total) * 100,
  };
}

export function computeWindowedLtv(orders, windowDays) {
  if (!orders.length) return { ltv: 0, uniqueCustomers: 0, totalRevenue: 0, windowDays };

  const customerFirstOrder = {};
  for (const order of orders) {
    const cid = order.customerId;
    const date = new Date(order.date || order.timestamp);
    if (!customerFirstOrder[cid] || date < customerFirstOrder[cid]) {
      customerFirstOrder[cid] = date;
    }
  }

  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  let totalRevenue = 0;
  const customers = new Set();

  for (const order of orders) {
    const cid = order.customerId;
    const firstDate = customerFirstOrder[cid];
    const orderDate = new Date(order.date || order.timestamp);

    if (orderDate.getTime() - firstDate.getTime() <= windowMs) {
      totalRevenue += order.revenue || 0;
      customers.add(cid);
    }
  }

  return {
    ltv: safe(totalRevenue, customers.size),
    uniqueCustomers: customers.size,
    totalRevenue,
    windowDays,
  };
}
