// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen font-sans">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-purple-900/30 to-black/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-12 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              ✦
            </div>
            <span className="font-semibold">FinConnect</span>
          </div>

          {/* Right Button */}
          <Link
            href="/signUp"
            className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-purple-900/40 to-black overflow-hidden">
        {/* Decorative stars */}
        <div className="absolute top-16 left-1/4 text-gray-300 opacity-60">✦</div>
        <div className="absolute top-32 right-1/3 text-gray-300 opacity-60">✦</div>
        <div className="absolute bottom-32 left-1/3 text-gray-300 opacity-60">✦</div>
        <div className="absolute bottom-20 right-1/4 text-gray-300 opacity-60">✦</div>

        <h1 className="text-3xl md:text-4xl font-normal mb-2 tracking-tight">FinConnect</h1>
        <h2 className="text-4xl md:text-6xl font-normal mb-4 leading-tight max-w-2xl mx-auto">
          Master Your<br />
          Financial Future
        </h2>
        <p className="text-gray-400 max-w-lg mb-8 text-sm md:text-base">
          Master your financial future with Finconnect's AI-powered advisory, comprehensive market analysis, and risk-free trading simulations. Join millions of successful investors.
        </p>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-3 border border-purple-500 text-purple-400 rounded-full hover:bg-purple-600/20 transition text-sm md:text-base"
          >
            Sign in
          </Link>
          <Link
            href="/signUp"
            className="px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition text-sm md:text-base"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-normal mb-12">
          More features <span className="text-purple-400">FinConnect</span> offers to an individual
        </h2>
        <div className="grid gap-8 max-w-4xl mx-auto">
          {[
            {
              title: "AI-Powered Financial Advisory",
              logo: "/robot.svg",
              desc: "Get personalized investment advice and financial planning from our advanced AI chatbot that understands your goals and risk tolerance."
            },
            {
              title: "Company Intelligence Hub",
              logo: "/robot.svg",
              desc: "Access comprehensive company profiles with detailed stock history, financial reports and real-time news feeds to make informed decisions."
            },
            {
              title: "Advanced Market Analyzer",
              logo: "/robot.svg",
              desc: "Leverage powerful analytics tools to identify market trends, analyse patterns, and discover investment opportunities across global markets."
            },
            {
              title: "Risk-Free Trading Simulator",
              logo: "/robot.svg",
              desc: "Practice your trading strategies in a realistic environment with virtual money before investing real capital in the markets."
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="border border-purple-500 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/20 transition flex flex-col items-center text-center"
            >
              <Image
                src={feature.logo}
                alt={feature.title}
                width={60}
                height={60}
                className="mb-4 invert"
              />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Success Section */}
      <section className="py-20 bg-black text-center px-6">
        <h2 className="text-3xl md:text-4xl font-normal mb-4">
          Everything You Need to
          <span className="text-purple-400"> Succeed</span>
        </h2>
        <p className="text-gray-400 mb-12 text-sm md:text-base">Ask Our AI</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            "What are the top 3 undervalued stocks to buy right now for long-term growth?",
            "How can I build a diversified portfolio with only $5,000?",
            "Explain technical indicators like RSI and MACD for beginners.",
            "Which sectors are expected to outperform in the next 6 months?",
            "How do I set stop-loss and take-profit levels for my trades?",
            "What’s the best time of day to trade tech stocks?",
            "Can you explain options trading for someone new to derivatives?",
            "How does inflation impact stock prices, and what should I invest in during high inflation?",
            "Show me a backtested trading strategy for swing trading S&P 500 stocks."
          ].map((question, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-purple-500 transition group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white text-sm leading-tight mb-1">
                    {question}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-center px-6">
        <div className="bg-black rounded-2xl p-16 max-w-4xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl font-normal mb-4 leading-tight text-white">
            <span className="text-purple-400">FinConnect</span> has no limitation.
          </h2>
          <p className="text-xl md:text-2xl font-light text-white mb-8">Get Started in a journey</p>
          <Link
            href="/signUp"
            className="px-8 py-3 bg-white text-black rounded-full hover:bg-gray-100 transition font-medium inline-block"
          >
            Create an Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-800 bg-black text-gray-500 text-sm">
        <div className="max-w-xl mx-auto px-6">
          <div className="mb-8 text-left">
            <h3 className="text-xs uppercase tracking-wider mb-2">Contact us</h3>
            <div className="text-xs space-y-1">
              <p>Maniraj B – 2023BCS0176</p>
              <p>Harissh Raghav – 2023BCD0059</p>
              <p>Kavya Amrutha – 2023BCS0221</p>
              <p>Pranathi Allu – 2023BCD0065</p>
              <p>Uma Maheswar Reddy – 2023BCS0155</p>
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-xs uppercase tracking-wider mb-2">Location</h3>
            <p className="text-xs">IIT Kottayam</p>
          </div>
        </div>
      </footer>
    </main>
  );
}