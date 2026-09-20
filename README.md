# Alpaca — Balance & Trades

A minimal web page to view your Alpaca account **balance** and **trades (fills)**.

The Alpaca API secret is kept on a tiny backend proxy and **never shipped to the
browser** — the page only talks to local `/api/*` routes, which forward to Alpaca.

## What it shows

- **Balance cards** — portfolio value, cash, buying power, equity (`GET /v2/account`)
- **Open positions** — qty, avg entry, current price, market value, unrealized P&L (`GET /v2/positions`)
- **Recent trades** — your executions/fills, newest first (`GET /v2/account/activities/FILL`)

## Try it with no keys (demo mode)

Want to see the page before wiring up Alpaca? Run it with baked-in sample data:

```bash
npm install
DEMO=true npm start        # → http://localhost:3000
```

`DEMO=true` serves realistic sample balance, positions, and fills — no API keys
or network access required.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your Alpaca API keys in the [Alpaca dashboard](https://alpaca.markets/)
   (start with **paper** keys), then:

   ```bash
   cp .env.example .env
   # edit .env and paste your APCA_API_KEY_ID and APCA_API_SECRET_KEY
   ```

3. Run it:

   ```bash
   npm start
   ```

4. Open <http://localhost:3000>.

## Environments

`.env` defaults to **paper trading** (`https://paper-api.alpaca.markets`). To use
your live account, set `ALPACA_BASE_URL=https://api.alpaca.markets` and use live
keys. Keys and base URL must match (paper keys only work against the paper URL).

## Routes (backend proxy)

| Route            | Alpaca endpoint                          | Purpose                     |
| ---------------- | ---------------------------------------- | --------------------------- |
| `/api/account`   | `/v2/account`                            | Balance, equity, buying power |
| `/api/positions` | `/v2/positions`                          | Open positions (unused by UI, available) |
| `/api/trades`    | `/v2/account/activities/FILL`            | Executions / fills          |

## Notes

- The page polls every 15s to stay roughly live.
- This is read-only — no order placement.
- Never commit `.env`; it is gitignored.
