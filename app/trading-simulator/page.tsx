// app/trading-simulator/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePrices } from "@/hooks/usePrices";
import { MOCK_STOCKS } from "@/lib/mockData";
import { buy, canBuy, canSell, equityValue, sell } from "@/lib/simEngine";
import type { Portfolio, Trade } from "@/types";

function fmt(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function TradeSimulator() {
  // portfolio persisted in localStorage
  const [portfolio, setPortfolio] = useLocalStorage<Portfolio>("fc_portfolio", {
    cash: 10000,
    holdings: {},
  });

  // trade history persisted in localStorage
  const [trades, setTrades] = useLocalStorage<Trade[]>("fc_trades", []);

  // simulated live prices
  const { prices, list } = usePrices();

  // UI state
  const [symbol, setSymbol] = useState(MOCK_STOCKS[0].symbol);
  const [qty, setQty] = useState(1);

  const priceMap = useMemo(
    () =>
      Object.fromEntries(list.map((s) => [s.symbol, s.price])) as Record<
        string,
        number
      >,
    [list]
  );

  const currentPrice = priceMap[symbol] ?? 0;
  const equity = equityValue(portfolio, priceMap);
  const total = +(portfolio.cash + equity).toFixed(2);

  function recordTrade(
    side: "BUY" | "SELL",
    sym: string,
    price: number,
    q: number
  ) {
    const t: Trade = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      time: Date.now(),
      side,
      symbol: sym,
      qty: q,
      price: +price.toFixed(2),
    };
    setTrades([t, ...trades]);
  }

  function onBuy() {
    if (!qty || qty < 1) return;
    if (!canBuy(portfolio, currentPrice, qty)) {
      alert("Insufficient cash.");
      return;
    }
    const next = buy(portfolio, symbol, currentPrice, qty);
    setPortfolio(next);
    recordTrade("BUY", symbol, currentPrice, qty);
  }

  function onSell() {
    if (!qty || qty < 1) return;
    if (!canSell(portfolio, symbol, qty)) {
      alert("Not enough shares to sell.");
      return;
    }
    const next = sell(portfolio, symbol, currentPrice, qty);
    setPortfolio(next);
    recordTrade("SELL", symbol, currentPrice, qty);
  }

  const holdingsEntries = Object.entries(portfolio.holdings).filter(
    ([, q]) => q > 0
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
            ✦
          </div>
          <h1 className="text-2xl font-bold">FinConnect</h1>
        </div>
        <p className="text-gray-400 text-sm mt-1">Advanced Trading Simulator</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Trade Panel */}
        <div className="bg-zinc-900 rounded-2xl shadow-lg p-5 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Trade</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">Symbol</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              >
                {MOCK_STOCKS.map((s) => (
                  <option key={s.symbol} value={s.symbol} className="bg-zinc-800">
                    {s.symbol}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Current price: <span className="font-medium">{fmt(currentPrice)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">Quantity</label>
              <input
                type="number"
                min={1}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBuy}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-medium transition"
              >
                Buy
              </button>
              <button
                onClick={onSell}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 font-medium transition"
              >
                Sell
              </button>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-zinc-900 rounded-2xl shadow-lg p-5 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-xs uppercase text-gray-400">Cash</div>
              <div className="text-lg font-semibold">{fmt(portfolio.cash)}</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-xs uppercase text-gray-400">Holdings</div>
              <div className="text-lg font-semibold">{fmt(equity)}</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-xs uppercase text-gray-400">Total Equity</div>
              <div className="text-lg font-semibold">{fmt(total)}</div>
            </div>
          </div>

          <h3 className="mt-6 font-semibold mb-2">Portfolio</h3>
          {holdingsEntries.length === 0 ? (
            <p className="text-sm text-gray-500">No holdings yet.</p>
          ) : (
            <table className="w-full text-sm border border-zinc-800 rounded-lg overflow-hidden">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left p-2 text-gray-300">Symbol</th>
                  <th className="text-right p-2 text-gray-300">Qty</th>
                  <th className="text-right p-2 text-gray-300">Price</th>
                  <th className="text-right p-2 text-gray-300">Value</th>
                </tr>
              </thead>
              <tbody>
                {holdingsEntries.map(([sym, q]) => {
                  const p = priceMap[sym] ?? 0;
                  return (
                    <tr key={sym} className="border-t border-zinc-800 hover:bg-zinc-850">
                      <td className="p-2">{sym}</td>
                      <td className="p-2 text-right">{q}</td>
                      <td className="p-2 text-right">{fmt(p)}</td>
                      <td className="p-2 text-right">{fmt(p * q)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Tickers & Trade History */}
        <div className="bg-zinc-900 rounded-2xl shadow-lg p-5 border border-zinc-800 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Live Mock Prices</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {list.map((s) => (
              <div key={s.symbol} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                <div className="text-xs text-gray-400">{s.symbol}</div>
                <div className="text-lg font-semibold">{fmt(s.price)}</div>
                <div className="text-xs text-gray-500 truncate">{s.name}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-6 font-semibold mb-2">Trade History</h3>
          {trades.length === 0 ? (
            <p className="text-sm text-gray-500">No trades yet.</p>
          ) : (
            <table className="w-full text-sm border border-zinc-800 rounded-lg overflow-hidden">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left p-2 text-gray-300">Time</th>
                  <th className="text-left p-2 text-gray-300">Side</th>
                  <th className="text-left p-2 text-gray-300">Symbol</th>
                  <th className="text-right p-2 text-gray-300">Qty</th>
                  <th className="text-right p-2 text-gray-300">Price</th>
                  <th className="text-right p-2 text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-t border-zinc-800 hover:bg-zinc-850">
                    <td className="p-2 text-gray-300">
                      {new Date(t.time).toLocaleTimeString()}
                    </td>
                    <td
                      className={`p-2 ${
                        t.side === "BUY" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {t.side}
                    </td>
                    <td className="p-2">{t.symbol}</td>
                    <td className="p-2 text-right">{t.qty}</td>
                    <td className="p-2 text-right">{fmt(t.price)}</td>
                    <td className="p-2 text-right">{fmt(t.price * t.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}