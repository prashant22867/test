import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Alpaca Trading API base. Defaults to paper trading; set ALPACA_BASE_URL to
// https://api.alpaca.markets for live.
const ALPACA_BASE_URL =
  process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets";

const API_KEY = process.env.APCA_API_KEY_ID;
const API_SECRET = process.env.APCA_API_SECRET_KEY;

// DEMO=true serves baked-in sample data instead of calling Alpaca, so the page
// can be viewed without API keys or network access.
const DEMO = /^(1|true|yes)$/i.test(process.env.DEMO || "");

if (!DEMO && (!API_KEY || !API_SECRET)) {
  console.error(
    "Missing Alpaca credentials. Set APCA_API_KEY_ID and APCA_API_SECRET_KEY " +
      "(see .env.example), or run with DEMO=true for sample data."
  );
  process.exit(1);
}

// Sample payloads shaped like real Alpaca responses (used only when DEMO=true).
const DEMO_DATA = {
  account: {
    portfolio_value: "104238.55",
    equity: "104238.55",
    last_equity: "103011.02",
    cash: "18402.11",
    buying_power: "36804.22",
  },
  positions: [
    { symbol: "AAPL", qty: "50", avg_entry_price: "182.40", current_price: "191.65", market_value: "9582.50", unrealized_pl: "462.50", unrealized_plpc: "0.0507", side: "long" },
    { symbol: "MSFT", qty: "25", avg_entry_price: "410.10", current_price: "421.88", market_value: "10547.00", unrealized_pl: "294.50", unrealized_plpc: "0.0287", side: "long" },
    { symbol: "NVDA", qty: "40", avg_entry_price: "118.75", current_price: "112.30", market_value: "4492.00", unrealized_pl: "-258.00", unrealized_plpc: "-0.0543", side: "long" },
    { symbol: "TSLA", qty: "-15", avg_entry_price: "244.90", current_price: "238.05", market_value: "-3570.75", unrealized_pl: "102.75", unrealized_plpc: "0.0280", side: "short" },
  ],
  trades: [
    { symbol: "AAPL", side: "buy", qty: "50", price: "182.40", transaction_time: "2026-09-19T14:32:11Z" },
    { symbol: "NVDA", side: "buy", qty: "40", price: "118.75", transaction_time: "2026-09-19T15:08:44Z" },
    { symbol: "TSLA", side: "sell_short", qty: "15", price: "244.90", transaction_time: "2026-09-18T18:21:03Z" },
    { symbol: "MSFT", side: "buy", qty: "25", price: "410.10", transaction_time: "2026-09-18T13:55:29Z" },
    { symbol: "SPY", side: "sell", qty: "30", price: "556.20", transaction_time: "2026-09-17T19:44:57Z" },
    { symbol: "SPY", side: "buy", qty: "30", price: "548.65", transaction_time: "2026-09-15T14:02:18Z" },
  ],
};

// The API keys never leave the server. The browser only ever talks to the two
// routes below, so the secret is never shipped to the client.
async function alpaca(path) {
  const res = await fetch(`${ALPACA_BASE_URL}${path}`, {
    headers: {
      "APCA-API-KEY-ID": API_KEY,
      "APCA-API-SECRET-KEY": API_SECRET,
      accept: "application/json",
    },
  });

  const body = await res.text();
  if (!res.ok) {
    const err = new Error(`Alpaca ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  return JSON.parse(body);
}

app.use(express.static("public"));

// Account balance / equity / buying power.
app.get("/api/account", async (_req, res) => {
  if (DEMO) return res.json(DEMO_DATA.account);
  try {
    const account = await alpaca("/v2/account");
    res.json(account);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message });
  }
});

// Current open positions (with unrealized P&L).
app.get("/api/positions", async (_req, res) => {
  if (DEMO) return res.json(DEMO_DATA.positions);
  try {
    const positions = await alpaca("/v2/positions");
    res.json(positions);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message });
  }
});

// Trades = fill activities (actual executions), newest first.
app.get("/api/trades", async (_req, res) => {
  if (DEMO) return res.json(DEMO_DATA.trades);
  try {
    const fills = await alpaca("/v2/account/activities/FILL?direction=desc");
    res.json(fills);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  const mode = DEMO ? "DEMO (sample data)" : `Alpaca: ${ALPACA_BASE_URL}`;
  console.log(`Serving on http://localhost:${PORT} (${mode})`);
});
