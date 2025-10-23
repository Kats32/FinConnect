import type { EnhancedStock } from "@/types";

export const MOCK_STOCKS: EnhancedStock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.42,
    change: 2.34,
    changePercent: 1.33,
    volume: 45203123,
    marketCap: "2.8T",
    historicalData: Array.from({ length: 50 }, (_, i) => ({
      timestamp: Date.now() - (50 - i) * 60000,
      price: 175 + Math.random() * 8 - 4,
      volume: 40000000 + Math.random() * 10000000
    }))
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 245.67,
    change: -3.21,
    changePercent: -1.29,
    volume: 28345123,
    marketCap: "780B",
    historicalData: Array.from({ length: 50 }, (_, i) => ({
      timestamp: Date.now() - (50 - i) * 60000,
      price: 240 + Math.random() * 12 - 6,
      volume: 25000000 + Math.random() * 8000000
    }))
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 412.18,
    change: 1.89,
    changePercent: 0.46,
    volume: 18923456,
    marketCap: "3.1T",
    historicalData: Array.from({ length: 50 }, (_, i) => ({
      timestamp: Date.now() - (50 - i) * 60000,
      price: 405 + Math.random() * 15 - 7,
      volume: 18000000 + Math.random() * 6000000
    }))
  },
  {
    symbol: "GOOG",
    name: "Alphabet Inc.",
    price: 140.25,
    change: 0.75,
    changePercent: 0.54,
    volume: 15678901,
    marketCap: "1.8T",
    historicalData: Array.from({ length: 50 }, (_, i) => ({
      timestamp: Date.now() - (50 - i) * 60000,
      price: 138 + Math.random() * 5 - 2,
      volume: 15000000 + Math.random() * 5000000
    }))
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 130.45,
    change: -1.25,
    changePercent: -0.95,
    volume: 23456789,
    marketCap: "1.3T",
    historicalData: Array.from({ length: 50 }, (_, i) => ({
      timestamp: Date.now() - (50 - i) * 60000,
      price: 128 + Math.random() * 6 - 3,
      volume: 22000000 + Math.random() * 7000000
    }))
  }
];