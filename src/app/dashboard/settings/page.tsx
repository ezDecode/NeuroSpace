'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  CogIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  TrashIcon,
  DownloadIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  KeyIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'data', name: 'Data & Privacy', icon: DocumentTextIcon },
  ];

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <CogIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Manage your account preferences, security settings, and data
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-white text-black shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
                    <p className="text-white/60">Update your personal information and profile details</p>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        {user?.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.fullName || 'User'} 
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="h-10 w-10 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{user?.fullName || 'User'}</h3>
                        <p className="text-white/60">{user?.primaryEmailAddress?.emailAddress}</p>
                        <button className="mt-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                          Change Photo
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">First Name</label>
                        <input
                          type="text"
                          defaultValue={user?.firstName || ''}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Last Name</label>
                        <input
                          type="text"
                          defaultValue={user?.lastName || ''}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                          placeholder="Enter last name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Preferences</h2>
                    <p className="text-white/60">Customize your experience and interface settings</p>
                  </div>

                  <div className="space-y-6">
                    {/* Theme */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center space-x-3">
                        {darkMode ? <MoonIcon className="h-5 w-5 text-white" /> : <SunIcon className="h-5 w-5 text-white" />}
                        <div>
                          <h3 className="text-white font-medium">Dark Mode</h3>
                          <p className="text-white/60 text-sm">Use dark theme for better experience</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          darkMode ? 'bg-blue-500' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center space-x-3">
                        <GlobeAltIcon className="h-5 w-5 text-white" />
                        <div>
                          <h3 className="text-white font-medium">Language</h3>
                          <p className="text-white/60 text-sm">Choose your preferred language</p>
                        </div>
                      </div>
                      <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    {/* AI Assistant */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center space-x-3">
                        <SparklesIcon className="h-5 w-5 text-white" />
                        <div>
                          <h3 className="text-white font-medium">AI Assistant</h3>
                          <p className="text-white/60 text-sm">Enable AI-powered suggestions</p>
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Notifications</h2>
                    <p className="text-white/60">Manage how you receive notifications and updates</p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                        <div>
                          <h3 className="text-white font-medium capitalize">{key} Notifications</h3>
                          <p className="text-white/60 text-sm">
                            {key === 'email' && 'Receive notifications via email'}
                            {key === 'push' && 'Get push notifications in your browser'}
                            {key === 'updates' && 'Stay updated with new features'}
                            {key === 'marketing' && 'Receive promotional content'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-500' : 'bg-white/20'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Security</h2>
                    <p className="text-white/60">Manage your account security and authentication</p>
                  </div>

                  <div className="space-y-6">
                    {/* Password */}
                    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <KeyIcon className="h-5 w-5 text-white" />
                          <div>
                            <h3 className="text-white font-medium">Password</h3>
                            <p className="text-white/60 text-sm">Last changed 30 days ago</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                          Change
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 pr-12"
                              placeholder="Enter current password"
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                            >
                              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="Enter new password"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className="h-5 w-5 text-white" />
                        <div>
                          <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                          <p className="text-white/60 text-sm">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Data & Privacy</h2>
                    <p className="text-white/60">Manage your data and privacy settings</p>
                  </div>

                  <div className="space-y-6">
                    {/* Export Data */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center space-x-3">
                        <DownloadIcon className="h-5 w-5 text-white" />
                        <div>
                          <h3 className="text-white font-medium">Export Data</h3>
                          <p className="text-white/60 text-sm">Download all your data and documents</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                        Export
                      </button>
                    </div>

                    {/* Delete Account */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                      <div className="flex items-center space-x-3">
                        <TrashIcon className="h-5 w-5 text-red-400" />
                        <div>
                          <h3 className="text-white font-medium">Delete Account</h3>
                          <p className="text-white/60 text-sm">Permanently delete your account and all data</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
