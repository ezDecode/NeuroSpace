'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bars3Icon, 
  Cog6ToothIcon, 
  ShareIcon,
  EllipsisVerticalIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export default function NotebookHeader() {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10"
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            NeuroSpace
          </h1>
        </div>
      </div>

      {/* Center Section - Notebook Title */}
      <div className="flex-1 flex justify-center">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Untitled notebook"
            className="text-lg font-medium text-gray-900 bg-transparent border-none outline-none text-center placeholder-gray-400 w-full"
            defaultValue="Untitled notebook"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        <button 
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <BellIcon className="w-5 h-5" />
        </button>
        
        <button 
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Share"
        >
          <ShareIcon className="w-5 h-5" />
        </button>

        <button 
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>

        <button 
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="More options"
        >
          <EllipsisVerticalIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
}
