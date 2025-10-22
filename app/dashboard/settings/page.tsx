"use client";

import React, { useState, useEffect } from "react";
import { Save, Bell, Palette, Globe, Shield, CreditCard, LogOut, LineChart, Settings, Home, MessageSquare, Search, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface UserPreferences {
  theme: string;
  notifications_enabled: boolean;
  language: string;
  currency: string;
  email_notifications: boolean;
  push_notifications: boolean;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profile_picture: string;
  is_verified: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    notifications_enabled: true,
    language: 'en',
    currency: 'USD',
    email_notifications: true,
    push_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Get user ID from localStorage
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData).id : '1';
    }
    return '1';
  };

  useEffect(() => {
    fetchPreferences();
    fetchUserProfile();
  }, []);

  const fetchPreferences = async () => {
    try {
      const userId = getUserId();
      const res = await fetch(`/api/preferences?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const res = await fetch(`/api/profile?userId=${user.id}`);
          const data = await res.json();
          
          if (res.ok && data.user) {
            setUserProfile(data.user);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userId = getUserId();
      const res = await fetch(`/api/preferences?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar - Same as dashboard */}
      <aside className="w-20 bg-zinc-950 flex flex-col justify-between py-6 items-center border-r border-zinc-800">
        <div className="flex flex-col gap-6 items-center">
          {/* Home */}
          <div 
            className="p-2 rounded-xl hover:bg-zinc-800 cursor-pointer transition-colors"
            onClick={() => router.push("/dashboard")}
          >
            <Home className="text-zinc-400 hover:text-white" />
          </div>

          {/* Line Chart */}
          <LineChart className="text-zinc-400 hover:text-white cursor-pointer" />
          
          {/* Message Square */}
          <MessageSquare
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/news")}
          />

          {/* Settings - Active */}
          <div className="p-2 rounded-xl bg-zinc-800">
            <Settings className="text-white cursor-pointer" />
          </div>
        </div>

        <LogOut
          className="text-zinc-400 hover:text-red-400 mb-2 cursor-pointer"
          onClick={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-6">
        {/* Header - Same as dashboard */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              ✦
            </div>
            <span className="font-semibold">FinConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Search className="text-zinc-400 hover:text-white cursor-pointer" />
            <Bell className="text-zinc-400 hover:text-white cursor-pointer" />
            <div 
              className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer border border-zinc-600"
              onClick={() => router.push("/dashboard/profile")}
            >
              {!profileLoading && userProfile?.profile_picture ? (
                <img
                  src={userProfile.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Settings & Preferences
              </h1>
              <p className="text-gray-400">
                Customize your FinConnect experience and manage your account preferences
              </p>
            </div>

            {/* Appearance Settings */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 shadow-lg border border-zinc-800">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Theme</label>
                  <div className="flex gap-3">
                    {['dark', 'light', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handlePreferenceChange('theme', theme)}
                        className={`px-4 py-2 rounded-lg border transition ${
                          preferences.theme === theme
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 shadow-lg border border-zinc-800">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'notifications_enabled', label: 'Enable All Notifications' },
                  { key: 'email_notifications', label: 'Email Notifications' },
                  { key: 'push_notifications', label: 'Push Notifications' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span>{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[key as keyof UserPreferences] as boolean}
                        onChange={(e) => handlePreferenceChange(key as keyof UserPreferences, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Settings */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 shadow-lg border border-zinc-800">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Financial Preferences</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Default Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Trading View</label>
                  <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500">
                    <option value="advanced">Advanced View</option>
                    <option value="simple">Simple View</option>
                    <option value="professional">Professional View</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 shadow-lg border border-zinc-800">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Security</h2>
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => router.push("/dashboard/change-password")}
                  className="block w-full text-left p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <div className="font-medium">Change Password</div>
                    <div className="text-sm text-gray-400">Update your account password</div>
                  </div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                </div>

                <div 
                  onClick={() => router.push("/dashboard/two-factor")}
                  className="block w-full text-left p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-400">Add an extra layer of security</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${preferences.notifications_enabled ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                </div>

                <div 
                  onClick={() => router.push("/dashboard/sessions")}
                  className="block w-full text-left p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <div className="font-medium">Active Sessions</div>
                    <div className="text-sm text-gray-400">Manage your logged-in devices</div>
                  </div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}