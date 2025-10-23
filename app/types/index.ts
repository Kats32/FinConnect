export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  historicalData?: { timestamp: number; price: number; volume: number }[];
}

export type Side = "BUY" | "SELL";

export interface Trade {
  id: string;
  time: number;
  side: Side;
  symbol: string;
  qty: number;
  price: number;
  pnl?: number;
  strategy?: string;
  confidence?: number;
}

export interface Portfolio {
  cash: number;
  holdings: Record<string, number>;
}

export interface MLPrediction {
  direction: 'UP' | 'DOWN';
  confidence: number;
  predictedPrice: number;
  timeframe: string;
  factors: string[];
}

export interface EnhancedStock extends Stock {
  prediction?: MLPrediction;
  historicalData: { timestamp: number; price: number; volume: number }[];
}