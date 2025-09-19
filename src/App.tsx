import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Complete SRC replacement for a Vite + React + TS project
// Brokerage Tracker with offline storage and optional free live prices

// -----------------------------
// Types
// -----------------------------
type ID = string;

interface Account {
  id: ID;
  name: string;
}

interface Position {
  id: ID;
  accountId: ID;
  symbol: string;
  quantity: number;
  costBasis: number;
  notes?: string;
}

interface PriceMap {
  [symbol: string]: number;
}

interface StoreShape {
  version: 1;
  accounts: Account[];
  positions: Position[];
  prices: PriceMap;
}

// -----------------------------
// Storage helpers
// -----------------------------
const STORAGE_KEY = "offline_brokerage_tracker_v1";

function readStore(): StoreShape {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { version: 1, accounts: [], positions: [], prices: {} };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("bad store");
    return {
      version: 1,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      positions: Array.isArray(parsed.positions) ? parsed.positions : [],
      prices: parsed.prices && typeof parsed.prices === "object" ? parsed.prices : {},
    };
  } catch {
    return { version: 1, accounts: [], positions: [], prices: {} };
  }
}

function writeStore(store: StoreShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function uid(): ID {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// -----------------------------
// Derived math
// -----------------------------
function positionValue(p: Position, prices: PriceMap) {
  const px = prices[p.symbol?.trim().toUpperCase()] ?? 0;
  const mv = round2(p.quantity * px);
  const avgCost = p.quantity > 0 ? p.costBasis / p.quantity : 0;
  const pl = round2((px - avgCost) * p.quantity);
  const plPct = p.costBasis > 0 ? ((px * p.quantity - p.costBasis) / p.costBasis) * 100 : 0;
  return { price: px, marketValue: mv, avgCost: round4(avgCost), pl, plPct };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function round4(n: number) { return Math.round(n * 10000) / 10000; }

// -----------------------------
// Free price fetching (Stooq + CoinGecko)
// -----------------------------
const CRYPTO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  ADA: "cardano",
  DOGE: "dogecoin",
  LTC: "litecoin",
  BCH: "bitcoin-cash",
  XRP: "ripple",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  MATIC: "matic-network",
};

function splitSymbolsForProviders(symbols: string[]) {
  const uniq = Array.from(new Set(symbols.map(s => s.trim().toUpperCase()).filter(Boolean)));
  const crypto: string[] = [];
  const equities: string[] = [];
  for (const s of uniq) {
    if (CRYPTO_MAP[s]) crypto.push(s);
    else if (/^[A-Z0-9]+$/.test(s)) equities.push(s);
  }
  return { crypto, equities };
}

async function fetchStooqPrices(usTickers: string[]): Promise<Record<string, number>> {
  if (usTickers.length === 0) return {};
  const sParam = usTickers.map(t => `${t.toLowerCase()}.us`).join(",");
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(sParam)}&f=sd2t2ohlcv&h&e=csv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("stooq failed");
  const csv = await res.text();
  const lines = csv.trim().split(/\r?\n/);
  const header = lines.shift() || "";
  const cols = header.split(",").map(s => s.trim().toLowerCase());
  const symIdx = cols.indexOf("symbol");
  const closeIdx = cols.indexOf("close");
  const out: Record<string, number> = {};
  for (const line of lines) {
    const parts = line.split(",");
    const symFull = (parts[symIdx] || "").trim();
    const sym = symFull.split(".")[0].toUpperCase();
    const close = Number((parts[closeIdx] || "").trim());
    if (sym && close > 0) out[sym] = close;
  }
  return out;
}

async function fetchCoinGeckoPrices(cryptoTickers: string[]): Promise<Record<string, number>> {
  if (cryptoTickers.length === 0) return {};
  const ids = cryptoTickers.map(t => CRYPTO_MAP[t]).filter(Boolean);
  if (ids.length === 0) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("coingecko failed");
  const data = await res.json();
  const out: Record<string, number> = {};
  for (const [ticker, id] of Object.entries(CRYPTO_MAP)) {
    if (cryptoTickers.includes(ticker) && data[id]?.usd != null) out[ticker] = Number(data[id].usd);
  }
  return out;
}

async function fetchFreePrices(allSymbols: string[]): Promise<Record<string, number>> {
  const { crypto, equities } = splitSymbolsForProviders(allSymbols);
  const [eq, cg] = await Promise.allSettled([
    fetchStooqPrices(equities),
    fetchCoinGeckoPrices(crypto),
  ]);
  const out: Record<string, number> = {};
  if (eq.status === "fulfilled") Object.assign(out, eq.value);
  if (cg.status === "fulfilled") Object.assign(out, cg.value);
  return out;
}

// -----------------------------
// Small UI primitives
// -----------------------------
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={[
      "w-full rounded-md border border-gray-300 px-3 py-2",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500",
      props.className ?? "",
    ].join(" ")}
  />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={[
      "w-full rounded-md border border-gray-300 px-3 py-2",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500",
      props.className ?? "",
    ].join(" ")}
  />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...rest }) => (
  <button
    {...rest}
    className={[
      "rounded-md px-3 py-2 text-sm font-medium",
      "bg-indigo-600 text-white hover:bg-indigo-700 active:translate-y-px",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className ?? "",
    ].join(" ")}
  >
    {children}
  </button>
);

const Card: React.FC<{ title?: string; right?: React.ReactNode; className?: string; children?: React.ReactNode; }> = ({ title, right, className, children }) => (
  <div className={["rounded-2xl bg-white p-4 shadow-sm", className ?? ""].join(" ")}>
    {(title || right) && (
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {right}
      </div>
    )}
    {children}
  </div>
);

// -----------------------------
// App Component
// -----------------------------
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold">Brokerage Tracker App Ready</h1>
    </div>
  );
}

// -----------------------------
// Render to DOM
// -----------------------------
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
