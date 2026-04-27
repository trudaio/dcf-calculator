export const dummyEvents = [
  // C001: Meta ad → view_item → Google search → add_to_cart → begin_checkout → purchase
  { customerId: 'C001', type: 'click', channel: 'meta', campaign: 'summer_sale', adId: 'ad_101', timestamp: '2026-04-01T10:00:00Z', source: 'facebook', medium: 'cpc' },
  { customerId: 'C001', type: 'view_item', channel: 'meta', timestamp: '2026-04-01T10:02:00Z', productId: 'SKU-101', productName: 'Running Shoes' },
  { customerId: 'C001', type: 'click', channel: 'google', campaign: 'brand_search', adId: 'ad_201', timestamp: '2026-04-03T14:30:00Z', source: 'google', medium: 'cpc' },
  { customerId: 'C001', type: 'view_item', channel: 'google', timestamp: '2026-04-03T14:32:00Z', productId: 'SKU-101', productName: 'Running Shoes' },
  { customerId: 'C001', type: 'add_to_cart', channel: 'google', timestamp: '2026-04-03T14:35:00Z', productId: 'SKU-101' },
  { customerId: 'C001', type: 'begin_checkout', channel: 'direct', timestamp: '2026-04-05T16:00:00Z' },
  { customerId: 'C001', type: 'purchase', channel: 'direct', timestamp: '2026-04-05T16:05:00Z', revenue: 120.00, orderId: 'ORD-001' },

  // C002: Email → view_item → Meta retarget → add_to_cart → purchase (skipped begin_checkout)
  { customerId: 'C002', type: 'email_click', channel: 'email', campaign: 'welcome_series', timestamp: '2026-04-02T08:05:00Z' },
  { customerId: 'C002', type: 'view_item', channel: 'email', timestamp: '2026-04-02T08:06:00Z', productId: 'SKU-202', productName: 'Yoga Mat' },
  { customerId: 'C002', type: 'click', channel: 'meta', campaign: 'retargeting_q2', adId: 'ad_102', timestamp: '2026-04-04T11:20:00Z', source: 'instagram', medium: 'cpc' },
  { customerId: 'C002', type: 'add_to_cart', channel: 'meta', timestamp: '2026-04-04T11:25:00Z', productId: 'SKU-202' },
  { customerId: 'C002', type: 'begin_checkout', channel: 'direct', timestamp: '2026-04-05T20:25:00Z' },
  { customerId: 'C002', type: 'purchase', channel: 'direct', timestamp: '2026-04-05T20:30:00Z', revenue: 85.50, orderId: 'ORD-002' },

  // C003: TikTok view → Google → view_item → Meta → add_to_cart → begin_checkout → purchase
  { customerId: 'C003', type: 'view', channel: 'tiktok', campaign: 'influencer_collab', adId: 'ad_302', timestamp: '2026-03-25T12:00:00Z' },
  { customerId: 'C003', type: 'click', channel: 'google', campaign: 'generic_search', adId: 'ad_202', timestamp: '2026-03-28T15:00:00Z' },
  { customerId: 'C003', type: 'view_item', channel: 'google', timestamp: '2026-03-28T15:02:00Z', productId: 'SKU-303', productName: 'Protein Powder' },
  { customerId: 'C003', type: 'click', channel: 'meta', campaign: 'lookalike_q2', adId: 'ad_103', timestamp: '2026-04-01T09:00:00Z' },
  { customerId: 'C003', type: 'view_item', channel: 'meta', timestamp: '2026-04-01T09:02:00Z', productId: 'SKU-303', productName: 'Protein Powder' },
  { customerId: 'C003', type: 'add_to_cart', channel: 'meta', timestamp: '2026-04-01T09:05:00Z', productId: 'SKU-303' },
  { customerId: 'C003', type: 'click', channel: 'google', campaign: 'brand_search', adId: 'ad_203', timestamp: '2026-04-03T17:00:00Z' },
  { customerId: 'C003', type: 'begin_checkout', channel: 'google', timestamp: '2026-04-03T17:05:00Z' },
  { customerId: 'C003', type: 'purchase', channel: 'direct', timestamp: '2026-04-04T10:00:00Z', revenue: 250.00, orderId: 'ORD-003' },

  // C004: Organic → view_item → add_to_cart → begin_checkout → purchase (quick funnel)
  { customerId: 'C004', type: 'organic', channel: 'organic', timestamp: '2026-04-06T10:00:00Z', source: 'google', medium: 'organic' },
  { customerId: 'C004', type: 'view_item', channel: 'organic', timestamp: '2026-04-06T10:02:00Z', productId: 'SKU-404', productName: 'Water Bottle' },
  { customerId: 'C004', type: 'add_to_cart', channel: 'organic', timestamp: '2026-04-06T10:10:00Z', productId: 'SKU-404' },
  { customerId: 'C004', type: 'begin_checkout', channel: 'organic', timestamp: '2026-04-06T10:15:00Z' },
  { customerId: 'C004', type: 'purchase', channel: 'direct', timestamp: '2026-04-06T10:20:00Z', revenue: 45.00, orderId: 'ORD-004' },

  // C005: Meta → purchase → Meta retarget → view_item → add_to_cart → purchase (repeat)
  { customerId: 'C005', type: 'click', channel: 'meta', campaign: 'spring_promo', adId: 'ad_104', timestamp: '2026-03-15T14:00:00Z' },
  { customerId: 'C005', type: 'view_item', channel: 'meta', timestamp: '2026-03-15T14:03:00Z', productId: 'SKU-505', productName: 'Resistance Bands' },
  { customerId: 'C005', type: 'add_to_cart', channel: 'meta', timestamp: '2026-03-15T14:10:00Z', productId: 'SKU-505' },
  { customerId: 'C005', type: 'begin_checkout', channel: 'direct', timestamp: '2026-03-16T08:50:00Z' },
  { customerId: 'C005', type: 'purchase', channel: 'direct', timestamp: '2026-03-16T09:00:00Z', revenue: 75.00, orderId: 'ORD-005' },
  { customerId: 'C005', type: 'click', channel: 'meta', campaign: 'retargeting_q2', adId: 'ad_105', timestamp: '2026-04-10T11:00:00Z' },
  { customerId: 'C005', type: 'view_item', channel: 'meta', timestamp: '2026-04-10T11:02:00Z', productId: 'SKU-506', productName: 'Foam Roller' },
  { customerId: 'C005', type: 'email_click', channel: 'email', campaign: 'loyalty_program', timestamp: '2026-04-12T08:00:00Z' },
  { customerId: 'C005', type: 'add_to_cart', channel: 'email', timestamp: '2026-04-12T08:05:00Z', productId: 'SKU-506' },
  { customerId: 'C005', type: 'begin_checkout', channel: 'direct', timestamp: '2026-04-13T14:50:00Z' },
  { customerId: 'C005', type: 'purchase', channel: 'direct', timestamp: '2026-04-13T15:00:00Z', revenue: 130.00, orderId: 'ORD-006' },

  // C006: Google → view_item → TikTok → view_item → add_to_cart → begin_checkout → purchase
  { customerId: 'C006', type: 'click', channel: 'google', campaign: 'shopping_ads', adId: 'ad_204', timestamp: '2026-04-08T10:00:00Z' },
  { customerId: 'C006', type: 'view_item', channel: 'google', timestamp: '2026-04-08T10:02:00Z', productId: 'SKU-101', productName: 'Running Shoes' },
  { customerId: 'C006', type: 'click', channel: 'tiktok', campaign: 'viral_video', adId: 'ad_303', timestamp: '2026-04-10T16:00:00Z' },
  { customerId: 'C006', type: 'view_item', channel: 'tiktok', timestamp: '2026-04-10T16:02:00Z', productId: 'SKU-101', productName: 'Running Shoes' },
  { customerId: 'C006', type: 'add_to_cart', channel: 'tiktok', timestamp: '2026-04-10T16:05:00Z', productId: 'SKU-101' },
  { customerId: 'C006', type: 'begin_checkout', channel: 'direct', timestamp: '2026-04-11T11:50:00Z' },
  { customerId: 'C006', type: 'purchase', channel: 'direct', timestamp: '2026-04-11T12:00:00Z', revenue: 95.00, orderId: 'ORD-007' },

  // C007: Meta → view_item → add_to_cart → begin_checkout → purchase (single channel fast)
  { customerId: 'C007', type: 'click', channel: 'meta', campaign: 'summer_sale', adId: 'ad_106', timestamp: '2026-04-14T09:00:00Z' },
  { customerId: 'C007', type: 'view_item', channel: 'meta', timestamp: '2026-04-14T09:02:00Z', productId: 'SKU-707', productName: 'Gym Bag' },
  { customerId: 'C007', type: 'add_to_cart', channel: 'meta', timestamp: '2026-04-14T09:10:00Z', productId: 'SKU-707' },
  { customerId: 'C007', type: 'begin_checkout', channel: 'meta', timestamp: '2026-04-14T09:35:00Z' },
  { customerId: 'C007', type: 'purchase', channel: 'direct', timestamp: '2026-04-14T09:45:00Z', revenue: 60.00, orderId: 'ORD-008' },

  // C008: Google → view_item → Email → Meta → view_item → TikTok → add_to_cart → begin_checkout → purchase
  { customerId: 'C008', type: 'click', channel: 'google', campaign: 'generic_search', adId: 'ad_205', timestamp: '2026-04-01T08:00:00Z' },
  { customerId: 'C008', type: 'view_item', channel: 'google', timestamp: '2026-04-01T08:02:00Z', productId: 'SKU-808', productName: 'Smartwatch' },
  { customerId: 'C008', type: 'email_click', channel: 'email', campaign: 'newsletter', timestamp: '2026-04-05T10:00:00Z' },
  { customerId: 'C008', type: 'click', channel: 'meta', campaign: 'retargeting_q2', adId: 'ad_107', timestamp: '2026-04-08T14:00:00Z' },
  { customerId: 'C008', type: 'view_item', channel: 'meta', timestamp: '2026-04-08T14:02:00Z', productId: 'SKU-808', productName: 'Smartwatch' },
  { customerId: 'C008', type: 'click', channel: 'tiktok', campaign: 'influencer_collab', adId: 'ad_304', timestamp: '2026-04-12T11:00:00Z' },
  { customerId: 'C008', type: 'add_to_cart', channel: 'tiktok', timestamp: '2026-04-12T11:05:00Z', productId: 'SKU-808' },
  { customerId: 'C008', type: 'begin_checkout', channel: 'direct', timestamp: '2026-04-13T15:50:00Z' },
  { customerId: 'C008', type: 'purchase', channel: 'direct', timestamp: '2026-04-13T16:00:00Z', revenue: 180.00, orderId: 'ORD-009' },

  // Non-converting visitors (needed for data-driven models)
  // V01: Meta → view_item only (bounced after viewing)
  { customerId: 'V001', type: 'click', channel: 'meta', campaign: 'summer_sale', timestamp: '2026-04-02T11:00:00Z' },
  { customerId: 'V001', type: 'view_item', channel: 'meta', timestamp: '2026-04-02T11:02:00Z', productId: 'SKU-101' },
  // V02: Google → view_item → TikTok → view_item (browsed, no cart)
  { customerId: 'V002', type: 'click', channel: 'google', campaign: 'generic_search', timestamp: '2026-04-03T09:00:00Z' },
  { customerId: 'V002', type: 'view_item', channel: 'google', timestamp: '2026-04-03T09:02:00Z', productId: 'SKU-303' },
  { customerId: 'V002', type: 'view', channel: 'tiktok', campaign: 'viral_video', timestamp: '2026-04-04T15:00:00Z' },
  { customerId: 'V002', type: 'view_item', channel: 'tiktok', timestamp: '2026-04-04T15:02:00Z', productId: 'SKU-303' },
  // V03: TikTok → view_item → Meta → add_to_cart → abandoned (cart abandonment)
  { customerId: 'V003', type: 'view', channel: 'tiktok', campaign: 'influencer_collab', timestamp: '2026-04-05T10:00:00Z' },
  { customerId: 'V003', type: 'view_item', channel: 'tiktok', timestamp: '2026-04-05T10:02:00Z', productId: 'SKU-505' },
  { customerId: 'V003', type: 'click', channel: 'meta', campaign: 'retargeting_q2', timestamp: '2026-04-07T14:00:00Z' },
  { customerId: 'V003', type: 'add_to_cart', channel: 'meta', timestamp: '2026-04-07T14:05:00Z', productId: 'SKU-505' },
  // V04: Email → view_item → add_to_cart → begin_checkout → abandoned (checkout abandonment)
  { customerId: 'V004', type: 'email_click', channel: 'email', campaign: 'newsletter', timestamp: '2026-04-06T08:00:00Z' },
  { customerId: 'V004', type: 'view_item', channel: 'email', timestamp: '2026-04-06T08:02:00Z', productId: 'SKU-707' },
  { customerId: 'V004', type: 'add_to_cart', channel: 'email', timestamp: '2026-04-06T08:10:00Z', productId: 'SKU-707' },
  { customerId: 'V004', type: 'begin_checkout', channel: 'email', timestamp: '2026-04-06T08:15:00Z' },
  // V05: Google → view_item → Google → view_item (multiple views, no cart)
  { customerId: 'V005', type: 'click', channel: 'google', campaign: 'brand_search', timestamp: '2026-04-08T10:00:00Z' },
  { customerId: 'V005', type: 'view_item', channel: 'google', timestamp: '2026-04-08T10:02:00Z', productId: 'SKU-808' },
  { customerId: 'V005', type: 'click', channel: 'google', campaign: 'shopping_ads', timestamp: '2026-04-09T12:00:00Z' },
  { customerId: 'V005', type: 'view_item', channel: 'google', timestamp: '2026-04-09T12:02:00Z', productId: 'SKU-808' },
  // V06: Meta → view_item → Email → Google → add_to_cart → abandoned (long journey, cart abandon)
  { customerId: 'V006', type: 'click', channel: 'meta', campaign: 'lookalike_q2', timestamp: '2026-04-01T09:00:00Z' },
  { customerId: 'V006', type: 'view_item', channel: 'meta', timestamp: '2026-04-01T09:02:00Z', productId: 'SKU-202' },
  { customerId: 'V006', type: 'email_click', channel: 'email', campaign: 'welcome_series', timestamp: '2026-04-04T11:00:00Z' },
  { customerId: 'V006', type: 'click', channel: 'google', campaign: 'generic_search', timestamp: '2026-04-07T16:00:00Z' },
  { customerId: 'V006', type: 'add_to_cart', channel: 'google', timestamp: '2026-04-07T16:05:00Z', productId: 'SKU-202' },
  // V07: TikTok → view_item only (bounced)
  { customerId: 'V007', type: 'view', channel: 'tiktok', campaign: 'viral_video', timestamp: '2026-04-10T13:00:00Z' },
  { customerId: 'V007', type: 'view_item', channel: 'tiktok', timestamp: '2026-04-10T13:02:00Z', productId: 'SKU-404' },
  // V08: Meta → view_item → TikTok → view_item → add_to_cart → abandoned
  { customerId: 'V008', type: 'click', channel: 'meta', campaign: 'spring_promo', timestamp: '2026-04-11T09:00:00Z' },
  { customerId: 'V008', type: 'view_item', channel: 'meta', timestamp: '2026-04-11T09:02:00Z', productId: 'SKU-101' },
  { customerId: 'V008', type: 'click', channel: 'tiktok', campaign: 'influencer_collab', timestamp: '2026-04-13T14:00:00Z' },
  { customerId: 'V008', type: 'view_item', channel: 'tiktok', timestamp: '2026-04-13T14:02:00Z', productId: 'SKU-101' },
  { customerId: 'V008', type: 'add_to_cart', channel: 'tiktok', timestamp: '2026-04-13T14:05:00Z', productId: 'SKU-101' },
];

