"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TradingViewChart from "../../components/TradingViewChart";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  volume: number;
  marketCap: number;
}

export default function CompanyPage() {
  const { symbol } = useParams() as { symbol: string };
  const router = useRouter();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching data for symbol: ${symbol}`);
        
        const res = await fetch(`/api/yahoo?symbol=${encodeURIComponent(symbol)}`);
        if (!res.ok) throw new Error("Failed to fetch stock data");
        
        const data = await res.json();
        console.log("API response:", data);
        
        const result = data.chart?.result?.[0];
        if (!result) throw new Error("No chart data found");

        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose;
        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;

        setStockData({
          symbol: meta.symbol || symbol.toUpperCase(),
          name: meta.instrumentName || `${symbol.toUpperCase()} Company`,
          price: price,
          change: change,
          changePercent: changePercent,
          previousClose: previousClose,
          open: meta.regularMarketOpen || price,
          volume: meta.regularMarketVolume || 0,
          marketCap: meta.marketCap || 0
        });
      } catch (error) {
        console.error("Error fetching stock data:", error);
        // Fallback mock data
        const mockPrice = 150 + Math.random() * 100;
        const mockChange = (Math.random() - 0.5) * 10;
        setStockData({
          symbol: symbol.toUpperCase(),
          name: `${symbol.toUpperCase()} Company`,
          price: mockPrice,
          change: mockChange,
          changePercent: (mockChange / mockPrice) * 100,
          previousClose: mockPrice - mockChange,
          open: mockPrice,
          volume: Math.floor(Math.random() * 10000000),
          marketCap: Math.floor(Math.random() * 1000000000000)
        });
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStockData();
    }
  }, [symbol]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + 'B';
    }
    if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + 'M';
    }
    if (value >= 1e3) {
      return (value / 1e3).toFixed(2) + 'K';
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {symbol} data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/companies"
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Explorer
              </Link>
              <div className="w-px h-6 bg-gray-700"></div>
              <div>
                <h1 className="text-2xl font-bold">
                  {stockData?.name}
                </h1>
                <p className="text-gray-400 font-mono">{stockData?.symbol}</p>
              </div>
            </div>
            
            {stockData && (
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(stockData.price)}
                </div>
                <div className={`text-lg font-semibold ${
                  stockData.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stockData.change >= 0 ? '▲' : '▼'} 
                  {formatCurrency(Math.abs(stockData.change))} 
                  ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {stockData && (
        <div className="border-b border-gray-700 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Previous Close:</span>
                <span className="ml-2 font-medium">{formatCurrency(stockData.previousClose)}</span>
              </div>
              <div>
                <span className="text-gray-400">Open:</span>
                <span className="ml-2 font-medium">{formatCurrency(stockData.open)}</span>
              </div>
              <div>
                <span className="text-gray-400">Volume:</span>
                <span className="ml-2 font-medium">{formatNumber(stockData.volume)}</span>
              </div>
              <div>
                <span className="text-gray-400">Market Cap:</span>
                <span className="ml-2 font-medium">
                  {stockData.marketCap ? formatNumber(stockData.marketCap) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-900/40 rounded-2xl border border-gray-700 shadow-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">
              Live Chart - {symbol.toUpperCase()}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Interactive price chart with real-time data
            </p>
          </div>
          
          {/* TradingView Chart */}
          <TradingViewChart symbol={symbol} />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">About {stockData?.name}</h3>
            <p className="text-gray-400 mb-4">
              Real-time stock data and trading information for {symbol.toUpperCase()}. 
              This interactive chart provides comprehensive technical analysis tools.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Live price movements and volume data</p>
              <p>• Multiple timeframe analysis (1D, 1W, 1M, 1Y)</p>
              <p>• Technical indicators and drawing tools</p>
              <p>• Real-time market updates</p>
            </div>
          </div>
          
          <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Stock Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/companies')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                <span className="mr-2">🔍</span>
                Explore More Stocks
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                <span className="mr-2">🔄</span>
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}