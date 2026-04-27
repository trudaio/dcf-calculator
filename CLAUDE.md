# CLAUDE.md — Financial Analysis Dashboard (DCF Calculator)

## Project Overview
Full-stack financial analysis app: Node.js Express backend + React (Vite) frontend.
Fetches data from **Financial Modeling Prep (FMP) stable API**, computes DCF/FCF/profitability/sensitivity analyses, persists projects as local JSON files (no database).

## Tech Stack
- **Backend**: Node.js (ESM), Express 4
- **Frontend**: React 19, Vite 6, Recharts
- **Data API**: Financial Modeling Prep (`/stable/` endpoints)
- **Persistence**: JSON files in `~/FinancialDashboardProjects/`
- **No database, no TypeScript, no build framework beyond Vite**

## Architecture

### Server (`server/`)
| File | Purpose |
|------|---------|
| `index.js` | Express server, port 3001, REST endpoints |
| `dataProvider.js` | FMP API wrapper (quote, profile, income, cashflow, metrics, ratios) |
| `analysisService.js` | Orchestrator — calls dataProvider + all domain modules |
| `projectStore.js` | CRUD for JSON project files |
| `domain/fcfAnalysis.js` | FCF & CAPEX metrics from cash flow statements |
| `domain/profitability.js` | Margin analysis from income statements |
| `domain/dcfModel.js` | DCF valuation (Gordon Growth Model) |
| `domain/sensitivity.js` | EPS CAGR × P/E terminal matrix |
| `domain/peers.js` | Peer comparison with average PE implied price |

### Client (`client/src/`)
| File | Purpose |
|------|---------|
| `App.jsx` | Main app: ticker input, project load/save, 6 tabs |
| `api.js` | Fetch helpers for `/api/*` endpoints |
| `components/Overview.jsx` | Fair value card, key metrics, DCF summary |
| `components/FCFTab.jsx` | FCF trend chart + margins chart + detail table |
| `components/ProfitabilityTab.jsx` | Margin trends + revenue/NI chart + table |
| `components/DCFTab.jsx` | Editable params (WACC, growth), fair value, projected FCF chart |
| `components/SensitivityTab.jsx` | Color-coded return grid + terminal price matrix |
| `components/PeersTab.jsx` | Peer ticker input, comparison table, implied price |

### API Endpoints
- `GET /api/quote/:ticker` — live quote
- `GET /api/analysis/:ticker` — full analysis (query params for overrides)
- `POST /api/analysis/:ticker` — full analysis with complex settings/overrides body
- `GET /api/projects` — list saved projects
- `GET /api/projects/:name` — load project
- `POST /api/projects/:name` — save project
- `DELETE /api/projects/:name` — delete project

## Commands
```bash
npm run install:all    # Install server + client deps
npm run dev            # Run both (concurrently)
npm run server         # Express on :3001
npm run client         # Vite on :5188
```

## Critical Knowledge

### FMP API (stable, not v3)
- Base URL: `https://financialmodelingprep.com/stable/`
- All endpoints use `?symbol=TICKER` query param (NOT path param)
- Free tier: `limit` param max 5 (requesting 10 returns 402)
- Quote endpoint does NOT return PE/EPS — compute from income statement
- API key in `.env` as `FMP_API_KEY`
- Sequential API calls required (parallel triggers rate limits on free tier)

### Port Conflicts
- Port 5173 is used by another project (TastyScanner). This project uses **port 5188** for Vite.
- Backend always on port 3001
- Vite proxies `/api` to `http://localhost:3001`

### Data Flow
1. User enters ticker → `POST /api/analysis/:ticker` with settings
2. Server calls FMP sequentially: quote → profile → income → cashflow → metrics → ratios → estimates
3. Domain modules compute: FCF, profitability, DCF, sensitivity
4. Aggregated result returned to frontend
5. Frontend renders per-tab components with Recharts

### Project Persistence
- Projects saved as `~/FinancialDashboardProjects/<name>.json`
- Contains: `ticker`, `settings` (WACC, growth, sensitivity params), `overrides` (per-year FCF/EPS)
- Loading a project re-triggers analysis with saved settings

