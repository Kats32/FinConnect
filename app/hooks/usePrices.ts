// hooks/usePrices.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Stock } from "@/types";
import { MOCK_STOCKS } from "@/lib/mockData";

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, Stock>>(() =>
    Object.fromEntries(MOCK_STOCKS.map((s) => [s.symbol, s]))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next: Record<string, Stock> = { ...prev };
        for (const sym of Object.keys(next)) {
          const p = next[sym].price;
          const drift = (Math.random() - 0.5) * 0.02; // ±1%
          const newPrice = Math.max(1, +(p * (1 + drift)).toFixed(2));
          next[sym] = { ...next[sym], price: newPrice };
        }
        return next;
      });
    }, 2000); // tick every 2s
    return () => clearInterval(id);
  }, []);

  const list = useMemo(() => Object.values(prices), [prices]);
  return { prices, list };
}
