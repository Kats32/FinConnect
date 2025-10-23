// app/trading-simulator/page.tsx - COMPLETE FIXED VERSION
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
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Square, 
  RotateCcw,
  Brain,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { TutorialOverlay } from "@/components/TutorialOverlay";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Types
interface MLPrediction {
  direction: 'UP' | 'DOWN';
  confidence: number;
  predictedPrice: number;
  timeframe: string;
  factors: string[];
}

interface EnhancedStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  prediction?: MLPrediction;
  historicalData: { timestamp: number; price: number; volume: number }[];
}

interface EnhancedTrade {
  id: string;
  time: number;
  side: "BUY" | "SELL";
  symbol: string;
  qty: number;
  price: number;
  pnl?: number;
  confidence?: number;
}

interface Portfolio {
  cash: number;
  holdings: Record<string, number>;
}

interface ActiveSimulation {
  symbol: string;
  qty: number;
  entryPrice: number;
  side: "BUY" | "SELL";
}

// Enhanced mock data with consistent structure
const createEnhancedStocks = (): EnhancedStock[] => [
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
      price: 175 + Math.sin(i * 0.5) * 3 + Math.random() * 2,
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
      price: 240 + Math.sin(i * 0.3) * 8 + Math.random() * 3,
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
      price: 405 + Math.sin(i * 0.4) * 10 + Math.random() * 4,
      volume: 18000000 + Math.random() * 6000000
    }))
  }
];

const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "Welcome to AI Trading Simulator",
    description: "Learn professional trading with AI-powered insights. This simulator helps you practice strategies risk-free with virtual money.",
    targetElement: ".tutorial-welcome",
    position: "center" as const
  },
  {
    id: "stocks-list",
    title: "Live Market Data",
    description: "Browse real-time stock data with live price updates, changes, and volumes. Click any stock to select it for trading.",
    targetElement: ".stocks-list-section",
    position: "right" as const
  },
  {
    id: "ai-prediction",
    title: "AI Market Predictions",
    description: "Get machine learning-based buy/sell recommendations with confidence scores and key market factors.",
    targetElement: ".ai-prediction-section",
    position: "left" as const
  },
  {
    id: "trade-execution",
    title: "Execute Trades",
    description: "Place BUY (long) or SELL (short) orders. Monitor your position in real-time.",
    targetElement: ".trade-execution-section",
    position: "left" as const
  },
  {
    id: "live-chart",
    title: "Live Trading Chart",
    description: "Watch real-time price movements and track your unrealized P&L. Close positions to realize profits.",
    targetElement: ".live-chart-section",
    position: "top" as const
  },
  {
    id: "portfolio",
    title: "Portfolio Management",
    description: "Monitor your cash balance, total equity (including short positions), and trading performance.",
    targetElement: ".portfolio-section",
    position: "bottom" as const
  }
];

// Helper functions for consistent price behavior
const getBasePrice = (symbol: string): number => {
  const bases: Record<string, number> = {
    "AAPL": 178,
    "TSLA": 245,
    "MSFT": 412
  };
  return bases[symbol] || 100;
};

const getVolatility = (symbol: string): number => {
  const volatilities: Record<string, number> = {
    "AAPL": 0.8,
    "TSLA": 2.5,
    "MSFT": 1.2
  };
  return volatilities[symbol] || 1;
};

