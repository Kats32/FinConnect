'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      setIsLoading(false);
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
        setStep(2); // Move to OTP verification
        setMessage("Verification code sent to your email!");
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp, type: 'verification' }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Account verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, type: 'verification' }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Verification code sent again!");
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to resend verification code");
    } finally {
      setIsLoading(false);
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
          {step === 1 ? (
            <>
              <h1 className="text-3xl md:text-4xl font-normal mb-8">
                Set up your <span className="text-purple-400">Account</span>
              </h1>

              {message && (
                <div className={`p-3 rounded-lg mb-4 ${
                  message.includes('successfully') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
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
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                </div>

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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-normal mb-8">
                Verify Your <span className="text-purple-400">Email</span>
              </h1>

              {message && (
                <div className={`p-3 rounded-lg mb-4 ${
                  message.includes('successfully') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={verifyOtp} className="space-y-6">
                <div>
                  <p className="text-gray-300 mb-4">
                    We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                  </p>
                  <label className="block text-sm font-medium mb-1">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-xl tracking-widest"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify Account"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={isLoading}
                    className="text-purple-400 hover:underline text-sm disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Didn't receive code? Resend"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Back to Sign Up
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 1 && (
            <>
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-sm text-gray-400">Or Continue With</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              <button
                type="button"
                className="w-full py-3 bg-white text-black rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  const state = Math.random().toString(36).substring(2);
                      sessionStorage.setItem('google_oauth_state', state);
                  const params = new URLSearchParams({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "319945677677-njn88jhvv4bsrgp7acau5tlnccl1h7e9.apps.googleusercontent.com",
                    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback",
                    response_type: "code",
                    scope: "openid email profile",
                    access_type: "offline",
                    prompt: "select_account",
                    state,
                  });
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}