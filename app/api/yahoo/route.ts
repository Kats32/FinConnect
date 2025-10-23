import { NextRequest, NextResponse } from 'next/server';

// Multiple API endpoints for fallback
const API_SOURCES = {
  YAHOO: 'https://query1.finance.yahoo.com',
  YAHOO_V7: 'https://query2.finance.yahoo.com',
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query'
};

async function fetchWithFallback(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        ...options.headers,
      },
      next: { revalidate: 60 } // Cache for 1 minute
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

// Mock data for development
const mockMovers = {
  gainers: [
    { symbol: 'AAPL', shortName: 'Apple Inc.', regularMarketPrice: 182.63, regularMarketChangePercent: 2.34 },
    { symbol: 'MSFT', shortName: 'Microsoft Corporation', regularMarketPrice: 378.85, regularMarketChangePercent: 1.89 },
    { symbol: 'GOOGL', shortName: 'Alphabet Inc.', regularMarketPrice: 138.21, regularMarketChangePercent: 1.56 },
    { symbol: 'TSLA', shortName: 'Tesla Inc.', regularMarketPrice: 234.50, regularMarketChangePercent: 3.21 },
    { symbol: 'NVDA', shortName: 'NVIDIA Corporation', regularMarketPrice: 450.05, regularMarketChangePercent: 4.12 }
  ],
  losers: [
    { symbol: 'META', shortName: 'Meta Platforms Inc.', regularMarketPrice: 320.40, regularMarketChangePercent: -1.23 },
    { symbol: 'AMZN', shortName: 'Amazon.com Inc.', regularMarketPrice: 145.18, regularMarketChangePercent: -0.89 },
    { symbol: 'NFLX', shortName: 'Netflix Inc.', regularMarketPrice: 485.25, regularMarketChangePercent: -1.45 },
    { symbol: 'INTC', shortName: 'Intel Corporation', regularMarketPrice: 44.12, regularMarketChangePercent: -2.34 },
    { symbol: 'CSCO', shortName: 'Cisco Systems Inc.', regularMarketPrice: 50.67, regularMarketChangePercent: -0.67 }
  ],
  actives: [
    { symbol: 'SPY', shortName: 'SPDR S&P 500', regularMarketPrice: 455.23, regularMarketChangePercent: 0.45 },
    { symbol: 'QQQ', shortName: 'Invesco QQQ Trust', regularMarketPrice: 389.12, regularMarketChangePercent: 0.67 },
    { symbol: 'IWM', shortName: 'iShares Russell 2000 ETF', regularMarketPrice: 185.34, regularMarketChangePercent: -0.23 },
    { symbol: 'AMD', shortName: 'Advanced Micro Devices Inc.', regularMarketPrice: 128.45, regularMarketChangePercent: 1.23 },
    { symbol: 'F', shortName: 'Ford Motor Company', regularMarketPrice: 12.34, regularMarketChangePercent: -0.56 }
  ]
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const query = searchParams.get('q');
  const type = searchParams.get('type');

  // For development, return mock data
  const useMockData = process.env.NODE_ENV === 'development' || true; // Force mock for now

  try {
    // 🔍 Search companies
    if (query) {
      if (useMockData) {
        // Mock search results
        const mockResults = {
          quotes: [
            { symbol: 'AAPL', shortname: 'Apple Inc.', longname: 'Apple Inc.' },
            { symbol: 'MSFT', shortname: 'Microsoft Corporation', longname: 'Microsoft Corporation' },
            { symbol: 'GOOGL', shortname: 'Alphabet Inc.', longname: 'Alphabet Inc. Class A' },
            { symbol: 'AMZN', shortname: 'Amazon.com Inc.', longname: 'Amazon.com Inc.' },
            { symbol: 'TSLA', shortname: 'Tesla Inc.', longname: 'Tesla Inc.' },
            { symbol: 'META', shortname: 'Meta Platforms Inc.', longname: 'Meta Platforms Inc.' },
            { symbol: 'NVDA', shortname: 'NVIDIA Corporation', longname: 'NVIDIA Corporation' },
            { symbol: 'JPM', shortname: 'JPMorgan Chase & Co.', longname: 'JPMorgan Chase & Co.' },
            { symbol: 'JNJ', shortname: 'Johnson & Johnson', longname: 'Johnson & Johnson' },
            { symbol: 'V', shortname: 'Visa Inc.', longname: 'Visa Inc. Class A' }
          ].filter(item => 
            item.symbol.toLowerCase().includes(query.toLowerCase()) ||
            item.shortname.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10)
        };
        return NextResponse.json(mockResults);
      }

      try {
        const searchUrl = `${API_SOURCES.YAHOO_V7}/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10`;
        const searchData = await fetchWithFallback(searchUrl);
        return NextResponse.json(searchData);
      } catch (error) {
        console.error('Search API error, using mock data');
        // Fallback to mock data
        const mockResults = {
          quotes: [
            { symbol: 'AAPL', shortname: 'Apple Inc.', longname: 'Apple Inc.' },
            { symbol: 'MSFT', shortname: 'Microsoft Corporation', longname: 'Microsoft Corporation' },
          ].filter(item => 
            item.symbol.toLowerCase().includes(query.toLowerCase()) ||
            item.shortname.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10)
        };
        return NextResponse.json(mockResults);
      }
    }

    // 📈 Get stock data for specific symbol
    if (symbol) {
      if (useMockData) {
        // Mock stock data with realistic prices
        const mockStockData = {
          chart: {
            result: [{
              meta: {
                symbol: symbol.toUpperCase(),
                regularMarketPrice: Math.random() * 500 + 50,
                chartPreviousClose: Math.random() * 500 + 50,
                regularMarketOpen: Math.random() * 500 + 50,
                regularMarketVolume: Math.floor(Math.random() * 10000000),
                marketCap: Math.floor(Math.random() * 1000000000000),
                instrumentName: symbol.toUpperCase() + ' Company'
              }
            }]
          }
        };
        // Add some variation to make it realistic
        mockStockData.chart.result[0].meta.regularMarketPrice = 
          mockStockData.chart.result[0].meta.chartPreviousClose * (1 + (Math.random() * 0.1 - 0.05));
        return NextResponse.json(mockStockData);
      }

      try {
        const chartUrl = `${API_SOURCES.YAHOO}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
        const chartData = await fetchWithFallback(chartUrl);
        
        if (!chartData.chart?.result?.[0]) {
          throw new Error('No chart data received');
        }
        
        return NextResponse.json(chartData);
      } catch (error) {
        console.error('Chart API error, using mock data');
        // Fallback to mock data
        const mockStockData = {
          chart: {
            result: [{
              meta: {
                symbol: symbol.toUpperCase(),
                regularMarketPrice: 150 + Math.random() * 100,
                chartPreviousClose: 150 + Math.random() * 100,
                regularMarketOpen: 150 + Math.random() * 100,
                regularMarketVolume: Math.floor(Math.random() * 10000000),
                marketCap: Math.floor(Math.random() * 1000000000000),
                instrumentName: symbol.toUpperCase() + ' Company'
              }
            }]
          }
        };
        return NextResponse.json(mockStockData);
      }
    }

    // 📊 Get top movers
    if (type) {
      if (useMockData) {
        switch (type) {
          case 'day_gainers':
            return NextResponse.json({ quotes: mockMovers.gainers });
          case 'day_losers':
            return NextResponse.json({ quotes: mockMovers.losers });
          case 'most_actives':
            return NextResponse.json({ quotes: mockMovers.actives });
          default:
            return NextResponse.json({ quotes: [] });
        }
      }

      try {
        let moverType = '';
        switch (type) {
          case 'day_gainers':
            moverType = 'day_gainers';
            break;
          case 'day_losers':
            moverType = 'day_losers';
            break;
          case 'most_actives':
            moverType = 'most_actives';
            break;
          default:
            return NextResponse.json({ quotes: [] });
        }

        const moversUrl = `${API_SOURCES.YAHOO_V7}/v1/finance/screener/predefined/saved?formatted=true&scrIds=${moverType}&count=10&lang=en-US&region=US`;
        const moversData = await fetchWithFallback(moversUrl);
        
        // If no data, return mock data as fallback
        if (!moversData.finance?.result?.[0]?.quotes && !moversData.quotes) {
          console.log('No movers data, using mock data');
          switch (type) {
            case 'day_gainers':
              return NextResponse.json({ quotes: mockMovers.gainers });
            case 'day_losers':
              return NextResponse.json({ quotes: mockMovers.losers });
            case 'most_actives':
              return NextResponse.json({ quotes: mockMovers.actives });
          }
        }
        
        return NextResponse.json(moversData);
      } catch (error) {
        console.error('Movers API error, using mock data');
        // Fallback to mock data
        switch (type) {
          case 'day_gainers':
            return NextResponse.json({ quotes: mockMovers.gainers });
          case 'day_losers':
            return NextResponse.json({ quotes: mockMovers.losers });
          case 'most_actives':
            return NextResponse.json({ quotes: mockMovers.actives });
          default:
            return NextResponse.json({ quotes: [] });
        }
      }
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}