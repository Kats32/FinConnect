// types/index.ts
export interface Stock {
  symbol: string;
  name: string;
  price: number;
}

export type Side = "BUY" | "SELL";

export interface Trade {
  id: string;
  time: number;
  side: Side;
  symbol: string;
  qty: number;
  price: number;
}

export interface Portfolio {
  cash: number;
  holdings: Record<string, number>;
}
