// app/login/page.tsx
'use client';

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", formData);
  };

  return (
    <main className="min-h-screen flex flex-col bg-black text-white relative overflow-hidden">
      {/* Top bar */}
      <nav className="bg-gradient-to-r from-purple-900/30 to-black/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-12 py-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              ✦
            </div>
            <span className="font-semibold">FinConnect</span>
          </div>
          <Link
            href="/signUp"
            className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-950/40 to-transparent pointer-events-none"></div>

        <div className="absolute top-16 left-1/4 text-gray-300 opacity-60">✦</div>
        <div className="absolute top-32 right-1/3 text-gray-300 opacity-60">✦</div>
        <div className="absolute bottom-32 left-1/11 text-gray-300 opacity-60">✦</div>
        <div className="absolute bottom-20 right-1/4 text-gray-300 opacity-60">✦</div>
        <div className="absolute top-10 right-1/5 text-gray-300 opacity-40">✦</div>

        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl px-6 md:px-16 mt-20">
          {/* Left side form */}
          <div className="w-full md:w-1/2 max-w-md space-y-6">
            <h2 className="text-4xl mb-2">
              Welcome <span className="text-purple-400">Back!</span>
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="username@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-white text-black border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-white text-black border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <a href="#" className="text-sm text-purple-400 hover:underline">
                    Forgot Password?
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-300">Remember me</label>
              </div>

              <button
                type="submit"
                className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-md transition font-medium"
              >
                Sign In
              </button>

              <div className="text-center text-gray-400 text-sm mt-2">Or Continue With</div>

              <button
                type="button"
                className="flex justify-center items-center gap-2 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Google
              </button>
            </form>
            <p className="text-gray-400 text-sm mt-4 text-center">
              Don’t have an account yet?{" "}
              <Link href="/signUp" className="text-purple-400 hover:underline">
                Register
              </Link>
            </p>
          </div>

          {/* Right side globe */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/3 w-[350px] md:w-[450px]">
            <img
              src="https://static.tildacdn.com/tild3363-3136-4039-a165-663366373234/__2023-03-17__104716.png"
              alt="Globe Animation"
              className="w-[350px] md:w-[450px] rounded-full"
            />
          </div>
        </div>
      </section>
    </main>
  );
}