export const dummyOrders = [
  { orderId: 'ORD-001', customerId: 'C001', revenue: 120.00, date: '2026-04-06', grossSales: 110, shipping: 10, taxes: 8, discounts: 8, isNewCustomer: true },
  { orderId: 'ORD-002', customerId: 'C002', revenue: 85.50, date: '2026-04-05', grossSales: 80, shipping: 5.50, taxes: 6, discounts: 6, isNewCustomer: true },
  { orderId: 'ORD-003', customerId: 'C003', revenue: 250.00, date: '2026-04-04', grossSales: 230, shipping: 15, taxes: 18, discounts: 13, isNewCustomer: true },
  { orderId: 'ORD-004', customerId: 'C004', revenue: 45.00, date: '2026-04-06', grossSales: 40, shipping: 5, taxes: 3, discounts: 3, isNewCustomer: true },
  { orderId: 'ORD-005', customerId: 'C005', revenue: 75.00, date: '2026-03-16', grossSales: 68, shipping: 7, taxes: 5, discounts: 5, isNewCustomer: true },
  { orderId: 'ORD-006', customerId: 'C005', revenue: 130.00, date: '2026-04-13', grossSales: 120, shipping: 10, taxes: 9, discounts: 9, isNewCustomer: false },
  { orderId: 'ORD-007', customerId: 'C006', revenue: 95.00, date: '2026-04-11', grossSales: 88, shipping: 7, taxes: 6.50, discounts: 6.50, isNewCustomer: true },
  { orderId: 'ORD-008', customerId: 'C007', revenue: 60.00, date: '2026-04-14', grossSales: 55, shipping: 5, taxes: 4, discounts: 4, isNewCustomer: true },
  { orderId: 'ORD-009', customerId: 'C008', revenue: 180.00, date: '2026-04-13', grossSales: 165, shipping: 12, taxes: 12, discounts: 9, isNewCustomer: true },
];

