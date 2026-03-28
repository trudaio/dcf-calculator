# Financial Analysis Dashboard (DCF Calculator)

A full-stack financial analysis tool that fetches real market data and generates interactive dashboards for stock valuation — DCF models, profitability metrics, sensitivity analysis, and peer comparisons.

All data persisted locally as JSON files. No database required.

![Dark themed dashboard](https://img.shields.io/badge/theme-dark-0d1117)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933)
![React 19](https://img.shields.io/badge/react-19-61dafb)

## Features

- **Overview** — Fair value (DCF), current price, market cap, P/E, EPS at a glance
- **FCF & CAPEX** — Free cash flow trends, operating CF vs CAPEX charts, margin analysis
- **Profitability** — Gross/operating/net margin trends, revenue & net income charts
- **Valuation (DCF)** — Editable WACC, FCF growth, terminal growth; projected FCF chart & fair value
- **Sensitivity** — Color-coded EPS CAGR × Terminal P/E matrix showing annualized returns
- **Peers** — Compare P/E ratios across peers, see implied price at peer-average P/E
- **Project Save/Load** — Save analysis settings per ticker as local JSON files

## Quick Start

### 1. Get an API Key

Sign up at [Financial Modeling Prep](https://financialmodelingprep.com/) (free tier works).

### 2. Configure

Create a `.env` file in the project root:

```env
FMP_API_KEY=your_api_key_here
FMP_BASE_URL=https://financialmodelingprep.com/stable
PROJECTS_DIR=~/FinancialDashboardProjects
```

### 3. Install & Run

```bash
# Install all dependencies (server + client)
npm run install:all

# Run both backend and frontend
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5188

### Run Separately

```bash
npm run server    # Express API on :3001
npm run client    # Vite React on :5188
```

## Project Structure

```
dcf-calculator/
├── server/
│   ├── index.js              # Express server & REST routes
│   ├── dataProvider.js        # FMP API wrapper
│   ├── analysisService.js     # Orchestrates all analysis modules
│   ├── projectStore.js        # JSON file persistence
│   └── domain/
│       ├── fcfAnalysis.js     # Free Cash Flow analysis
│       ├── profitability.js   # Margin calculations
│       ├── dcfModel.js        # DCF valuation model
│       ├── sensitivity.js     # EPS CAGR × P/E matrix
│       └── peers.js           # Peer comparison
├── client/
│   ├── src/
│   │   ├── App.jsx            # Main app (tabs, state, API calls)
│   │   ├── api.js             # Backend API helpers
│   │   └── components/        # Tab components (Overview, FCF, DCF, etc.)
│   └── vite.config.js         # Vite config with API proxy
├── .env                       # API key (not committed)
├── tasks/
│   ├── todo.md                # Testing & feature tracking
│   └── lessons.md             # Mistakes & lessons learned
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quote/:ticker` | Live stock quote |
| GET | `/api/analysis/:ticker` | Full analysis (query params for settings) |
| POST | `/api/analysis/:ticker` | Full analysis with settings & overrides in body |
| GET | `/api/projects` | List saved projects |
| GET | `/api/projects/:name` | Load a project |
| POST | `/api/projects/:name` | Save a project |
| DELETE | `/api/projects/:name` | Delete a project |

## How It Works

1. Enter a ticker (e.g., `MSFT`) and click **Load**
2. Backend fetches data from FMP: quote, income statement, cash flow, key metrics
3. Domain modules compute FCF, margins, DCF fair value, sensitivity matrix
4. Frontend renders interactive charts (Recharts) and data tables
5. Adjust DCF parameters (WACC, growth rates) and click **Recalculate**
6. Save your analysis as a project for later

## Data Source

[Financial Modeling Prep](https://financialmodelingprep.com/) — stable API endpoints.

Free tier limitations:
- Max 5 years of historical data per request
- Rate limits apply (requests are made sequentially)
- 250 API calls/day

## Tech Stack

- **Backend**: Node.js, Express 4, ESM modules
- **Frontend**: React 19, Vite 6, Recharts
- **Persistence**: Local JSON files (no database)
- **Styling**: Custom CSS, dark theme

## License

MIT
