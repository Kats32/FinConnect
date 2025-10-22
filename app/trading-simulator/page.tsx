// app/trading-simulator/page.tsx
"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useMemo, useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MOCK_STOCKS } from "@/lib/mockData";
import type { Portfolio, Trade } from "@/types";

// Enhanced trade type with P&L tracking
type EnhancedTrade = Trade & { pnl?: number };

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function fmt(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function getNextPrice(lastPrice: number): number {
  const changePercent = (Math.random() - 0.5) * 0.02; // ±1% random price movement
  return parseFloat((lastPrice * (1 + changePercent)).toFixed(2));
}

export default function TradeSimulator() {
  // START FRESH: Reset any previous portfolio data
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash: 10000,
    holdings: {},
  });
  const [trades, setTrades] = useState<EnhancedTrade[]>([]);

  const [symbol, setSymbol] = useState(MOCK_STOCKS[0].symbol);
  const [qty, setQty] = useState(1);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");

  const [activeSimulation, setActiveSimulation] = useState<{
    symbol: string;
    qty: number;
    entryPrice: number;
    side: "BUY" | "SELL";
  } | null>(null);

  const [priceHistory, setPriceHistory] = useState<{ time: number; price: number }[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [realizedPnL, setRealizedPnL] = useState(0);

  const initialPrice = MOCK_STOCKS.find((s) => s.symbol === symbol)?.price || 100;

  // --- Start Simulation ---
  const handleStartSimulation = () => {
    if (!qty || qty < 1) return;
    const totalCost = initialPrice * qty;

    // Validation
    if (side === "BUY" && portfolio.cash < totalCost) {
      alert("Insufficient cash to buy.");
      return;
    }
    if (side === "SELL" && (!portfolio.holdings[symbol] || portfolio.holdings[symbol] < qty)) {
      alert("You don’t own enough shares to sell.");
      return;
    }

    // Update holdings and cash
    const newHoldings = { ...portfolio.holdings };
    let newCash = portfolio.cash;

    if (side === "BUY") {
      newCash -= totalCost;
      newHoldings[symbol] = (newHoldings[symbol] || 0) + qty;
    } else {
      newHoldings[symbol] -= qty;
      if (newHoldings[symbol] <= 0) delete newHoldings[symbol];
      newCash += totalCost; // proceeds credited temporarily
    }

    setPortfolio({ cash: newCash, holdings: newHoldings });

    // Record trade
    const trade: EnhancedTrade = {
      id: `${Date.now()}_${side}_${Math.random().toString(36).slice(2, 7)}`,
      time: Date.now(),
      side,
      symbol,
      qty,
      price: initialPrice,
    };
    setTrades([trade, ...trades]);

    const now = Date.now();
    setPriceHistory([{ time: now, price: initialPrice }]);
    setCurrentPrice(initialPrice);
    setActiveSimulation({ symbol, qty, entryPrice: initialPrice, side });
  };

  // --- Stop Simulation (Close Position) ---
  const handleStopSimulation = () => {
    if (!activeSimulation) return;

    const { symbol, qty, entryPrice, side } = activeSimulation;
    const exitPrice = currentPrice;

    const pnl =
      side === "BUY"
        ? (exitPrice - entryPrice) * qty
        : (entryPrice - exitPrice) * qty;

    let newCash = portfolio.cash;
    const newHoldings = { ...portfolio.holdings };

    // Adjust portfolio after closing trade
    if (side === "BUY") {
      newCash += exitPrice * qty; // sell to close
      newHoldings[symbol] = (newHoldings[symbol] || 0) - qty;
      if (newHoldings[symbol] <= 0) delete newHoldings[symbol];
    } else {
      newCash += pnl; // realized gain/loss
    }

    setPortfolio({ cash: newCash, holdings: newHoldings });
    setRealizedPnL((prev) => prev + pnl);

    const exitTrade: EnhancedTrade = {
      id: `${Date.now()}_exit_${Math.random().toString(36).slice(2, 7)}`,
      time: Date.now(),
      side: side === "BUY" ? "SELL" : "BUY",
      symbol,
      qty,
      price: exitPrice,
      pnl,
    };
    setTrades([exitTrade, ...trades]);

    setActiveSimulation(null);
    setPriceHistory([]);
  };

  // --- Price Simulation Loop ---
  useEffect(() => {
    if (!activeSimulation) return;
    const interval = setInterval(() => {
      setPriceHistory((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        const newPrice = getNextPrice(last.price);
        setCurrentPrice(newPrice);
        return [...prev, { time: Date.now(), price: newPrice }].slice(-100);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [activeSimulation]);

  // --- Chart Setup ---
  const chartData = useMemo(() => {
    if (priceHistory.length === 0) return { labels: [], datasets: [] };
    return {
      labels: priceHistory.map((p) => new Date(p.time).toLocaleTimeString()),
      datasets: [
        {
          label: "Live Price",
          data: priceHistory.map((p) => p.price),
          borderColor: "#8b5cf6",
          backgroundColor: "transparent",
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [priceHistory]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: {
        ticks: {
          color: "#9ca3af",
          callback: (v: string | number) => fmt(Number(v)),
        },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  // --- Calculations ---
  const unrealizedPnL =
    activeSimulation &&
    ((activeSimulation.side === "BUY"
      ? (currentPrice - activeSimulation.entryPrice)
      : (activeSimulation.entryPrice - currentPrice)) *
      activeSimulation.qty);

  const pnlColor = unrealizedPnL && unrealizedPnL >= 0 ? "text-green-400" : "text-red-400";

  // Calculate current holdings
  const holdingsTable = Object.entries(portfolio.holdings).map(([sym, qty]) => {
    const livePrice =
      activeSimulation?.symbol === sym ? currentPrice : MOCK_STOCKS.find((s) => s.symbol === sym)?.price || 100;
    const totalValue = qty * livePrice;
    return { sym, qty, livePrice, totalValue };
  });

  const holdingsValue = holdingsTable.reduce((acc, h) => acc + h.totalValue, 0);
  const totalEquity = portfolio.cash + holdingsValue;

  // --- Reset Portfolio ---
  const handleReset = () => {
    if (confirm("Reset portfolio and trades?")) {
      setPortfolio({ cash: 10000, holdings: {} });
      setTrades([]);
      setActiveSimulation(null);
      setRealizedPnL(0);
      setPriceHistory([]);
    }
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">✦</div>
          <h1 className="text-2xl font-bold">FinConnect</h1>
        </div>
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
        >
          Reset Portfolio
        </button>
      </header>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Account Summary */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">Cash</div>
              <div className="text-lg font-semibold">{fmt(portfolio.cash)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Holdings Value</div>
              <div className="text-lg font-semibold">{fmt(holdingsValue)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Total Equity</div>
              <div className="text-lg font-semibold">{fmt(totalEquity)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Realized P&L</div>
              <div className={`text-lg font-semibold ${realizedPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                {realizedPnL >= 0 ? "+" : ""}
                {fmt(realizedPnL)}
              </div>
            </div>
          </div>
        </div>

        {/* Holdings */}
        {holdingsTable.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h3 className="font-semibold mb-3">Current Holdings</h3>
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-gray-400 border-b border-zinc-700">
                <tr>
                  <th className="py-2">Symbol</th>
                  <th>Quantity</th>
                  <th>Market Price</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {holdingsTable.map((h) => (
                  <tr key={h.sym} className="border-b border-zinc-800">
                    <td className="py-2">{h.sym}</td>
                    <td>{h.qty}</td>
                    <td>{fmt(h.livePrice)}</td>
                    <td>{fmt(h.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Trade Controls */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Place Trade</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">Symbol</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                disabled={!!activeSimulation}
              >
                {MOCK_STOCKS.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">Quantity</label>
              <input
                type="number"
                min={1}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                disabled={!!activeSimulation}
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">Action</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2"
                value={side}
                onChange={(e) => setSide(e.target.value as "BUY" | "SELL")}
                disabled={!!activeSimulation}
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              {!activeSimulation ? (
                <button
                  onClick={handleStartSimulation}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-medium"
                >
                  Start {side} Simulation
                </button>
              ) : (
                <button
                  onClick={handleStopSimulation}
                  className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium"
                >
                  Stop & Close ({fmt(currentPrice)})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Chart */}
        {activeSimulation && (
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">
                Simulating: {activeSimulation.symbol} ({activeSimulation.side}) • Qty:{" "}
                {activeSimulation.qty}
              </h3>
              <div className="text-sm text-gray-400">
                Entry: {fmt(activeSimulation.entryPrice)} → Live:{" "}
                <span className={pnlColor}>{fmt(currentPrice)}</span>
              </div>
            </div>
            <div className="h-48">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className={`text-center mt-3 font-medium ${pnlColor}`}>
              Unrealized P&L: {unrealizedPnL && unrealizedPnL >= 0 ? "+" : ""}
              {fmt(unrealizedPnL || 0)}
            </div>
          </div>
        )}

        {/* Trade History */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <h3 className="font-semibold mb-3">Trade History</h3>
          {trades.length === 0 ? (
            <p className="text-gray-500 text-sm">No trades yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {trades.map((t) => {
                const isProfit = t.pnl != null && t.pnl >= 0;
                return (
                  <div key={t.id} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={t.side === "BUY" ? "text-green-400" : "text-red-400"}>
                        {t.side}
                      </span>
                      <span>
                        {t.qty} {t.symbol} @ {fmt(t.price)}
                      </span>
                      {t.pnl !== undefined && (
                        <span className={`font-medium ${isProfit ? "text-green-400" : "text-red-400"}`}>
                          ({t.pnl >= 0 ? "+" : ""}
                          {fmt(t.pnl)})
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400">{new Date(t.time).toLocaleTimeString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
