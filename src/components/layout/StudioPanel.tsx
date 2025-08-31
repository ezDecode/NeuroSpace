'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Audiotrack as AudiotrackIcon,
  VideoLibrary as VideoLibraryIcon,
  AccountTree as AccountTreeIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  IconButton, 
  Tooltip, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';

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
      icon: <AudiotrackIcon />,
      description: 'Listen to an AI-generated overview',
      enabled: hasContent
    },
    {
      id: 'video',
      title: 'Video Overview', 
      icon: <VideoLibraryIcon />,
      description: 'Watch a video summary',
      enabled: false
    },
    {
      id: 'mindmap',
      title: 'Mind Map',
      icon: <AccountTreeIcon />,
      description: 'Visualize key concepts',
      enabled: hasContent
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: <AssessmentIcon />,
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
          <Typography variant="h6" className="font-medium">
            Studio
          </Typography>
          <div className="flex items-center space-x-1">
            <Tooltip title="Share">
              <IconButton size="small" disabled={!hasContent}>
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <Typography variant="body2" color="textSecondary" className="mt-1">
          Studio output will be saved here. After adding sources, click to add Audio Overview, Study Guide, Mind Map, and more!
        </Typography>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasContent ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-xs">
              <LightbulbIcon className="text-gray-300 mb-4" style={{ fontSize: 64 }} />
              <Typography variant="h6" className="text-gray-600 mb-2">
                Add sources to get started
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Upload documents and start a conversation to unlock studio features.
              </Typography>
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
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      section.enabled 
                        ? 'hover:shadow-md border-blue-200' 
                        : 'opacity-50 cursor-not-allowed'
                    } ${activeSection === section.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => section.enabled && setActiveSection(section.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          section.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <Typography variant="subtitle2" className="font-medium">
                            {section.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {section.description}
                          </Typography>
                        </div>
                        {section.enabled && (
                          <Button size="small" variant="outlined">
                            Generate
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Typography variant="h6">Audio Overview</Typography>
                      <Chip label="Generated" size="small" color="success" />
                    </div>
                    
                    {/* Audio Player */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <IconButton 
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        
                        <div className="flex-1">
                          <LinearProgress 
                            variant="determinate" 
                            value={playbackPosition} 
                            className="h-2 rounded"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>2:15</span>
                            <span>7:30</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <VolumeUpIcon className="text-gray-500" fontSize="small" />
                          <Slider
                            value={volume}
                            onChange={(_, value) => setVolume(value as number)}
                            size="small"
                            style={{ width: 60 }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="small" startIcon={<DownloadIcon />}>
                          Download
                        </Button>
                        <Button size="small" startIcon={<ShareIcon />}>
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Topics Covered */}
                <Card>
                  <CardContent className="p-4">
                    <Typography variant="h6" className="mb-3">Topics Covered</Typography>
                    <List dense>
                      {mockTopics.map((topic, index) => (
                        <ListItem key={index} className="px-0">
                          <ListItemIcon>
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                          </ListItemIcon>
                          <ListItemText primary={topic} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'mindmap' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Typography variant="h6">Mind Map</Typography>
                      <Button size="small" variant="outlined">
                        Generate
                      </Button>
                    </div>
                    
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <AccountTreeIcon className="text-gray-400 mb-2" style={{ fontSize: 48 }} />
                        <Typography variant="body2" color="textSecondary">
                          Mind map will appear here
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'reports' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Typography variant="h6">Insights Report</Typography>
                      <Button size="small" variant="outlined">
                        Generate Full Report
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {mockInsights.map((insight, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <Typography variant="subtitle2" className="font-medium mb-1">
                            {insight.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" className="mb-2">
                            {insight.content}
                          </Typography>
                          <div className="flex items-center space-x-2">
                            <Typography variant="caption" color="textSecondary">
                              Confidence:
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={insight.confidence} 
                              className="flex-1 h-1"
                            />
                            <Typography variant="caption" color="textSecondary">
                              {insight.confidence}%
                            </Typography>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                  <CardContent className="p-4">
                    <Typography variant="h6" className="mb-3">Export Options</Typography>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                        PDF Report
                      </Button>
                      <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                        Word Doc
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <Divider />
            <div className="space-y-2">
              <Typography variant="subtitle2" className="font-medium text-gray-700">
                Quick Actions
              </Typography>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="text" 
                  size="small" 
                  className="justify-start"
                  startIcon={<LightbulbIcon />}
                >
                  Generate study guide
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  className="justify-start"
                  startIcon={<AssessmentIcon />}
                >
                  Create quiz
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  className="justify-start"
                  startIcon={<ShareIcon />}
                >
                  Share findings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
