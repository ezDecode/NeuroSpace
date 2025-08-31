'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Menu as MenuIcon, 
  Settings as SettingsIcon, 
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

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
        <Tooltip title="Notifications">
          <IconButton size="small" className="text-gray-600 hover:text-gray-900">
            <NotificationsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Share">
          <IconButton size="small" className="text-gray-600 hover:text-gray-900">
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton size="small" className="text-gray-600 hover:text-gray-900">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="More options">
          <IconButton size="small" className="text-gray-600 hover:text-gray-900">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </motion.header>
  );
}
