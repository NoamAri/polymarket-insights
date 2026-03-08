

# Polymarket Research Dashboard

A React recreation of your Streamlit Polymarket research app with three main modes, a dark theme, and AI-powered newspaper articles.

## Design & Theme
- Dark theme matching the original (dark navy/slate backgrounds, blue/purple gradients)
- Inter + Playfair Display fonts for the newspaper aesthetic
- Responsive layout with sidebar navigation

## Pages & Navigation

### Sidebar
- App logo "🔮 Polymarket Research"
- Navigation toggle: **Live Newspaper** / **Market Browser**

### 1. Live Newspaper Mode (`/`)
- **Masthead** with date, edition number, "THE POLYMARKET CHRONICLE" title
- **Ticker bar** showing top 8 markets with odds
- **Lead story** — largest event with AI-generated article, pull quote with top odds, volume stats
- **Top Stories grid** (2-column) — next 4 events with AI articles
- **Market Watch** (3-column compact cards) — events 5-10 with odds & volume
- **Hot Takes** — remaining events as opinion-style cards
- Refresh button to reload data
- AI articles generated via **Lovable AI Gateway** (Gemini) through an edge function

### 2. Market Browser Mode (`/browse`)
- **Category pill bar** fetched live from Polymarket Gamma API (`/events` endpoint with tag grouping)
- **"All Analytics" tab** as default showing charts from local/cached data
- When a **category is selected**:
  - KPI row: Events count, Markets count, Total Volume, Active, Resolved
  - Search, status filter (All/Active/Resolved), sort controls
  - Event cards with expandable markets inside
  - For **active markets**: bet payout calculator (pick outcome, enter amount, see payout/profit/ROI)
  - For **resolved markets**: winner, volume, duration, P&L estimates, market efficiency label
  - Price history line chart (fetched from CLOB API) using Recharts
  - Pagination with "Load More"

### 3. All Analytics View (within Market Browser, "All Analytics" tab)
- Loads from sample market data (bundled JSON)
- KPI row: Markets count, Total Volume, Avg Duration, Crowd Accuracy, Largest Market
- **Charts** (using Recharts):
  - Top 15 Markets by Volume (horizontal bar)
  - Volume by Category (horizontal bar)
  - Markets Closed per Month (area chart)
  - Crowd Accuracy by Category (horizontal bar)
  - Biggest Upsets — crowd got it wrong (horizontal bar)
  - Market Efficiency Distribution (histogram)
- Sidebar filters: search, outcome, crowd accuracy, tags, volume range, date range, sort
- Market cards with outcome badges, volume, duration, P&L estimates

## Data & API Integration
- **Polymarket Gamma API** (public, no auth): fetch events by category, top categories, market details
- **Polymarket CLOB API** (public): fetch price history for charts
- All API calls made client-side (they're public CORS-enabled APIs)
- Sample markets JSON bundled for the analytics view

## Backend (Lovable Cloud)
- **Edge function `generate-articles`**: Takes market event data, calls Lovable AI Gateway with Gemini to generate newspaper-style articles, returns structured JSON with article text per event ID
- Uses non-streaming response since we need all articles at once

## Key Components
- `EventCard` — expandable event with nested market rows
- `BetCalculator` — payout calculator for active markets
- `PriceHistoryChart` — Recharts line chart for historical odds
- `NewspaperLayout` — masthead, ticker, lead story, article grid
- `CategoryBar` — horizontal scrollable category pills
- `KPIRow` — reusable metric cards row
- `AnalyticsCharts` — all 6 chart types
- `MarketCard` — market display with badges and P&L

