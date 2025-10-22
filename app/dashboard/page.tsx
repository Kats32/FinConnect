"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Settings, Home, MessageSquare, LogOut, Search, Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Article {
  title: string;
  description: string;
  urlToImage?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello there! How may I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        console.log("Fetched news:", data.articles);
        setNewsData(data.articles || []);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };
    fetchNews();
  }, []);
  const [newsData, setNewsData] = useState<any[]>([]);

  const handleSend = () => {
    if (!input.trim()) return;
    setChatMessages([...chatMessages, { sender: "user", text: input }]);
    setInput("");
  };

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-20 bg-zinc-950 flex flex-col justify-between py-6 items-center border-r border-zinc-800">
        <div className="flex flex-col gap-6 items-center">
          <Home className="text-zinc-400 hover:text-white" />
          <LineChart className="text-zinc-400 hover:text-white" />
          <MessageSquare className="text-zinc-400 hover:text-white" />
          <Settings className="text-zinc-400 hover:text-white" />
        </div>
        <LogOut className="text-zinc-400 hover:text-red-400 mb-2" />
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
            <Search className="text-zinc-400 hover:text-white" />
            <Bell className="text-zinc-400 hover:text-white" />
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Market Simulator */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Market Simulator</h2>
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
            <div className="text-6xl text-white mb-4">📈</div>
            <p className="text-gray-400 text-sm mb-1">Virtual Balance</p>
            <h3 className="text-2xl font-semibold">$80,300</h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-green-400 text-sm">3.2%</span>
              
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </div>
            <button 
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-medium"
              onClick={() => router.push("/trading-simulator")}
            >
              Start Trading
            </button>
          </motion.div>

          {/* Market Analyzer */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Market Analyzer</h2>
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
            <div className="text-6xl text-white mb-4">📊</div>
            <p className="text-gray-400 text-sm mb-1">ML Accuracy</p>
            <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
              <div className="bg-purple-500 h-2 rounded-full w-[95%]" />
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Past 3 Weeks</span>
              <span>95%</span>
            </div><br></br>
            <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-medium">
              Analyze With AI
            </button>
          </motion.div>

          {/* Companies */}
          {/* Companies */}
<div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-md">
  <div className="flex justify-between items-start mb-4">
    <h2 className="text-lg font-medium">Companies</h2>
    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  </div>
  <div className="space-y-3">
    {[
      { name: "Apple", price: 178.42, change: 2.34, logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg  "},
      { name: "Google", price: 412.18, change: 1.89, logo: "https://www.svgrepo.com/show/475656/google-color.svg  " },
      { name: "Playstation", price: 142.65, change: -0.87, logo: "\playstation logo.jpg" },
      { name: "Megogo", price: 178.35, change: 3.21, logo: "https://store-images.s-microsoft.com/image/apps.22084.13544732291946572.2b731575-b5d5-4ecf-b82a-ab4647440d8f.83e41618-3d8a-4819-bee0-88081e1224c7  " },
    ].map((c, i) => (
      <div key={i} className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
            <img
              src={c.logo}
              alt={c.name}
              className="w-5 h-5 object-contain"
            />
          </div>
          <p>{c.name}</p>
        </div>
        <div className="text-right">
          <p>${c.price}</p>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm ${
                c.change >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {c.change >= 0 ? "▲" : "▼"} {Math.abs(c.change)}%
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* News */}
          {/* News (Live Carousel) */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Live Stock & Business News</h2>
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>

            {/* Scrolling carousel */}
            <div className="relative w-full overflow-x-auto whitespace-nowrap scrollbar-hide animate-scroll">
              {newsData.map((article: any, i: number) => (
                <div
                  key={i}
                  className="inline-block w-72 mx-2 bg-zinc-800 rounded-xl p-3 align-top"
                >
                  <img
                    src={article.urlToImage || "https://via.placeholder.com/300x200"}
                    alt={article.title}
                    className="rounded-lg mb-2 h-32 w-full object-cover"
                  />
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-3">{article.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chatbot */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Chatbot</h2>
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <p
                    className={`px-3 py-2 rounded-xl max-w-[75%] ${
                      msg.sender === "user"
                        ? "bg-purple-600"
                        : "bg-zinc-800 text-gray-200"
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex mt-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="type...."
                className="flex-1 bg-zinc-800 px-3 py-2 rounded-l-lg focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-purple-600 px-4 rounded-r-lg hover:bg-purple-700"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}