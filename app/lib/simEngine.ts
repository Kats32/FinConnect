// lib/simEngine.ts
import type { Portfolio } from "@/types";

export function canBuy(portfolio: Portfolio, price: number, qty: number) {
  return portfolio.cash >= price * qty;
}

export function canSell(portfolio: Portfolio, symbol: string, qty: number) {
  return (portfolio.holdings[symbol] ?? 0) >= qty;
}

export function buy(
  portfolio: Portfolio,
  symbol: string,
  price: number,
  qty: number
): Portfolio {
  const cost = +(price * qty).toFixed(2);
  return {
    cash: +(portfolio.cash - cost).toFixed(2),
    holdings: {
      ...portfolio.holdings,
      [symbol]: (portfolio.holdings[symbol] ?? 0) + qty,
    },
  };
}

export function sell(
  portfolio: Portfolio,
  symbol: string,
  price: number,
  qty: number
): Portfolio {
  const revenue = +(price * qty).toFixed(2);
  return {
    cash: +(portfolio.cash + revenue).toFixed(2),
    holdings: {
      ...portfolio.holdings,
      [symbol]: (portfolio.holdings[symbol] ?? 0) - qty,
    },
  };
}

export function equityValue(
  portfolio: Portfolio,
  prices: Record<string, number>
) {
  let v = 0;
  for (const [sym, q] of Object.entries(portfolio.holdings)) {
    v += (prices[sym] ?? 0) * q;
  }
  return +v.toFixed(2);
}
