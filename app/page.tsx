import Image from "next/image";

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
    <button className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition">
      Get Started
    </button>
  </div>
</nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-purple-900/40 to-black overflow-hidden">
        {/* Decorative stars */}
        <div className="absolute top-16 left-1/4 text-gray-300 opacity-60">✦</div>
        <div className="absolute top-32 right-1/3 text-gray-300 opacity-60">✦</div>
        <div className="absolute bottom-32 left-1/3 text-gray-300 opacity-60">✦</div>
        <div className="absolute bottom-20 right-1/4 text-gray-300 opacity-60">✦</div>

        {/* Hero Content */}
        <h1 className="text-3xl md:text-4xl font-normal mb-2 tracking-tight">
          FinConnect
        </h1>

        {/* Main Headline */}
        <h2 className="text-4xl md:text-6xl font-normal mb-4 leading-tight max-w-2xl mx-auto">
          Master Your<br />
          Financial Future
        </h2>

        {/* Subtext */}
        <p className="text-gray-400 max-w-lg mb-8 text-sm md:text-base">
          Master your financial future with Finconnect's AI-powered advisory, comprehensive market analysis, and risk-free trading simulations. Join millions of successful investors.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button className="px-6 py-3 border border-purple-500 text-purple-400 rounded-full hover:bg-purple-600/20 transition text-sm md:text-base">
            Sign in
          </button>
          <button className="px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition text-sm md:text-base">
            Get Started
          </button>
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
  <p className="text-gray-400 mb-12 text-sm md:text-base">
    Ask Our AI
  </p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-purple-500 transition group cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-white text-sm leading-tight mb-1">
              Write a attractive hero title for the following website
            </p>
            <a
              href="https://zeltalabs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-xs flex items-center gap-1 hover:underline"
            >
              https://zeltalabs.com/
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline ml-1 group-hover:translate-x-1 transition-transform"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="9" y1="9" x2="21" y2="21" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

 {/* CTA Section */}
<section className="py-20 bg-black text-center px-6">
  <div className="bg-black rounded-2xl p-16 max-w-4xl mx-auto relative">
    {/* Content */}
    <h2 className="text-3xl md:text-4xl font-normal mb-4 leading-tight text-white">
      <span className="text-purple-400">FinConnect</span> has no limitation.
    </h2>
    <p className="text-xl md:text-2xl font-light text-white mb-8">
      Get Started in a journey
    </p>
    <button className="px-8 py-3 bg-white text-black rounded-full hover:bg-gray-100 transition font-medium">
      Create an Account
    </button>
  </div>
</section>


{/* Footer */}
<footer className="py-10 border-t border-gray-800 bg-black text-gray-500 text-sm">
  {/* Match the CTA card's max-width and center it */}
  <div className="max-w-xl mx-auto px-6">
    {/* Contact Us Section */}
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

    {/* Location Section */}
    <div className="text-left">
      <h3 className="text-xs uppercase tracking-wider mb-2">Location</h3>
      <p className="text-xs">IIT Kottayam</p>
    </div>
  </div>
</footer>
    </main>
  );
}