export default function EnhancedTradeSimulator() {
  // State management
  const [portfolio, setPortfolio] = useState<Portfolio>({ cash: 10000, holdings: {} });
  const [trades, setTrades] = useState<EnhancedTrade[]>([]);
  const [stocks, setStocks] = useState<EnhancedStock[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [qty, setQty] = useState(1);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [activeSimulation, setActiveSimulation] = useState<ActiveSimulation | null>(null);
  const [priceHistory, setPriceHistory] = useState<{ time: number; price: number }[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [predictions, setPredictions] = useState<Record<string, MLPrediction>>({});
  const [loadingPrediction, setLoadingPrediction] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialReady, setTutorialReady] = useState(false);
  
  // Initialize stocks data consistently
  useEffect(() => {
    const initialStocks = createEnhancedStocks();
    setStocks(initialStocks);
    setSelectedSymbol(initialStocks[0].symbol);
    setCurrentPrice(initialStocks[0].price);
    
    // Set tutorial ready after components are mounted
    const timer = setTimeout(() => {
      setTutorialReady(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Initialize tutorial on first visit
  useEffect(() => {
    if (!tutorialReady) return;
    
    const hasSeenTutorial = localStorage.getItem('tutorial_trading_simulator');
    
    if (!hasSeenTutorial) {
      const tutorialTimer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000);
      
      return () => clearTimeout(tutorialTimer);
    }
  }, [tutorialReady]);

  // Update stock prices dynamically with consistent data
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const basePrice = getBasePrice(stock.symbol);
          const volatility = getVolatility(stock.symbol);
          
          // Simulate price movement
          const change = (Math.random() - 0.5) * volatility;
          // Add mean reversion tendency
          const meanReversion = (basePrice - stock.price) * 0.05;
          const newPrice = Math.max(basePrice * 0.5, stock.price + change + meanReversion);
          
          // Calculate change from the "base" price for a more realistic daily change
          const changeAmount = newPrice - basePrice;
          const changePercent = (changeAmount / basePrice) * 100;
          
          // Update historical data consistently
          const newHistoricalData = [
            ...stock.historicalData.slice(1),
            { 
              timestamp: Date.now(), 
              price: newPrice, 
              volume: stock.volume + (Math.random() - 0.5) * 1000000 
            }
          ];

          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(changeAmount.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            historicalData: newHistoricalData
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update current price when selected stock changes
  useEffect(() => {
    const stock = stocks.find(s => s.symbol === selectedSymbol);
    if (stock) {
      setCurrentPrice(stock.price);
    }
  }, [selectedSymbol, stocks]);

  const selectedStock = stocks.find(s => s.symbol === selectedSymbol);

  // Fixed price simulation with live market synchronization
  const getNextEnhancedPrice = (lastPrice: number, symbol: string): number => {
    const basePrice = getBasePrice(symbol);
    const volatility = getVolatility(symbol);
    
    const currentLiveStock = stocks.find(s => s.symbol === symbol);
    const livePrice = currentLiveStock?.price || lastPrice;
    
    const liveTrend = livePrice - lastPrice;
    
    let baseChange = (Math.random() - 0.5) * volatility;
    
    const meanReversion = (basePrice - lastPrice) * 0.01;
    baseChange += meanReversion;
    
    const prediction = predictions[symbol];
    if (prediction) {
      const predictionInfluence = (prediction.confidence / 100) * 0.005;
      baseChange += prediction.direction === 'UP' ? predictionInfluence : -predictionInfluence;
    }
    
    const blendedChange = (liveTrend * 0.7) + (baseChange * 0.3);
    
    const newPrice = lastPrice + blendedChange;
    return parseFloat(Math.max(basePrice * 0.5, newPrice).toFixed(2));
  };

  // Fixed prediction function
  const fetchPrediction = async (symbol: string) => {
    setLoadingPrediction(symbol);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const stock = stocks.find(s => s.symbol === symbol);
    if (stock) {
      const trend = stock.changePercent > 0 ? 0.7 : 0.3; 
      const direction: 'UP' | 'DOWN' = Math.random() > trend ? 'DOWN' : 'UP';
      const confidence = Math.random() * 30 + 65; 
      
      const prediction: MLPrediction = {
        direction,
        confidence: parseFloat(confidence.toFixed(1)),
        predictedPrice: parseFloat((stock.price * (1 + (direction === 'UP' ? 0.02 : -0.02))).toFixed(2)),
        timeframe: "1-hour",
        factors: ['Market Sentiment', 'Volume Analysis', 'Technical Indicators', 'Price Action']
      };
      setPredictions(prev => ({ ...prev, [symbol]: prediction }));
    }
    setLoadingPrediction(null);
  };

  // Trading function with correct validation and short-selling logic
  const handleStartSimulation = () => {
    if (!qty || qty < 1 || !selectedStock) return;
    if (activeSimulation) {
      alert("Please close your active position first.");
      return;
    }

    const totalCost = selectedStock.price * qty;

    // Validation first
    if (side === "BUY" && portfolio.cash < totalCost) {
      alert("Insufficient cash for this trade");
      return;
    }

    // State updates second
    setPortfolio(prevPortfolio => {
      const newHoldings = { ...prevPortfolio.holdings };
      let newCash = prevPortfolio.cash;

      if (side === "BUY") {
        // Open LONG position
        newCash -= totalCost;
        newHoldings[selectedSymbol] = (newHoldings[selectedSymbol] || 0) + qty;
      } else {
        // Open SHORT position
        newCash += totalCost; // Receive cash from short sale
        newHoldings[selectedSymbol] = (newHoldings[selectedSymbol] || 0) - qty; // Holdings go negative
      }

      return { 
        cash: parseFloat(newCash.toFixed(2)), 
        holdings: newHoldings 
      };
    });

    // Record trade
    const trade: EnhancedTrade = {
      id: `${Date.now()}_${side}_${Math.random().toString(36).slice(2, 7)}`,
      time: Date.now(),
      side,
      symbol: selectedSymbol,
      qty,
      price: selectedStock.price,
      confidence: predictions[selectedSymbol]?.confidence
    };
    setTrades(prev => [trade, ...prev]);

    // Start simulation with current live market price
    const currentLivePrice = selectedStock.price; 
    const now = Date.now();
    
    setPriceHistory([{ time: now, price: currentLivePrice }]);
    setCurrentPrice(currentLivePrice);
    setActiveSimulation({ 
      symbol: selectedSymbol, 
      qty, 
      entryPrice: currentLivePrice,
      side
    });
  };

  // Simulation stop with correct P&L and short-selling logic
  const handleStopSimulation = () => {
    if (!activeSimulation || !selectedStock) return;

    // Use the most up-to-date simulation price for P&L
    const exitPrice = currentPrice;

    // Calculate P&L
    const pnl = (exitPrice - activeSimulation.entryPrice) * activeSimulation.qty * 
                (activeSimulation.side === 'BUY' ? 1 : -1);

    // Update portfolio for closing position
    setPortfolio(prevPortfolio => {
      const newHoldings = { ...prevPortfolio.holdings };
      let newCash = prevPortfolio.cash;

      if (activeSimulation.side === 'BUY') {
        // Closing LONG position: Sell the shares
        const saleValue = exitPrice * activeSimulation.qty;
        newCash += saleValue;
        newHoldings[activeSimulation.symbol] = (newHoldings[activeSimulation.symbol] || 0) - activeSimulation.qty;
      
      } else {
        // Closing SHORT position: Buy back the shares
        const buyBackCost = exitPrice * activeSimulation.qty;
        newCash -= buyBackCost; // Only subtract the buy-back cost
        newHoldings[activeSimulation.symbol] = (newHoldings[activeSimulation.symbol] || 0) + activeSimulation.qty;
      }
      
      // Clean up holdings if they are zero
      if (Math.abs(newHoldings[activeSimulation.symbol]) < 0.001) {
        delete newHoldings[activeSimulation.symbol];
      }

      return { 
        cash: parseFloat(newCash.toFixed(2)), 
        holdings: newHoldings 
      };
    });

    setRealizedPnL(prev => prev + pnl);

    const exitTrade: EnhancedTrade = {
      id: `${Date.now()}_exit_${Math.random().toString(36).slice(2, 7)}`,
      time: Date.now(),
      side: activeSimulation.side === 'BUY' ? 'SELL' : 'BUY',
      symbol: activeSimulation.symbol,
      qty: activeSimulation.qty,
      price: exitPrice,
      pnl: parseFloat(pnl.toFixed(2))
    };
    setTrades(prev => [exitTrade, ...prev]);

    setActiveSimulation(null);
    setPriceHistory([]);
  };

  // Price simulation effect
  useEffect(() => {
    if (!activeSimulation || priceHistory.length === 0) return;

    const interval = setInterval(() => {
      setPriceHistory(prev => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        
        const newPrice = getNextEnhancedPrice(last.price, activeSimulation.symbol);
        setCurrentPrice(newPrice);
        return [...prev, { time: Date.now(), price: newPrice }].slice(-100);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSimulation, priceHistory.length, stocks, predictions]);

  // Chart data
  const chartData = useMemo(() => {
    if (activeSimulation && priceHistory.length > 0) {
      const prices = priceHistory.map(p => p.price);
      
      const liveStock = stocks.find(s => s.symbol === selectedSymbol);
      const recentLivePrices = liveStock?.historicalData.slice(-priceHistory.length).map(d => d.price) || [];
      
      const alignedLivePrices = recentLivePrices.length < prices.length 
        ? [...Array(prices.length - recentLivePrices.length).fill(null), ...recentLivePrices]
        : recentLivePrices.slice(-prices.length);
      
      return {
        labels: priceHistory.map(p => new Date(p.time).toLocaleTimeString()),
        datasets: [
          {
            label: "Your Position Price",
            data: prices,
            borderColor: "#8b5cf6",
            backgroundColor: "transparent",
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 3,
          },
          {
            label: "Live Market Price",
            data: alignedLivePrices,
            borderColor: "#6b7280",
            backgroundColor: "transparent",
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1,
            borderDash: [3, 3],
          },
          {
            label: "Entry Price",
            data: prices.map(() => activeSimulation.entryPrice),
            borderColor: activeSimulation.side === 'BUY' ? "#10b981" : "#ef4444",
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0,
            borderWidth: 1,
          }
        ],
      };
    }
    
    const stock = stocks.find(s => s.symbol === selectedSymbol);
    if (!stock) return { labels: [], datasets: [] };
    
    const prices = stock.historicalData.map(d => d.price);
    return {
      labels: stock.historicalData.map(d => new Date(d.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: `${stock.symbol} Price`,
          data: prices,
          borderColor: "#8b5cf6",
          backgroundColor: "transparent",
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        }
      ],
    };
  }, [priceHistory, stocks, selectedSymbol, activeSimulation]);

  // Live Market Comparison Component
  const LiveMarketComparison = () => {
    if (!activeSimulation || !selectedStock) return null;
    
    const livePrice = selectedStock.price;
    const simulationPrice = currentPrice;
    const priceDifference = simulationPrice - livePrice;
    const differencePercent = (priceDifference / livePrice) * 100;
    
    return (
      <div className="mt-4 p-3 bg-zinc-800 rounded-lg text-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Market Comparison:</span>
          <span className={priceDifference >= 0 ? 'text-green-400' : 'text-red-400'}>
            {priceDifference >= 0 ? '+' : ''}{priceDifference.toFixed(2)} 
            ({differencePercent >= 0 ? '+' : ''}{differencePercent.toFixed(2)}%)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Your Position: </span>
            <span className="font-semibold">${simulationPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Live Market: </span>
            <span className="font-semibold">${livePrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate portfolio values - fixed to correctly handle negative (short) holdings
  const holdingsValue = Object.entries(portfolio.holdings).reduce((total, [sym, qty]) => {
    const stock = stocks.find(s => s.symbol === sym);
    return total + (stock?.price || 0) * qty; 
  }, 0);

  const totalEquity = portfolio.cash + holdingsValue;
  const totalReturn = ((totalEquity - 10000) / 10000) * 100;
  
  // Calculate Unrealized P&L for active simulation
  const unrealizedPnL = useMemo(() => {
    if (!activeSimulation) return 0;
    
    const pnl = (currentPrice - activeSimulation.entryPrice) * activeSimulation.qty * 
                (activeSimulation.side === 'BUY' ? 1 : -1);
    return pnl;
  }, [activeSimulation, currentPrice]);

  const unrealizedReturn = useMemo(() => {
    if (!activeSimulation || activeSimulation.entryPrice === 0) return 0;
    
    const pnl = (currentPrice - activeSimulation.entryPrice) / activeSimulation.entryPrice * 100 *
                (activeSimulation.side === 'BUY' ? 1 : -1);
    return pnl;
  }, [activeSimulation, currentPrice]);

  // Loading state
  if (stocks.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading trading simulator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          localStorage.setItem('tutorial_trading_simulator', 'true');
        }}
        tutorialKey="trading_simulator"
        steps={TUTORIAL_STEPS}
      />

      <header className="mb-8 flex justify-between items-center tutorial-welcome">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg">✦</div>
          <div>
            <h1 className="text-2xl font-bold">FinConnect AI Trader</h1>
            <p className="text-gray-400 text-sm">ML-Powered Trading Simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <HelpCircle size={16} />
            Show Tutorial
          </button>
          <button
            onClick={() => {
              if (activeSimulation) {
                alert("Please close your active position before resetting.");
                return;
              }
              setPortfolio({ cash: 10000, holdings: {} });
              setTrades([]);
              setActiveSimulation(null);
              setRealizedPnL(0);
              setPriceHistory([]);
              setPredictions({});
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Stocks List */}
          <div className="stocks-list-section bg-zinc-900 rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Live Market</h3>
            <div className="space-y-3">
              {stocks.map(stock => (
                <div
                  key={stock.symbol}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    (selectedSymbol === stock.symbol && !activeSimulation)
                      ? 'bg-purple-600 bg-opacity-20 border border-purple-500' 
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  } ${activeSimulation && selectedSymbol !== stock.symbol ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (activeSimulation) return;
                    setSelectedSymbol(stock.symbol);
                    setCurrentPrice(stock.price);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-xs text-gray-400">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${stock.price.toFixed(2)}</div>
                      <div className={`text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? '↗' : '↘'} {Math.abs(stock.changePercent).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Vol: {(stock.volume / 1000000).toFixed(1)}M</span>
                    <span>Mkt Cap: {stock.marketCap}</span>
                  </div>
                  
                  {predictions[stock.symbol] && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Brain size={12} className={
                        predictions[stock.symbol].direction === 'UP' ? 'text-green-400' : 'text-red-400'
                      } />
                      <span className={
                        predictions[stock.symbol].direction === 'UP' ? 'text-green-400' : 'text-red-400'
                      }>
                        {predictions[stock.symbol].direction} 
                        ({predictions[stock.symbol].confidence}%)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Prediction Panel */}
          <div className="ai-prediction-section bg-zinc-900 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">AI Prediction</h3>
              <button
                onClick={() => fetchPrediction(selectedSymbol)}
                disabled={loadingPrediction === selectedSymbol || !!activeSimulation}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-sm disabled:opacity-50 transition-colors"
              >
                <Brain size={14} />
                {loadingPrediction ? "Analyzing..." : "Refresh"}
              </button>
            </div>
            
            {predictions[selectedSymbol] ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Direction:</span>
                  <span className={
                    predictions[selectedSymbol].direction === 'UP' 
                      ? 'text-green-400 font-semibold' 
                      : 'text-red-400 font-semibold'
                  }>
                    {predictions[selectedSymbol].direction}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Confidence:</span>
                  <span className="font-semibold">{predictions[selectedSymbol].confidence}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Target:</span>
                  <span className="font-semibold">${predictions[selectedSymbol].predictedPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Key Factors:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {predictions[selectedSymbol].factors.map((factor, i) => (
                      <span key={i} className="bg-zinc-800 px-2 py-1 rounded text-xs">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain size={32} className="mx-auto mb-2 opacity-50" />
                <p>Click "Analyze" to get AI prediction</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Portfolio Summary */}
          <div className="portfolio-section grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 rounded-2xl p-5">
              <div className="text-gray-400 text-sm">Cash Balance</div>
              <div className="text-xl font-semibold">${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-5">
              <div className="text-gray-400 text-sm">Holdings Value</div>
              <div className="text-xl font-semibold">${holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-5">
              <div className="text-gray-400 text-sm">Total Equity</div>
              <div className="text-xl font-semibold">${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-5">
              <div className="text-gray-400 text-sm">Total Return</div>
              <div className={`text-xl font-semibold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Trading Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trade Controls */}
            <div className="trade-execution-section lg:col-span-1 bg-zinc-900 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-4">Trade Execution</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSide('BUY')}
                    disabled={!!activeSimulation}
                    className={`p-3 rounded-lg font-semibold transition-colors ${
                      side === 'BUY' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    } disabled:opacity-50`}
                  >
                    BUY (Long)
                  </button>
                  <button
                    onClick={() => setSide('SELL')}
                    disabled={!!activeSimulation}
                    className={`p-3 rounded-lg font-semibold transition-colors ${
                      side === 'SELL' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    } disabled:opacity-50`}
                  >
                    SELL (Short)
                  </button>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-300">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white disabled:opacity-50"
                    value={qty}
                    disabled={!!activeSimulation}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  />
                </div>

                {selectedStock && (
                  <div className="bg-zinc-800 p-3 rounded-lg text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Market Price:</span>
                      <span>${selectedStock.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Value:</span>
                      <span>${(selectedStock.price * qty).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {!activeSimulation ? (
                  <button
                    onClick={handleStartSimulation}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                      side === 'BUY' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    <Play size={16} />
                    Start {side} Simulation
                  </button>
                ) : (
                  <button
                    onClick={handleStopSimulation}
                    className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Square size={16} />
                    Close Position
                  </button>
                )}
              </div>
            </div>

            {/* Chart & Analysis */}
            <div className="live-chart-section lg:col-span-2 bg-zinc-900 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">
                  {selectedStock?.symbol} - {selectedStock?.name}
                </h3>
                <div className="text-sm">
                  <span className="text-gray-400">Current: </span>
                  <span className="font-semibold">${currentPrice.toFixed(2)}</span>
                  {activeSimulation && (
                    <>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-400">Entry: </span>
                      <span className="font-semibold">${activeSimulation.entryPrice.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="h-64 mb-4">
                <Line 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        display: true,
                        labels: { color: '#9ca3af' }
                      } 
                    },
                    scales: {
                      x: { 
                        display: true,
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                      },
                      y: { 
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                      }
                    }
                  }} 
                />
              </div>

              {activeSimulation && (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-gray-400 text-sm">Unrealized P&L</div>
                      <div className={
                        unrealizedPnL >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'
                      }>
                        ${unrealizedPnL.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Return</div>
                      <div className={
                        unrealizedReturn >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'
                      }>
                        {unrealizedReturn.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Position</div>
                      <div className={`font-semibold capitalize ${
                        activeSimulation.side === 'BUY' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {activeSimulation.side} {activeSimulation.qty} shares
                      </div>
                    </div>
                  </div>
                  <LiveMarketComparison />
                </>
              )}
            </div>
          </div>

          {/* Trade History */}
          <div className="bg-zinc-900 rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Trade History</h3>
            {trades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No trades yet. Start your first simulation!
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {trades.map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        trade.side === 'BUY' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
                      }`}>
                        {trade.side === 'BUY' ? <TrendingUp size={16} className="text-green-400" /> : <TrendingDown size={16} className="text-red-400" />}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {trade.side} {trade.qty} {trade.symbol} @ ${trade.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(trade.time).toLocaleString()}
                          {trade.confidence && ` • ${trade.confidence}% conf`}
                        </div>
                      </div>
                    </div>
                    {trade.pnl !== undefined && (
                      <div className={`font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}