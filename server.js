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

if (!API_KEY || !API_SECRET) {
  console.error(
    "Missing Alpaca credentials. Set APCA_API_KEY_ID and APCA_API_SECRET_KEY " +
      "(see .env.example)."
  );
  process.exit(1);
}

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
  try {
    const account = await alpaca("/v2/account");
    res.json(account);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message });
  }
});

// Current open positions (with unrealized P&L).
app.get("/api/positions", async (_req, res) => {
  try {
    const positions = await alpaca("/v2/positions");
    res.json(positions);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message });
  }
});

// Trades = fill activities (actual executions), newest first.
app.get("/api/trades", async (_req, res) => {
  try {
    const fills = await alpaca("/v2/account/activities/FILL?direction=desc");
    res.json(fills);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serving on http://localhost:${PORT} (Alpaca: ${ALPACA_BASE_URL})`);
});
