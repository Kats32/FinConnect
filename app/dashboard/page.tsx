"use client";

import React, { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Article {
  title: string;
  description: string;
  urlToImage?: string;
  url?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello there! How may I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [newsData, setNewsData] = useState<Article[]>([]);

  const [isTyping, setIsTyping] = useState(false);

  // Helper to read cookies
  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  // Call clear_conversation when the page is reloaded/unloaded (use sendBeacon for reliability)
  useEffect(() => {
    const url = "http://127.0.0.1:8000/clear_conversation";

    const sendClear = async () => {
      try {
        const user_id = getCookie("user_id") || "000";
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        });
      } catch (err) {
        console.error("Error calling clear_conversation on mount:", err);
      }
    };

    const handleBeforeUnload = () => {
      const user_id = getCookie("user_id") || "000";
      const payload = JSON.stringify({ user_id });

      if (navigator && "sendBeacon" in navigator) {
        const blob = new Blob([payload], { type: "application/json" });
        try {
          navigator.sendBeacon(url, blob);
        } catch (err) {
          // fall through to sync XHR fallback if sendBeacon fails
          try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, false);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(payload);
          } catch (e) {
            console.error("Failed to send clear_conversation on unload:", e);
          }
        }
      } else {
        // synchronous XHR fallback for older browsers
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", url, false);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(payload);
        } catch (e) {
          console.error("Failed to send clear_conversation on unload:", e);
        }
      }
    };

    // Call once on mount (in case of a fresh load that should clear prior conversation)
    sendClear();

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
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

  const handleSend = () => {
    if (!input.trim()) return;
    setChatMessages([...chatMessages, { sender: "user", text: input }]);
    setIsTyping(true);


    (async () => {
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      };

      const user_id = getCookie("user_id") || "000";
      const username = getCookie("user_name") || getCookie("user") || "Anonymous";

      const payload = {
        user_id,
        message: input,
        user_profile: {
          username,
          preferences: {
            language: "en",
            timezone: "UTC",
          },
        },
      };

      try {
        const res = await fetch("http://127.0.0.1:8000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        console.log("Chatbot response data:", data);
        const botText =
          (data && (data.response || data.reply || data.bot)) ||
          "Received no reply from server.";

        setChatMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      } catch (err) {
        console.error("Chat request error:", err);
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Failed to reach chat server." },
        ]);
      } finally {
      setIsTyping(false);
      }
    })();

    setInput("");
  };

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Inject animation styles */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          display: flex;
          gap: 0.5rem;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="w-20 bg-zinc-950 flex flex-col justify-between py-6 items-center border-r border-zinc-800">
        <div className="flex flex-col gap-6 items-center">
          <Home
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/dashboard")}
          />
          <LineChart className="text-zinc-400 hover:text-white"
           onClick={() => router.push("/companies")} />
          <MessageSquare
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/news")}
          />
          <Settings
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/dashboard/settings")}
          />
        </div>
        <LogOut className="text-zinc-400 hover:text-red-400 mb-2" 
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
            <Search className="text-zinc-400 hover:text-white" />
            <Bell className="text-zinc-400 hover:text-white" />
            <div
              className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center cursor-pointer hover:bg-zinc-600"
              onClick={() => router.push("/dashboard/profile")}
            >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-8 max-w-2xl mx-auto">
              <div className="text-6xl text-white mb-4">📈</div>
              <p className="text-gray-400 text-sm mb-1">Virtual Balance</p>
              <h3 className="text-2xl font-semibold text-white">
                You are starting with a virtual balance of{" "}
                <span className="text-green-400">$10,000</span>
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Trade safely — no real money involved, just learn and experiment!
              </p>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
            <div className="text-6xl text-white mb-4">📊</div>
            <p className="text-gray-400 text-sm mb-1">ML Accuracy</p>
            <br></br>
            <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
              <div className="bg-purple-500 h-2 rounded-full w-[95%]" />
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Past 3 Weeks</span>
              <span>95%</span>
            </div>
            <br />
            <br></br>
            <br></br>
            <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-medium">
              Analyze With AI
            </button>
          </motion.div>

          {/* Companies */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Companies</h2>
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  name: "Apple",
                  price: 178.42,
                  change: 2.34,
                  logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
                },
                {
                  name: "Google",
                  price: 412.18,
                  change: 1.89,
                  logo: "https://www.svgrepo.com/show/475656/google-color.svg",
                },
                {
                  name: "Playstation",
                  price: 142.65,
                  change: -0.87,
                  logo: "/playstation logo.jpg",
                },
                {
                  name: "Megogo",
                  price: 178.35,
                  change: 3.21,
                  logo: "https://store-images.s-microsoft.com/image/apps.22084.13544732291946572.2b731575-b5d5-4ecf-b82a-ab4647440d8f.83e41618-3d8a-4819-bee0-88081e1224c7",
                },
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
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Live Stock Market & Business News</h2>
              <div
                className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center cursor-pointer hover:bg-zinc-600"
                onClick={() => router.push("/news")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex gap-4">
                {newsData.length > 0 ? (
                  newsData.map((article, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 bg-zinc-900 border border-zinc-700 rounded-xl p-4 w-[280px]"
                    >
                      {article.urlToImage && (
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-white text-sm mb-1 truncate">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-3 mb-1">
                        {article.description}
                      </p>
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 text-xs hover:underline"
                        >
                          Read more →
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Loading news...</p>
                )}
              </div>
            </div>      
          </motion.div>

          {/* Chatbot */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl flex flex-col h-[375px]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Chatbot</h2>
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>

            {/* Chat messages scrollable area */}
            <div
              className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1"
              role="log"
              aria-live="polite"
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl max-w-[75%] break-words ${
                      msg.sender === "user"
                        ? "bg-purple-600"
                        : "bg-zinc-800 text-gray-200"
                    }`}
                  >
                    <div className="prose prose-invert max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
               {/* ← Put the typing indicator here */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-xl bg-zinc-800 text-gray-200 max-w-[75%]">
                      <div className="flex gap-1">
                        <span className="dot animate-bounce">•</span>
                        <span className="dot animate-bounce animation-delay-200">•</span>
                        <span className="dot animate-bounce animation-delay-400">•</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Input */}
            <div className="flex mt-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type..."
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
