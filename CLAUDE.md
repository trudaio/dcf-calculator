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

## Core Principles
- **Simplicity First**: Make every change as simple as possible
- **No Laziness**: Find root causes. No temporary fixes
- **Minimal Impact**: Only touch what's necessary
