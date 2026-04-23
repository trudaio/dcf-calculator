# Attribution Engine

Marketing attribution engine that replicates Triple Whale's formulas and models. Computes e-commerce metrics (ROAS, MER, CAC, LTV, etc.) and runs 6 attribution models including Triple Whale's proprietary per-channel attribution.

## Quick Start

```bash
cd attribution-engine
npm install
npm run dev        # Express on port 3002 with --watch
npm run start      # Production
npm test           # 86 tests
```

## API Endpoints

All endpoints accept POST with custom data or GET `/demo` for sample output.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/metrics/compute` | POST | Compute all 18 e-commerce metrics |
| `/api/metrics/demo` | GET | Demo with sample data |
| `/api/attribution/compute` | POST | Run single attribution model |
| `/api/attribution/compare` | POST | Compare all 6 models side-by-side |
| `/api/attribution/demo` | GET | Demo with 8 customer journeys |
| `/api/blended/compute` | POST | Blended cross-channel stats |
| `/api/blended/over-time` | POST | Daily/weekly/monthly aggregation |
| `/api/blended/demo` | GET | Demo with 3-day channel data |
| `/api/customer/ltv` | POST | LTV overall + per channel + windowed |
| `/api/customer/cohorts` | POST | Cohort analysis + repeat rate |
| `/api/customer/demo` | GET | Demo with all customer metrics |

## Metrics (18 formulas)

All formulas match [Triple Whale's documented definitions](https://triplewhale.readme.io).

| Metric | Formula |
|--------|---------|
| **ROAS** | Revenue / Ad Spend |
| **Blended ROAS** | Order Revenue / Total Ad Spend |
| **NC ROAS** | New Customer Revenue / (Ad Spend + Custom Ad Spend) |
| **MER** | (Ad Spend + Custom Ad Spend) / Order Revenue |
| **CPA** | Total Cost / New Customers |
| **CAC** | (Marketing + Wages + Software + Overhead) / Customers |
| **LTV** | Order Revenue / Unique Customers |
| **CLV** | Avg Frequency × Avg Value × Avg Margin × Avg Lifespan |
| **AOV** | Total Revenue / Total Orders |
| **CVR** | (Conversions / Visitors) × 100 |
| **Net Profit** | Revenue − Refunds − Ad Spend − COGS − Fees − Shipping − Taxes |
| **Breakeven ROAS** | 1 / Profit Margin |
| **CTR** | (Clicks / Impressions) × 100 |
| **CPM** | (Ad Spend / Impressions) × 1000 |
| **Order Revenue** | Gross Sales + Shipping + Taxes − Discounts |
| **NCPA** | (Ad Spend + Custom Ad Spend) / New Customer Orders |
| **Bounce Rate** | (Bounces / Sessions) × 100 |
| **LTV:CAC Ratio** | LTV / CAC |

## Attribution Models (6)

| Model | How it works |
|-------|-------------|
| **First-Click** | 100% credit to the first touchpoint |
| **Last-Click** | 100% credit to the last touchpoint |
| **Linear** | Equal credit across all touchpoints |
| **Position-Based** | 40% first, 40% last, 20% distributed across middle |
| **Time-Decay** | Exponential decay with configurable half-life (default 7 days) |
| **Triple Attribution** | 100% credit to last click **per channel independently** — each channel gets full conversion value without competing against other channels |

### Triple Attribution explained

Unlike standard models where channels compete for credit, Triple Attribution evaluates each channel independently. If a customer clicked Meta, then Google, then TikTok before purchasing $100:

| Model | Meta | Google | TikTok | Total |
|-------|------|--------|--------|-------|
| First-Click | $100 | $0 | $0 | $100 |
| Last-Click | $0 | $0 | $100 | $100 |
| Linear | $33 | $33 | $33 | $100 |
| **Triple Attribution** | **$100** | **$100** | **$100** | **$300** |

This lets you evaluate each platform's contribution without forcing cross-channel competition.

## Architecture

```
attribution-engine/
├── index.js                    # Express REST API (port 3002)
├── domain/
│   ├── metrics.js              # 18 e-commerce metric formulas
│   ├── attributionModels.js    # 5 standard models + dispatcher
│   ├── channelAttribution.js   # Triple Attribution (per-channel)
│   ├── blendedStats.js         # Cross-channel aggregation
│   └── customerMetrics.js      # LTV, CLV, cohort analysis
├── services/
│   ├── journeyBuilder.js       # Customer journey construction
│   └── attributionService.js   # Orchestrator for all models
├── data/
│   └── dummyData.js            # Realistic sample data (8 customers, 4 channels)
└── __tests__/                  # 86 tests covering all modules
```

## Example: Compute Metrics

```bash
curl -X POST http://localhost:3002/api/metrics/compute \
  -H "Content-Type: application/json" \
  -d '{
    "grossSales": 50000, "shipping": 3500, "taxes": 4000, "discounts": 2500,
    "adSpend": 12000, "customAdSpend": 1500,
    "newCustomers": 230, "totalOrders": 420, "sessions": 18000,
    "profitMargin": 0.25
  }'
```

## Example: Compare Attribution Models

```bash
curl -X POST http://localhost:3002/api/attribution/compare \
  -H "Content-Type: application/json" \
  -d '{ "events": [...your pixel events...] }'
```

Or use dummy data:
```bash
curl http://localhost:3002/api/attribution/demo
```

## Tech Stack

- **Runtime**: Node.js (ESM)
- **Server**: Express 4
- **Tests**: Vitest
- **No database** — stateless computation engine, bring your own data
