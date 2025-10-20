// app/signUp/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";


export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("/api/signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <img
            src="/signUp-image.png"
            alt="FinConnect Sign Up Background"
            className="max-w-[85%] max-h-[83vh] object-contain"
          />
        </div>
        <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold">✦</span>
          </div>
          <span className="font-semibold">FinConnect</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-700/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-purple-900/50"></div>

        <div className="absolute top-10 right-10 text-white opacity-70">✦</div>
        <div className="absolute top-1/3 right-10 text-white opacity-50">✦</div>
        <div className="absolute bottom-10 right-10 text-white opacity-60">✦</div>

        <div className="max-w-md w-full z-10">
          <h1 className="text-3xl md:text-4xl font-normal mb-8">
            Set up your <span className="text-purple-400">Account</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="name"
                className="w-full px-4 py-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="username@gmail.com"
                className="w-full px-4 py-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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

            <div><br></br>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-4 py-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Sign Up
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-sm text-gray-400">Or Continue With</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          <button
            type="button"
            className="w-full py-3 bg-white text-black rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            onClick={() => {
              // generate a random state to mitigate CSRF attacks
              const state = Math.random().toString(36).substring(2);
              sessionStorage.setItem("google_oauth_state", state);

              // build Google OAuth URL
              const params = new URLSearchParams({
                client_id: "319945677677-njn88jhvv4bsrgp7acau5tlnccl1h7e9.apps.googleusercontent.com", // safe to expose
                redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
                response_type: "code",
                scope: "openid email profile",
                access_type: "offline",
                prompt: "select_account",
                state,
              });

              // redirect to Google OAuth
              window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
            }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Continue with Google</span>
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already Have an Account?{' '}
            <Link href="/login" className="text-purple-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}