export const dummyChannelStats = [
  { date: '2026-04-01', channel: 'meta', spend: 850, revenue: 3200, orders: 42, newCustomerOrders: 28, sessions: 4200, impressions: 125000, clicks: 3800 },
  { date: '2026-04-01', channel: 'google', spend: 620, revenue: 2100, orders: 31, newCustomerOrders: 22, sessions: 3100, impressions: 85000, clicks: 2900 },
  { date: '2026-04-01', channel: 'tiktok', spend: 400, revenue: 1500, orders: 18, newCustomerOrders: 15, sessions: 2800, impressions: 200000, clicks: 1800 },
  { date: '2026-04-01', channel: 'email', spend: 50, revenue: 800, orders: 15, newCustomerOrders: 3, sessions: 900, impressions: 12000, clicks: 1100 },

  { date: '2026-04-02', channel: 'meta', spend: 900, revenue: 3500, orders: 45, newCustomerOrders: 30, sessions: 4500, impressions: 130000, clicks: 4100 },
  { date: '2026-04-02', channel: 'google', spend: 580, revenue: 1900, orders: 28, newCustomerOrders: 20, sessions: 2900, impressions: 80000, clicks: 2700 },
  { date: '2026-04-02', channel: 'tiktok', spend: 450, revenue: 1800, orders: 22, newCustomerOrders: 18, sessions: 3200, impressions: 220000, clicks: 2100 },
  { date: '2026-04-02', channel: 'email', spend: 50, revenue: 750, orders: 12, newCustomerOrders: 2, sessions: 850, impressions: 11000, clicks: 950 },

  { date: '2026-04-03', channel: 'meta', spend: 920, revenue: 3800, orders: 48, newCustomerOrders: 32, sessions: 4800, impressions: 135000, clicks: 4300 },
  { date: '2026-04-03', channel: 'google', spend: 650, revenue: 2300, orders: 33, newCustomerOrders: 24, sessions: 3300, impressions: 90000, clicks: 3100 },
  { date: '2026-04-03', channel: 'tiktok', spend: 380, revenue: 1400, orders: 16, newCustomerOrders: 13, sessions: 2600, impressions: 190000, clicks: 1700 },
  { date: '2026-04-03', channel: 'email', spend: 55, revenue: 900, orders: 18, newCustomerOrders: 4, sessions: 1000, impressions: 13000, clicks: 1200 },
];

export const dummyAttributionData = [
  { customerId: 'C001', acquisitionChannel: 'meta' },
  { customerId: 'C002', acquisitionChannel: 'email' },
  { customerId: 'C003', acquisitionChannel: 'tiktok' },
  { customerId: 'C004', acquisitionChannel: 'organic' },
  { customerId: 'C005', acquisitionChannel: 'meta' },
  { customerId: 'C006', acquisitionChannel: 'google' },
  { customerId: 'C007', acquisitionChannel: 'meta' },
  { customerId: 'C008', acquisitionChannel: 'google' },
];
