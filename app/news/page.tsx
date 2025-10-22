"use client";
import React, { useEffect, useState } from "react";
import { LineChart, Settings, Home, MessageSquare, LogOut, Search, Bell, User, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profile_picture: string;
  is_verified: boolean;
}

const NewsPage = () => {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        console.log("Fetched news:", data.articles);
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            const res = await fetch(`/api/profile?userId=${user.id}`);
            const data = await res.json();
            
            if (res.ok && data.user) {
              setUserProfile(data.user);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    router.push('/login');
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading live stock news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar - Same as dashboard */}
      <aside className="w-20 bg-zinc-950 flex flex-col justify-between py-6 items-center border-r border-zinc-800">
        <div className="flex flex-col gap-6 items-center">
          {/* Home */}
          <div 
            className="p-2 rounded-xl hover:bg-zinc-800 cursor-pointer transition-colors"
            onClick={() => router.push("/dashboard")}
          >
            <Home className="text-zinc-400 hover:text-white" />
          </div>

          {/* Line Chart */}
          <LineChart className="text-zinc-400 hover:text-white cursor-pointer" />
          
          {/* Message Square - Active */}
          <div className="p-2 rounded-xl bg-zinc-800">
            <MessageSquare className="text-white cursor-pointer" />
          </div>

          {/* Settings */}
          <Settings
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/dashboard/settings")}
          />
        </div>

        <LogOut
          className="text-zinc-400 hover:text-red-400 mb-2 cursor-pointer"
          onClick={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-6">
        {/* Header - Same as dashboard */}
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
              className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer border border-zinc-600"
              onClick={() => router.push("/dashboard/profile")}
            >
              {!isLoading && userProfile?.profile_picture ? (
                <img
                  src={userProfile.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Live Stock Market & Business News
          </h1>
          <p className="text-gray-400">
            Stay updated with the latest financial news and market insights
          </p>
          
          {/* Search Bar */}
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group"
            >
              {article.urlToImage && (
                <div className="relative overflow-hidden">
                  <img
                    src={article.urlToImage}
                    alt="news"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />
                </div>
              )}
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                    {article.source.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h2 className="font-semibold mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {article.title}
                </h2>
                
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {article.description || "No description available."}
                </p>
                
                <div className="flex items-center justify-between">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors group/link"
                  >
                    Read full article
                    <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No articles found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms to find relevant news.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewsPage;