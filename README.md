# Finance Tracker

A finance tracking app built with **React + Vite** and a **Node/Express + SQLite** backend.

## What it supports
- Login/Register with **JWT**
- Add / edit / delete transactions (stored in SQLite)
- Transaction filters: date range, type, category, and search
- Insights: cashflow snapshot and top expense categories

## Run locally
1. Install dependencies:
   - `npm install`
2. Start both frontend + API:
   - `npm run dev:full`
3. Open:
   - `http://localhost:5173/login`

## Notes
- SQLite DB file is created automatically at `server/data/finance-tracker.db`
