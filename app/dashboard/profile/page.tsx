"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, Save, Edit3, Mail, Phone, Calendar, TrendingUp, BarChart3, Wallet, Award, Home, LineChart, MessageSquare, Settings, LogOut, Search, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  profile_picture: string;
  bio: string;
  created_at: string;
  is_verified: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date_of_birth: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        alert("No user logged in. Please login again.");
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/profile?userId=${userId}`);
      const data = await res.json();
      
      if (res.ok && data.user) {
        setProfile(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          date_of_birth: data.user.date_of_birth || '',
          bio: data.user.bio || '',
        });
      } else {
        console.error("Failed to fetch profile:", data.error);
        alert(data.error || "Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userId = getUserId();
      if (!userId) {
        alert("No user logged in");
        return;
      }

      const res = await fetch(`/api/profile?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchProfile();
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const userId = getUserId();
      if (!userId) {
        alert("No user logged in");
        return;
      }

      const res = await fetch(`/api/profile?userId=${userId}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchProfile();
        alert("Profile picture updated successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload picture");
      }
    } catch (err) {
      console.error("Error uploading picture:", err);
      alert("Error uploading picture");
    }
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
      <div className="min-h-screen flex bg-black text-white">
        <aside className="w-20 bg-zinc-950 flex flex-col justify-between py-6 items-center border-r border-zinc-800">
          <div className="flex flex-col gap-6 items-center">
            <Home className="text-zinc-400 cursor-pointer" />
            <LineChart className="text-zinc-400 cursor-pointer" />
            <MessageSquare className="text-zinc-400 cursor-pointer" />
            <Settings className="text-zinc-400 cursor-pointer" />
          </div>
          <LogOut className="text-zinc-400 mb-2 cursor-pointer" />
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex bg-black text-white">
        <aside className="w-20 bg-zinc-950 flex flex-col justify-between py-6 items-center border-r border-zinc-800">
          <div className="flex flex-col gap-6 items-center">
            <Home className="text-zinc-400 cursor-pointer" />
            <LineChart className="text-zinc-400 cursor-pointer" />
            <MessageSquare className="text-zinc-400 cursor-pointer" />
            <Settings className="text-zinc-400 cursor-pointer" />
          </div>
          <LogOut className="text-zinc-400 mb-2 cursor-pointer" />
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-gray-400 mb-6">We couldn't load your profile information.</p>
            <button
              onClick={fetchProfile}
              className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-20 bg-zinc-950 flex flex-col justify-between py-6 items-center border-r border-zinc-800">
        <div className="flex flex-col gap-6 items-center">
          <Home 
            className="text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => router.push("/dashboard")}
          />
          <LineChart className="text-zinc-400 hover:text-white cursor-pointer" />
          <MessageSquare className="text-zinc-400 hover:text-white cursor-pointer" />
          <Settings className="text-zinc-400 hover:text-white cursor-pointer" />
        </div>
        <LogOut 
          className="text-zinc-400 hover:text-red-400 mb-2 cursor-pointer"
          onClick={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-6">
        {/* Header */}
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
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden border border-zinc-600">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="xl:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl border border-zinc-800"
            >
              <div className="flex flex-col items-center text-center">
                {/* Profile Picture */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center overflow-hidden border-4 border-zinc-800">
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-purple-600 p-3 rounded-full cursor-pointer hover:bg-purple-700 transition shadow-lg">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <h2 className="text-2xl font-bold mb-2">{profile.name || "Unknown User"}</h2>
                <p className="text-gray-400 text-sm mb-4 flex items-center gap-2 justify-center">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
                
                <div className="w-full space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.is_verified 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {profile.is_verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member since</span>
                    <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl border border-zinc-800"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Portfolio Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Value</span>
                  <span className="font-semibold">$84,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Today's Gain</span>
                  <span className="text-green-400 font-semibold">+$1,240</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Return</span>
                  <span className="text-green-400 font-semibold">+12.8%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-2xl border border-zinc-800"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Profile Information</h1>
                  <p className="text-gray-400 mt-2">Manage your personal information and account settings</p>
                </div>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-semibold"
                  disabled={isSaving}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-5 h-5" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-5 h-5" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50 transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Email Address</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg opacity-50">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{profile.email}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50 transition"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium mb-3 text-gray-300">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50 transition resize-none"
                  placeholder="Tell us about yourself, your trading experience, or your financial goals..."
                />
              </div>

              {/* Account Overview */}
              <div className="border-t border-zinc-700 pt-8">
                <h3 className="text-xl font-bold mb-6">Account Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Wallet className="w-5 h-5 text-green-400" />
                      <span className="text-gray-400 text-sm">Portfolio Value</span>
                    </div>
                    <div className="text-2xl font-bold">$84,250</div>
                  </div>
                  
                  <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm">Total Return</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">+12.8%</div>
                  </div>
                  
                  <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-400 text-sm">Total Trades</span>
                    </div>
                    <div className="text-2xl font-bold">156</div>
                  </div>
                  
                  <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-400 text-sm">Success Rate</span>
                    </div>
                    <div className="text-2xl font-bold">87%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}