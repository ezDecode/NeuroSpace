'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SourcesPanel from './SourcesPanel';
import ChatInterface from './ChatInterface';
import StudioPanel from './StudioPanel';
import NotebookHeader from './NotebookHeader';

interface NotebookLayoutProps {
  children?: React.ReactNode;
}

export default function NotebookLayout({ children }: NotebookLayoutProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState<'chat' | 'studio'>('chat');

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <NotebookHeader />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sources Panel */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col"
        >
          <SourcesPanel 
            selectedSources={selectedSources}
            onSourceSelect={setSelectedSources}
          />
        </motion.div>

        {/* Center Panel - Chat */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 flex flex-col bg-white"
        >
          <ChatInterface 
            selectedSources={selectedSources}
            chatHistory={chatHistory}
            onChatUpdate={setChatHistory}
          />
        </motion.div>

        {/* Studio Panel */}
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
          className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col"
        >
          <StudioPanel 
            chatHistory={chatHistory}
            selectedSources={selectedSources}
          />
        </motion.div>
      </div>
      
      {children}
    </div>
  );
}
