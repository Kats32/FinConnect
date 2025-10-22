"use client";
import React, { useEffect, useState } from "react";

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

const NewsPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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

  fetchNews();
}, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        Loading live stock news...
      </div>
    );
  }

  return (
    <main className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-400">
        📈 Live Stock Market & Company News
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
          >
            {a.urlToImage && (
              <img
                src={a.urlToImage}
                alt="news"
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{a.title}</h2>
              <p className="text-sm text-gray-300 mb-3">
                {a.description || "No description available."}
              </p>
              <div className="text-xs text-gray-500 mb-2">
                {new Date(a.publishedAt).toLocaleString()} — {a.source.name}
              </div>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300"
              >
                Read full article →
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default NewsPage;