"use client";

interface SimpleChartProps {
  symbol: string;
  price: number;
  change: number;
}

export default function SimpleChart({ symbol, price, change }: SimpleChartProps) {
  const isPositive = change >= 0;
  const percentage = (change / (price - change)) * 100;

  // Generate mock data points
  const dataPoints = Array.from({ length: 50 }, (_, i) => {
    const base = price - change;
    const volatility = price * 0.02;
    return base + (i / 50) * change + (Math.random() - 0.5) * volatility;
  });

  const maxPrice = Math.max(...dataPoints);
  const minPrice = Math.min(...dataPoints);

  return (
    <div className="w-full h-[400px] bg-gray-900 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{symbol} Price Chart</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? '↗' : '↘'} {percentage.toFixed(2)}%
        </div>
      </div>
      
      <div className="relative h-64 bg-gray-800 rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-2">
          <span>${maxPrice.toFixed(2)}</span>
          <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
          <span>${minPrice.toFixed(2)}</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-8 h-full relative">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path
              d={`M 0,${100 - ((dataPoints[0] - minPrice) / (maxPrice - minPrice)) * 100} ${
                dataPoints.map((point, i) => 
                  `L ${(i / (dataPoints.length - 1)) * 100},${100 - ((point - minPrice) / (maxPrice - minPrice)) * 100}`
                ).join(' ')
              }`}
              stroke={isPositive ? '#10B981' : '#EF4444'}
              strokeWidth="2"
              fill="none"
            />
            <path
              d={`M 0,${100 - ((dataPoints[0] - minPrice) / (maxPrice - minPrice)) * 100} ${
                dataPoints.map((point, i) => 
                  `L ${(i / (dataPoints.length - 1)) * 100},${100 - ((point - minPrice) / (maxPrice - minPrice)) * 100}`
                ).join(' ')
              } L 100,100 L 0,100 Z`}
              fill={isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
            />
          </svg>
        </div>
        
        {/* X-axis time labels */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-500 px-4">
          <span>Open</span>
          <span>Now</span>
        </div>
      </div>
      
      <div className="mt-4 text-center text-gray-400 text-sm">
        <p>📊 Interactive chart unavailable. Showing simulated price movement.</p>
      </div>
    </div>
  );
}