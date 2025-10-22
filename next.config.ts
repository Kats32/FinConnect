import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_NEWS_API_KEY: process.env.NEWS_API_KEY,
  },
};

export default nextConfig;
