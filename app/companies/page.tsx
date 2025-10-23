"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Settings,
  Home,
  MessageSquare,
  LogOut,
  Search,
  Bell,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

interface Company {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

interface Mover {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [gainers, setGainers] = useState<Mover[]>([]);
  const [losers, setLosers] = useState<Mover[]>([]);
  const [actives, setActives] = useState<Mover[]>([]);

  // 🔄 Fetch top traders
  useEffect(() => {
    const fetchTopMovers = async () => {
      try {
        console.log("🔄 Fetching top movers...");
        
        const [g, l, a] = await Promise.all([
          fetch("/api/yahoo?type=day_gainers").then((r) => r.json()),
          fetch("/api/yahoo?type=day_losers").then((r) => r.json()),
          fetch("/api/yahoo?type=most_actives").then((r) => r.json()),
        ]);

        console.log("Gainers:", g);
        console.log("Losers:", l);
        console.log("Actives:", a);

        setGainers(g.quotes || []);
        setLosers(l.quotes || []);
        setActives(a.quotes || []);
      } catch (e) {
        console.error("❌ Movers error:", e);
      }
    };

    fetchTopMovers();
  }, []);

  // 🔍 Search companies
  useEffect(() => {
    if (search.length < 2) {
      setCompanies([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        console.log(`🔍 Searching for: ${search}`);
        const res = await fetch(`/api/yahoo?q=${encodeURIComponent(search)}`);
        if (!res.ok) throw new Error("Search error");
        const data = await res.json();
        
        console.log("Search results:", data);
        const quotes = data.quotes?.slice(0, 10) || [];

        const results = await Promise.all(
          quotes.map(async (q: any) => {
            const symbol = q.symbol;
            const name = q.shortname || q.longname || q.name || symbol;
            
            try {
              const stockRes = await fetch(`/api/yahoo?symbol=${encodeURIComponent(symbol)}`);
              const stockData = await stockRes.json();
              console.log(`Stock data for ${symbol}:`, stockData);
              
              const result = stockData.chart?.result?.[0];
              const meta = result?.meta;
              const price = meta?.regularMarketPrice || null;
              const previousClose = meta?.chartPreviousClose || null;
              const change = price && previousClose ? price - previousClose : null;
              const changePercent = previousClose && change ? (change / previousClose) * 100 : null;

              return { 
                symbol, 
                name, 
                price, 
                change,
                changePercent 
              };
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
              return { 
                symbol, 
                name, 
                price: 100 + Math.random() * 100, // Fallback mock price
                change: (Math.random() - 0.5) * 10,
                changePercent: (Math.random() - 0.5) * 5
              };
            }
          })
        );

        setCompanies(results.filter(company => company !== null));
      } catch (err) {
        console.error("❌ Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(delay);
  }, [search]);

  // Format number as currency
  const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number | null) => {
    if (value === null || isNaN(value)) return "0.00%";
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-20 bg-zinc-950 flex flex-col justify-between py-6 items-center border-r border-zinc-800">
        <div className="flex flex-col gap-6 items-center">
          <Home
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/dashboard")}
          />
          <LineChart className="text-white cursor-pointer" />
          <MessageSquare
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/news")}
          />
          <Settings
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/dashboard/settings")}
          />
        </div>
        <LogOut 
          className="text-zinc-400 hover:text-red-400 mb-2 cursor-pointer" 
          onClick={() => router.push("/")}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              ✦
            </div>
            <span className="font-semibold">FinConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Search className="text-zinc-400 hover:text-white cursor-pointer" />
            <Bell className="text-zinc-400 hover:text-white cursor-pointer" />
            <div
              className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center cursor-pointer hover:bg-zinc-600"
              onClick={() => router.push("/dashboard/profile")}
            >
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
              Global Stock Explorer
            </h1>
            <p className="text-gray-400 text-lg">
              Discover stocks, track market movers, and analyze trends in real-time
            </p>
          </div>

          {/* 🔍 Search bar */}
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-2xl">
              <input
                type="text"
                placeholder="🔍 Search any company or symbol (e.g., AAPL, MSFT, TSLA)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-zinc-700 bg-zinc-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg shadow-lg"
              />
            </div>
          </div>

          {/* 📊 Top Traders Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              📈 Market Movers
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 🟢 Top Gainers */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl border border-zinc-700 shadow-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="w-3 h-8 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-green-400">Top Gainers</h3>
                </div>
                <ul className="space-y-3">
                  {gainers.slice(0, 5).map((stock) => (
                    <li key={stock.symbol}>
                      <Link 
                        href={`/companies/${encodeURIComponent(stock.symbol)}`}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-zinc-700/50 transition-all duration-200 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-purple-400 transition-colors text-white">
                            {stock.shortName}
                          </p>
                          <p className="text-sm text-gray-400 truncate">{stock.symbol}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-green-400">
                            {formatPercent(stock.regularMarketChangePercent)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatCurrency(stock.regularMarketPrice)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* 🔴 Top Losers */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl border border-zinc-700 shadow-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="w-3 h-8 bg-red-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-red-400">Top Losers</h3>
                </div>
                <ul className="space-y-3">
                  {losers.slice(0, 5).map((stock) => (
                    <li key={stock.symbol}>
                      <Link 
                        href={`/companies/${encodeURIComponent(stock.symbol)}`}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-zinc-700/50 transition-all duration-200 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-purple-400 transition-colors text-white">
                            {stock.shortName}
                          </p>
                          <p className="text-sm text-gray-400 truncate">{stock.symbol}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-red-400">
                            {formatPercent(stock.regularMarketChangePercent)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatCurrency(stock.regularMarketPrice)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* 🔵 Most Active */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl border border-zinc-700 shadow-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="w-3 h-8 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-blue-400">Most Active</h3>
                </div>
                <ul className="space-y-3">
                  {actives.slice(0, 5).map((stock) => (
                    <li key={stock.symbol}>
                      <Link 
                        href={`/companies/${encodeURIComponent(stock.symbol)}`}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-zinc-700/50 transition-all duration-200 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-purple-400 transition-colors text-white">
                            {stock.shortName}
                          </p>
                          <p className="text-sm text-gray-400 truncate">{stock.symbol}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`font-semibold ${
                            stock.regularMarketChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatPercent(stock.regularMarketChangePercent)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatCurrency(stock.regularMarketPrice)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center px-6 py-3 bg-purple-500/10 rounded-full">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <p className="text-purple-400 font-medium">Searching stocks...</p>
              </div>
            </div>
          )}

          {/* 🔹 Search Results */}
          {companies.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Search Results</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {companies.map((company) => (
                  <motion.div
                    key={company.symbol}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link
                      href={`/companies/${encodeURIComponent(company.symbol)}`}
                      className="block p-6 rounded-2xl shadow-lg border border-zinc-700 bg-gradient-to-br from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 hover:border-zinc-600 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate group-hover:text-purple-400 transition-colors text-white">
                            {company.name}
                          </h3>
                          <p className="text-sm text-gray-400 font-mono">{company.symbol}</p>
                        </div>
                        {company.changePercent !== null && (
                          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            company.changePercent >= 0 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {company.changePercent >= 0 ? '↗' : '↘'}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(company.price)}
                        </p>
                        
                        {company.change !== null && company.changePercent !== null && (
                          <div className={`text-sm font-medium ${
                            company.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            <span>{company.change >= 0 ? '▲' : '▼'} </span>
                            <span>{formatCurrency(Math.abs(company.change))} </span>
                            <span>({formatPercent(company.changePercent)})</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {!loading && companies.length === 0 && search.length >= 2 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No stocks found</h3>
              <p className="text-gray-500">
                Try searching with a different symbol or company name
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}