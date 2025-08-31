'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send as SendIcon,
  Stop as StopIcon,
  AttachFile as AttachFileIcon,
  Tune as TuneIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  ContentCopy as ContentCopyIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { 
  TextField, 
  IconButton, 
  Button, 
  Tooltip, 
  Paper,
  Typography,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: string[];
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  selectedSources: string[];
  chatHistory: Message[];
  onChatUpdate: (messages: Message[]) => void;
}

export default function ChatInterface({ selectedSources, chatHistory, onChatUpdate }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    const newHistory = [...chatHistory, userMessage];
    onChatUpdate(newHistory);
    setMessage('');
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          sources: selectedSources,
          history: chatHistory.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date(),
        sources: data.sources || [],
      };

      onChatUpdate([...newHistory, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      onChatUpdate([...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, message: Message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <SmartToyIcon className="text-blue-600" />
              <Typography variant="h6" className="font-medium">
                Chat
              </Typography>
            </div>
            {selectedSources.length > 0 && (
              <Chip
                label={`${selectedSources.length} source${selectedSources.length !== 1 ? 's' : ''}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Tooltip title="Settings">
              <IconButton size="small">
                <TuneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <SmartToyIcon className="text-gray-300 mb-4" style={{ fontSize: 64 }} />
              <Typography variant="h6" className="text-gray-600 mb-2">
                {selectedSources.length > 0 
                  ? "Ready to chat about your sources" 
                  : "Add sources to get started"
                }
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedSources.length > 0
                  ? "Ask me anything about your uploaded documents."
                  : "Upload some documents first, then ask me questions about them."
                }
              </Typography>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {chatHistory.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} space-x-3`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="bg-blue-100 text-blue-600 w-8 h-8">
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                )}
                
                <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <Paper
                    elevation={1}
                    className={`p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Typography variant="caption" className="text-gray-600 block mb-2">
                          Sources:
                        </Typography>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((source, idx) => (
                            <Chip
                              key={idx}
                              label={source}
                              size="small"
                              variant="outlined"
                              className="text-xs"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Paper>
                  
                  <div className={`flex items-center mt-2 space-x-2 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <Typography variant="caption" color="textSecondary">
                      {formatTime(msg.timestamp)}
                    </Typography>
                    
                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-1">
                        <Tooltip title="Copy">
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopyMessage(msg.content)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Good response">
                          <IconButton size="small">
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Poor response">
                          <IconButton size="small">
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, msg)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </div>
                    )}
                  </div>
                </div>
                
                {msg.role === 'user' && (
                  <Avatar className="bg-gray-300 text-gray-700 w-8 h-8">
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start space-x-3"
          >
            <Avatar className="bg-blue-100 text-blue-600 w-8 h-8">
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <Paper elevation={1} className="p-4 bg-gray-50">
              <div className="flex items-center space-x-2">
                <CircularProgress size={16} />
                <Typography variant="body2" color="textSecondary">
                  Thinking...
                </Typography>
              </div>
            </Paper>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <TextField
              ref={textFieldRef}
              fullWidth
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedSources.length > 0 
                ? "Ask anything about your sources..." 
                : "Upload sources first to start chatting..."
              }
              disabled={isLoading || selectedSources.length === 0}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <div className="flex items-center space-x-1">
                    <Tooltip title="Attach file">
                      <span>
                        <IconButton size="small" disabled>
                          <AttachFileIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </div>
                ),
              }}
            />
          </div>
          
          <Tooltip title={isLoading ? "Stop" : "Send"}>
            <span>
              <IconButton
                onClick={isLoading ? () => setIsLoading(false) : handleSendMessage}
                disabled={!message.trim() && !isLoading}
                color="primary"
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isLoading ? (
                  <StopIcon />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </div>
        
        <Typography variant="caption" color="textSecondary" className="block mt-2 text-center">
          NeuroSpace can make mistakes. Check important information.
        </Typography>
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedMessage && handleCopyMessage(selectedMessage.content)}>
          <ContentCopyIcon className="mr-2" fontSize="small" />
          Copy
        </MenuItem>
      </Menu>
    </div>
  );
}
