"use client";

import React, { useState } from "react";
import { ArrowLeft, Mail, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setMessage("Verification code sent to your email!");
      } else {
        setMessage(data.error || "Failed to send verification code");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(3);
        setMessage("Password reset successfully!");
      } else {
        setMessage(data.error || "Failed to reset password");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <nav className="bg-gradient-to-r from-purple-900/30 to-black/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              ✦
            </div>
            <span className="font-semibold">FinConnect</span>
          </div>
          
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              {step === 1 && "Reset Your Password"}
              {step === 2 && "Verify Your Identity"}
              {step === 3 && "Password Reset"}
            </h1>
            <p className="text-gray-400">
              {step === 1 && "Enter your email to receive a verification code"}
              {step === 2 && "Enter the code sent to your email"}
              {step === 3 && "Your password has been reset successfully"}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex flex-col items-center ${stepNumber < 3 ? 'mr-16' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step >= stepNumber 
                        ? 'bg-purple-600 border-purple-600' 
                        : 'bg-zinc-800 border-zinc-700'
                    }`}>
                      {step > stepNumber ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm">{stepNumber}</span>
                      )}
                    </div>
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 -mt-4 ${
                      step > stepNumber ? 'bg-purple-600' : 'bg-zinc-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {message && (
                <p className="text-yellow-400 text-sm text-center">{message}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition disabled:opacity-50"
              >
                {isLoading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* Step 2: OTP and New Password */}
          {step === 2 && (
            <form onSubmit={verifyOtpAndReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500 text-center text-xl tracking-widest"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {message && (
                <p className={`text-sm text-center ${
                  message.includes("successfully") ? "text-green-400" : "text-red-400"
                }`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition disabled:opacity-50"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition"
              >
                Back to Email
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Password Reset Successful!</h3>
                <p className="text-gray-400">
                  Your password has been reset successfully. You can now login with your new password.
                </p>
              </div>

              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              We'll send a verification code to your email to reset your password.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}