# Lessons Learned

Track mistakes and patterns to avoid repeating them.

---

## 2026-03-28 — FMP API Migration (v3 → stable)

**Mistake**: Initially built dataProvider against FMP `/api/v3/` endpoints which are now deprecated (returns 403 "Legacy Endpoint").

**Root cause**: FMP migrated to `/stable/` endpoints sometime after Aug 2025. The old format used path params (`/quote/MSFT`), the new one uses query params (`/quote?symbol=MSFT`).

**Rule**: Always test API endpoints directly with `curl` before building abstractions. Check for deprecation notices.

---

## 2026-03-28 — FMP Free Tier Limit Parameter

**Mistake**: Requested `limit=10` for income statements and cash flow, which returned 402 Payment Required. Free tier caps `limit` at 5.

**Root cause**: Assumed higher limits were available. The error message is clear but only appears at runtime.

**Rule**: FMP free tier max `limit=5`. Always use 5 as default for financial statement endpoints.

---

## 2026-03-28 — FMP Rate Limiting on Parallel Requests

**Mistake**: Used `Promise.all()` to fetch 7 endpoints simultaneously, triggering 402 errors intermittently.

**Root cause**: FMP free tier has request-per-second limits. Parallel calls exceed the threshold.

**Rule**: Use sequential `await` calls for FMP API on free tier, not `Promise.all()`.

---

## 2026-03-28 — Port Collision (5173)

**Mistake**: Configured Vite on port 5173 which was already occupied by another project (TastyScanner/Ionic).

**Root cause**: Didn't check `lsof -i :5173` before assigning port.

**Rule**: Always check port availability before configuring. This project uses **5188**.

---

## 2026-03-28 — FMP Quote Missing PE/EPS

**Mistake**: Expected `pe` and `eps` fields in `/stable/quote` response. They don't exist in the stable API.

**Root cause**: Profile endpoint also doesn't have PE/EPS. Must compute from income statement: `eps = netIncome / weightedAverageShsOutDil`, `pe = price / eps`.

**Rule**: For FMP stable API, always compute PE and EPS from income statement data. Don't rely on quote or profile endpoints for these.

---

## 2026-06-18 — Peers Fetch Re-introduced Promise.all (regression)

**Mistake**: `domain/peers.js` fetched all peer quotes/financials with nested `Promise.all`, the exact pattern that triggers FMP free-tier 402 rate-limit errors.

**Root cause**: The "sequential await" rule was applied to the main analysis flow but not to peer fetching, which was written separately.

**Rule**: The sequential-await rule applies to EVERY path that hits FMP, including peers. Audit all call sites, not just the orchestrator.

---

## 2026-06-18 — Year Field Inconsistency Across Domain Modules

**Mistake**: `profitability.js` derived the year from `calendarYear || date` while `fcfAnalysis.js` used `fiscalYear || calendarYear || date`. FMP stable returns `fiscalYear`, so profitability years could come out blank (breaking table rows / React keys).

**Rule**: Resolve the period field consistently everywhere: `fiscalYear || calendarYear || date?.slice(0,4)`.

---

## 2026-06-18 — Added Demo Mode for Preview Without API Key

**Note**: The app now runs in DEMO MODE when `FMP_API_KEY` is unset or `demo`, serving self-contained fixtures from `server/demoData.js`. This makes the dashboard previewable/runnable with zero external dependencies. Also added a Gordon-Growth guard for `wacc <= terminalGrowth` and honored explicit `0` FCF overrides.
