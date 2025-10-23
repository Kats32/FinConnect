"use client";

import { useState, useEffect } from "react";

interface TradingViewChartProps {
  symbol: string;
}

export default function TradingViewChart({ symbol }: TradingViewChartProps) {
  const [chartLoaded, setChartLoaded] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Reset loaded state when symbol changes
  useEffect(() => {
    setChartLoaded(false);
    setLoadAttempt(prev => prev + 1);
  }, [symbol]);

  const iframeSrc = `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_${symbol}&symbol=${symbol.toUpperCase()}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=1F1F1F&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`;

  return (
    <div className="w-full h-[600px] relative">
      {/* Loading overlay */}
      {!chartLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading TradingView Chart...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {loadAttempt > 2 && !chartLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg z-20">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Chart Loading Failed
            </h3>
            <p className="text-gray-500 mb-4">
              Unable to load TradingView chart for {symbol}
            </p>
            <button
              onClick={() => {
                setChartLoaded(false);
                setLoadAttempt(1);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* TradingView iframe */}
      <iframe
        key={`${symbol}-${loadAttempt}`}
        src={iframeSrc}
        className={`w-full h-full border-0 rounded-lg transition-opacity duration-300 ${
          chartLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => {
          console.log(`TradingView chart loaded for ${symbol}`);
          setChartLoaded(true);
        }}
        onError={() => {
          console.error(`Failed to load TradingView chart for ${symbol}`);
          setChartLoaded(false);
        }}
        title={`TradingView Chart for ${symbol}`}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}