import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing NEWS_API_KEY in .env.local");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=50&apiKey=${apiKey}`
    );

    const data = await res.json();
    console.log("Fetched from API:", data);

    if (!data.articles) {
      return NextResponse.json({ articles: [] });
    }

    return NextResponse.json({ articles: data.articles });
  } catch (err) {
    console.error("Error fetching news:", err);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