## Workflow Orchestration
### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction: update `tasks/lessons.md` with the pattern
- Write rules to prevent repeat mistakes
- Review lessons at session start

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Run the app, check logs, demonstrate correctness

### 5. Autonomous Bug Fixing
- When given a bug: just fix it. No hand-holding required.
- Point at logs, errors, failing tests — then resolve them

## Task Management
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Track Progress**: Mark items complete as you go
3. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Attribution Engine (`attribution-engine/`)

### Overview
Standalone marketing attribution engine replicating Triple Whale formulas and models. Separate from DCF calculator — lives as a subfolder but intended as its own repo.

### Tech Stack
- **Backend**: Node.js (ESM), Express 4, port 3002
- **Tests**: Vitest, 109 tests
- **No database** — stateless computation engine

### Architecture
```
attribution-engine/
├── index.js                    # Express REST API (port 3002)
├── domain/
│   ├── metrics.js              # 18 e-commerce formulas (ROAS, MER, CAC, LTV, etc.)
│   ├── attributionModels.js    # 5 rule-based models + dispatcher
│   ├── dataDrivenModels.js     # Markov Chain + Shapley Value (data-driven)
│   ├── channelAttribution.js   # Triple Attribution (per-channel last-click)
│   ├── blendedStats.js         # Cross-channel aggregation (daily/weekly/monthly)
│   └── customerMetrics.js      # LTV per channel, cohort analysis, windowed LTV
├── services/
│   ├── journeyBuilder.js       # Customer journey construction from events
│   └── attributionService.js   # Orchestrator — all 8 models + metrics
├── data/
│   └── dummyData.js            # 44 events (8 converters + 8 non-converters), 4 channels
└── __tests__/                  # 109 tests
```

### 8 Attribution Models
| Model | Type | Key concept |
|-------|------|-------------|
| First-Click | Rule-based | 100% to first touchpoint |
| Last-Click | Rule-based | 100% to last touchpoint |
| Linear | Rule-based | Equal credit to all |
| Position-Based | Rule-based | 40% first, 40% last, 20% middle |
| Time-Decay | Rule-based | Exponential decay with configurable half-life |
| Triple Attribution | Platform-specific | 100% per channel independently (Triple Whale's model) |
| Markov Chain | Data-driven | Removal effect — how much conversion drops without a channel |
| Shapley Value | Data-driven | Game theory — average marginal contribution across all coalitions |

### Key API Endpoints
```
POST /api/metrics/compute         — 18 e-commerce formulas
POST /api/attribution/compute     — single model attribution
POST /api/attribution/compare     — all 8 models side-by-side
POST /api/attribution/data-driven — Markov or Shapley specifically
POST /api/blended/compute         — cross-channel blended stats
POST /api/customer/ltv            — LTV + cohort metrics
GET  /api/*/demo                  — demo endpoints with dummy data
```

### Critical Knowledge
- Data-driven models (Markov, Shapley) need BOTH converting AND non-converting journeys
- `buildJourneys(events, { includeNonConverting: true })` for data-driven models
- Shapley: clip negative values to 0 before normalizing shares
- Markov: uses absorbing chain matrix inversion (not iterative simulation)
- Shapley exact: O(2^n) — auto-switches to Monte Carlo above 12 channels
- Triple Attribution total > conversion value by design (channels don't compete)

### Commands
```bash
cd attribution-engine
npm install
npm run dev            # Express on :3002 with --watch
npm test               # 109 tests via vitest
```

### Pending Work
- Move to separate GitHub repo (MCP token scoped to dcf-calculator only)
- Dashboard UI (React frontend)
- Real API integrations (Google Ads, Meta, TikTok, GA4)
- Tracking pixel, post-purchase surveys
- ML-based Total Impact model alternative (Bayesian or MMM)

## Core Principles
- **Simplicity First**: Make every change as simple as possible
- **No Laziness**: Find root causes. No temporary fixes
- **Minimal Impact**: Only touch what's necessary
