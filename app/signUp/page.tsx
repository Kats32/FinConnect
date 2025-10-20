'use client';

import { useState } from 'react';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signing up with:', formData);
    alert('Sign Up functionality not implemented yet.');
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side - Back to 50% width */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black">
        {/* Centered image container */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <img
            src="/signUp-image.png"
            alt="FinConnect Sign Up Background"
            className="max-w-[85%] max-h-[83vh] object-contain"
          />
        </div>

        {/* Logo (on top of image) */}
        <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold">✦</span>
          </div>
          <span className="font-semibold">FinConnect</span>
        </div>
      </div>

      {/* Right Side - Form with Purple Gradient & Stars */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-700/30"></div>
        {/* Purple Gradient Overlay - Radial from right side */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-purple-900/50"></div>

        {/* Floating Stars */}
        <div className="absolute top-10 right-10 text-white opacity-70">✦</div>
        <div className="absolute top-1/3 right-10 text-white opacity-50">✦</div>
        <div className="absolute bottom-10 right-10 text-white opacity-60">✦</div>

        {/* Form Container - Removed 'mx-auto' to align left */}
        <div className="max-w-md w-full z-10">
          <h1 className="text-3xl md:text-4xl font-normal mb-8">
            Set up your <span className="text-purple-400">Account</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
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

            {/* Email Field */}
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

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div>
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Sign Up
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-sm text-gray-400">Or Continue With</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full py-3 bg-white text-black rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
            <span>Continue with Google</span>
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already Have an Account?{' '}
            <a href="/signin" className="text-purple-400 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}