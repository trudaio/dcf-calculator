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

## 2026-04-23 — Data-Driven Models Need Non-Converting Paths

**Mistake**: Markov Chain model returned 0 removal effects for all channels. Baseline conversion was 100% because `buildJourneys()` only returns converting journeys.

**Root cause**: Markov and Shapley models need both converting AND non-converting paths to compute meaningful probabilities. Without non-converters, removing any channel doesn't change the conversion rate (still 100%).

**Fix**: Added `includeNonConverting` option to `buildJourneys()`, created dummy non-converting visitors (8 bounced/abandoned journeys), and passed `allJourneys` separately to data-driven model functions.

**Rule**: Data-driven attribution models always need the full dataset — converters + non-converters. Rule-based models (first-click, linear, etc.) only need converters.

---

## 2026-04-23 — Shapley Value Negative Values Break Share Normalization

**Mistake**: Shapley shares were all 0 despite positive Shapley values for most channels. One channel (organic) had a large negative Shapley value, causing the total to be ~0 and dividing by ~0.

**Root cause**: In the dummy data, organic presence correlated with lower conversion rates. Shapley correctly assigned a negative marginal contribution, but the naive normalization `value / totalValue` broke when the total was near zero.

**Fix**: Clip negative Shapley values to 0 before computing shares. Channels that hurt conversion shouldn't receive positive credit. The raw `shapleyValue` (including negative) is still returned for diagnostic purposes.

**Rule**: When normalizing Shapley values to shares, clip negatives to 0 first. Negative values are informational (channel hurts conversion) but shouldn't distort the credit distribution.

---

## 2026-04-23 — Git Commit Signing Fails Outside Repo Context

**Mistake**: Tried to create a separate git repo at `/home/user/attribution-engine/` and commit — signing server returned 400 "missing source".

**Root cause**: The commit signing infrastructure in this environment is tied to the specific repo context (`dcf-calculator`). New repos outside that context can't sign commits.

**Rule**: In this environment, all work must be committed within the existing repo. Separate repos need to be created and pushed from a local machine with proper credentials.

---

## 2026-04-23 — GitHub MCP Tools Are Repo-Scoped

**Mistake**: Tried to create a new GitHub repo via `mcp__github__create_repository` — got 403 "Resource not accessible by integration".

**Root cause**: The GitHub MCP token is scoped only to `trudaio/dcf-calculator`. It cannot create new repos or access other repos.

**Rule**: MCP GitHub tools are limited to the repos listed in the session config. For operations on other repos, the user must do them manually or grant broader access.
