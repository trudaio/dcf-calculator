const safe = (numerator, denominator) =>
  denominator === 0 ? 0 : numerator / denominator;

export function roas(revenue, adSpend) {
  return safe(revenue, adSpend);
}

export function blendedRoas(orderRevenue, totalAdSpend) {
  return safe(orderRevenue, totalAdSpend);
}

export function ncRoas(newCustomerRevenue, adSpend, customAdSpend = 0) {
  return safe(newCustomerRevenue, adSpend + customAdSpend);
}

export function mer(adSpend, customAdSpend, orderRevenue) {
  return safe(adSpend + customAdSpend, orderRevenue);
}

export function cpa(totalCost, newCustomers) {
  return safe(totalCost, newCustomers);
}

export function cac({ marketingCost = 0, wages = 0, software = 0, overhead = 0 }, customers) {
  return safe(marketingCost + wages + software + overhead, customers);
}

export function ltv(orderRevenue, uniqueCustomers) {
  return safe(orderRevenue, uniqueCustomers);
}

export function clv(avgFreq, avgValue, avgMargin, avgLifespan) {
  return avgFreq * avgValue * avgMargin * avgLifespan;
}

export function aov(totalRevenue, totalOrders) {
  return safe(totalRevenue, totalOrders);
}

export function cvr(conversions, visitors) {
  return safe(conversions, visitors) * 100;
}

export function netProfit(revenue, { refunds = 0, adSpend = 0, cogs = 0, fees = 0, shipping = 0, taxes = 0 } = {}) {
  return revenue - refunds - adSpend - cogs - fees - shipping - taxes;
}

export function breakevenRoas(profitMargin) {
  return safe(1, profitMargin);
}

export function ctr(clicks, impressions) {
  return safe(clicks, impressions) * 100;
}

export function cpm(adSpend, impressions) {
  return safe(adSpend, impressions) * 1000;
}

export function orderRevenue(grossSales, shipping = 0, taxes = 0, discounts = 0) {
  return grossSales + shipping + taxes - discounts;
}

export function ncpa(adSpend, customAdSpend, newCustomerOrders) {
  return safe(adSpend + customAdSpend, newCustomerOrders);
}

export function bounceRate(bounces, sessions) {
  return safe(bounces, sessions) * 100;
}

export function ltvCacRatio(ltvValue, cacValue) {
  return safe(ltvValue, cacValue);
}

export function computeAllMetrics(data) {
  const rev = orderRevenue(data.grossSales, data.shipping, data.taxes, data.discounts);
  const roasVal = roas(rev, data.adSpend);
  const merVal = mer(data.adSpend, data.customAdSpend || 0, rev);
  const cpaVal = cpa(data.totalCost || data.adSpend, data.newCustomers);
  const cacVal = cac(data.costs || {}, data.customers || data.newCustomers);
  const ltvVal = ltv(rev, data.uniqueCustomers || data.customers || 1);
  const aovVal = aov(rev, data.totalOrders);
  const cvrVal = cvr(data.conversions || data.totalOrders, data.visitors || data.sessions);
  const profitVal = netProfit(rev, {
    refunds: data.refunds,
    adSpend: data.adSpend,
    cogs: data.cogs,
    fees: data.fees,
    shipping: data.shippingCost,
    taxes: data.taxCost,
  });

  return {
    orderRevenue: rev,
    roas: roasVal,
    blendedRoas: blendedRoas(rev, (data.adSpend || 0) + (data.customAdSpend || 0)),
    ncRoas: ncRoas(data.newCustomerRevenue || 0, data.adSpend, data.customAdSpend),
    mer: merVal,
    cpa: cpaVal,
    cac: cacVal,
    ltv: ltvVal,
    clv: clv(data.avgFreq || 0, data.avgValue || 0, data.avgMargin || 0, data.avgLifespan || 0),
    aov: aovVal,
    cvr: cvrVal,
    netProfit: profitVal,
    breakevenRoas: breakevenRoas(data.profitMargin || 0),
    ctr: ctr(data.clicks || 0, data.impressions || 0),
    cpm: cpm(data.adSpend, data.impressions || 0),
    ncpa: ncpa(data.adSpend, data.customAdSpend || 0, data.newCustomerOrders || data.newCustomers || 0),
    bounceRate: bounceRate(data.bounces || 0, data.sessions || data.visitors || 0),
    ltvCacRatio: ltvCacRatio(ltvVal, cacVal),
  };
}
