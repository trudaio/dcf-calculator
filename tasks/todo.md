# Testing & QA Checklist

## Attribution Engine

### Done
- [x] 18 e-commerce metric formulas (ROAS, MER, CAC, LTV, CLV, AOV, etc.)
- [x] 5 rule-based attribution models (first-click, last-click, linear, position-based, time-decay)
- [x] Triple Attribution model (per-channel last-click)
- [x] Markov Chain data-driven model (transition matrix + removal effect)
- [x] Shapley Value data-driven model (exact + Monte Carlo)
- [x] Customer journey builder with attribution windows
- [x] Blended cross-channel stats (daily/weekly/monthly)
- [x] Customer metrics: LTV per channel, cohort analysis, repeat rate, windowed LTV
- [x] REST API with demo endpoints and dummy data (44 events, 16 journeys)
- [x] 109 tests passing
- [x] README with full documentation

### Pending
- [ ] Run /ultrareview when available
- [ ] Move attribution-engine to separate GitHub repo (needs manual repo creation)
- [ ] Add more non-converting visitor data for better Markov results
- [ ] Dashboard UI (React frontend)
- [ ] Connect to real Google Ads / Meta / TikTok / GA4 APIs
- [ ] Tracking pixel implementation
- [ ] Post-purchase survey module
- [ ] Sonar-like data enrichment (CAPI, Events API)
- [ ] Total Impact equivalent (ML model with survey weighting)
- [ ] ClickHouse/PostgreSQL data layer for production use
- [ ] Deploy to Google Cloud Run

## DCF Calculator (Original Project)

## Phase 1: Backend API Testing

- [ ] `GET /api/quote/MSFT` — returns valid quote with price, marketCap, name
- [ ] `GET /api/quote/INVALIDTICKER` — returns 404 gracefully
- [ ] `GET /api/analysis/MSFT` — returns all sections (quote, fcfAnalysis, profitability, dcf, sensitivity, peers)
- [ ] `GET /api/analysis/AAPL` — verify works for different ticker
- [ ] `POST /api/analysis/MSFT` with custom WACC/growth — recalculates DCF correctly
- [ ] `POST /api/analysis/MSFT` with peers list — peers section populated
- [ ] `GET /api/projects` — returns empty array initially
- [ ] `POST /api/projects/test-msft` — saves project JSON to ~/FinancialDashboardProjects/
- [ ] `GET /api/projects/test-msft` — loads saved project with correct data
- [ ] `DELETE /api/projects/test-msft` — removes file
- [ ] Error handling: server doesn't crash on FMP errors (network, rate limit)

## Phase 2: Frontend UI Testing

- [ ] Page loads with empty state message ("Enter a ticker and click Load")
- [ ] Typing ticker + Enter triggers load (keyboard shortcut)
- [ ] Typing ticker + clicking Load triggers load
- [ ] Loading spinner shows while fetching
- [ ] Error message displays on invalid ticker
- [ ] Company name appears in header after load

### Tab: Overview
- [ ] DCF fair value card shows correct value
- [ ] Upside % is green when positive, red when negative
- [ ] Price, market cap, PE, EPS, shares all populated
- [ ] DCF summary (equity value, PV of FCF, terminal value) populated

### Tab: FCF & CAPEX
- [ ] Free Cash Flow Trend chart renders (bars + line)
- [ ] Margins chart renders (FCF Margin, CAPEX/Revenue lines)
- [ ] Details table has 5 years of data
- [ ] Revenue YoY growth shows null for first year, valid % for rest
- [ ] FCF values colored green (positive) / red (negative)

### Tab: Profitability
- [ ] Margin Trends chart renders (3 lines: gross, operating, net)
- [ ] Revenue & Net Income chart renders (bars + line)
- [ ] Details table populates correctly
- [ ] All percentages formatted as X.X%

### Tab: Valuation (DCF)
- [ ] WACC, Growth, Terminal Growth, Horizon inputs pre-filled
- [ ] Changing WACC + Recalculate updates fair value
- [ ] Changing growth rate updates projected FCF chart
- [ ] DCF timeline table shows correct years, growth, FCF, PV
- [ ] Sum PV, terminal value, equity value cards correct

### Tab: Sensitivity
- [ ] Grid renders 5×5 (EPS CAGR rows × P/E columns)
- [ ] Cells color-coded: green for high returns, red for negative
- [ ] Hover tooltip shows terminal price
- [ ] Terminal Price Matrix table below grid
- [ ] Current price and EPS displayed above grid

### Tab: Peers
- [ ] Empty state shows "Enter peer tickers" message
- [ ] Typing "AAPL, GOOGL, META" + Load Peers fetches data
- [ ] Peer table shows ticker, name, price, PE, market cap
- [ ] Peer Average PE row at bottom
- [ ] Implied Price card shows correct value (subject EPS × peer avg PE)

## Phase 3: Project Persistence

- [ ] Save Project button saves current ticker + settings
- [ ] Saved project appears in Load Project dropdown
- [ ] Loading a project restores ticker and triggers re-analysis
- [ ] Loading a project preserves custom WACC/growth settings
- [ ] JSON file written to ~/FinancialDashboardProjects/ with correct structure
- [ ] Multiple projects can coexist

## Phase 4: Edge Cases & Robustness

- [ ] Loading a ticker with no cash flow data (e.g., new IPO)
- [ ] Loading a ticker with missing income statement data
- [ ] Very large market cap formatting (trillions)
- [ ] Very small market cap formatting (millions)
- [ ] Negative EPS handling in sensitivity matrix
- [ ] Zero shares outstanding edge case in DCF
- [ ] Rapid ticker switching (doesn't mix results)
- [ ] FMP API daily limit exhausted — graceful error
- [ ] Backend down while frontend up — error message shown

## Phase 5: Polish

- [ ] Responsive layout on smaller screens
- [ ] Tab switching is instant (no re-fetch needed)
- [ ] Numbers consistently formatted (2 decimals for $, 1 for %)
- [ ] Charts have proper axis labels and legends
- [ ] Dark theme consistent across all components
