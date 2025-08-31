'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MusicalNoteIcon,
  VideoCameraIcon,
  MapIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

interface StudioPanelProps {
  chatHistory: any[];
  selectedSources: string[];
}

export default function StudioPanel({ chatHistory, selectedSources }: StudioPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('audio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(30);
  const [volume, setVolume] = useState(70);

  const hasContent = chatHistory.length > 0 && selectedSources.length > 0;

  const studioSections = [
    {
      id: 'audio',
      title: 'Audio Overview',
      icon: <MusicalNoteIcon className="w-6 h-6" />,
      description: 'Listen to an AI-generated overview',
      enabled: hasContent
    },
    {
      id: 'video',
      title: 'Video Overview', 
      icon: <VideoCameraIcon className="w-6 h-6" />,
      description: 'Watch a video summary',
      enabled: false
    },
    {
      id: 'mindmap',
      title: 'Mind Map',
      icon: <MapIcon className="w-6 h-6" />,
      description: 'Visualize key concepts',
      enabled: hasContent
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: <ChartBarIcon className="w-6 h-6" />,
      description: 'Generate detailed insights',
      enabled: hasContent
    }
  ];

  const mockTopics = [
    'Key concepts overview',
    'Main arguments',
    'Supporting evidence',
    'Conclusions and insights',
    'Areas for further research'
  ];

  const mockInsights = [
    {
      title: 'Document Summary',
      content: 'Based on your sources, the main themes revolve around...',
      confidence: 95
    },
    {
      title: 'Key Statistics',
      content: '3 primary data points identified across documents',
      confidence: 87
    },
    {
      title: 'Research Gaps',
      content: 'Areas that could benefit from additional sources',
      confidence: 78
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Studio
          </h2>
          <div className="flex items-center space-x-1">
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasContent}
              title="Share"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Studio output will be saved here. After adding sources, click to add Audio Overview, Study Guide, Mind Map, and more!
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasContent ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-xs">
              <LightBulbIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Add sources to get started
              </h3>
              <p className="text-sm text-gray-500">
                Upload documents and start a conversation to unlock studio features.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Studio Features */}
            <div className="grid grid-cols-1 gap-3">
              {studioSections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={`cursor-pointer transition-all duration-200 rounded-lg border ${
                      section.enabled 
                        ? 'hover:shadow-md border-blue-200 bg-white' 
                        : 'opacity-50 cursor-not-allowed bg-gray-100'
                    } ${activeSection === section.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => section.enabled && setActiveSection(section.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          section.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {section.title}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {section.description}
                          </p>
                        </div>
                        {section.enabled && (
                          <button className="px-3 py-1 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                            Generate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Active Section Content */}
            {activeSection === 'audio' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Audio Overview</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Generated
                    </span>
                  </div>
                  
                  {/* Audio Player */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 bg-blue-600 text-white hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${playbackPosition}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>2:15</span>
                          <span>7:30</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <SpeakerWaveIcon className="w-5 h-5 text-gray-500" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                        <ShareIcon className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Topics Covered */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Topics Covered</h3>
                  <div className="space-y-2">
                    {mockTopics.map((topic, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-700">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'mindmap' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Mind Map</h3>
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                      Generate
                    </button>
                  </div>
                  
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Mind map will appear here
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'reports' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Insights Report</h3>
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                      Generate Full Report
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {mockInsights.map((insight, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {insight.content}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            Confidence:
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${insight.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {insight.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Export Options</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>PDF Report</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Word Doc</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button 
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                  >
                    <LightBulbIcon className="w-4 h-4" />
                    <span>Generate study guide</span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                  >
                    <ChartBarIcon className="w-4 h-4" />
                    <span>Create quiz</span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Share findings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
