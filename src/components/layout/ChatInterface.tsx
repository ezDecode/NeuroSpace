'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  StopIcon,
  PaperClipIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClipboardDocumentIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { useChat } from '@/hooks/useChat';

interface ChatInterfaceProps {
  selectedSources: string[];
  chatHistory: any[];
  onChatUpdate: (messages: any[]) => void;
}

export default function ChatInterface({ selectedSources, chatHistory, onChatUpdate }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: any | null }>({ x: 0, y: 0, message: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    sendMessageStream,
    setSelectedSources,
    clearError,
  } = useChat();

  // Sync selected sources with the chat hook
  useEffect(() => {
    setSelectedSources(selectedSources);
  }, [selectedSources, setSelectedSources]);

  // Sync messages with parent component
  useEffect(() => {
    onChatUpdate(messages);
  }, [messages, onChatUpdate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isStreaming) return;

    try {
      await sendMessageStream(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
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
    setContextMenu({ x: 0, y: 0, message: null });
  };

  const handleContextMenu = (event: React.MouseEvent, message: any) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, message });
  };

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, message: null });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Chat
              </h2>
            </div>
            {selectedSources.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {selectedSources.length > 0 
                  ? "Ready to chat about your sources" 
                  : "Add sources to get started"
                }
              </h3>
              <p className="text-sm text-gray-500">
                {selectedSources.length > 0
                  ? "Ask me anything about your uploaded documents."
                  : "Upload some documents first, then ask me questions about them."
                }
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} space-x-3`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`p-4 rounded-lg shadow-sm ${
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
                        <p className="text-xs text-gray-600 mb-2">
                          Sources:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((source: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-2 space-x-2 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.timestamp)}
                    </span>
                    
                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-1">
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          onClick={() => handleCopyMessage(msg.content)}
                          title="Copy"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                        
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors" title="Good response">
                          <HandThumbUpIcon className="w-4 h-4" />
                        </button>
                        
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors" title="Poor response">
                          <HandThumbDownIcon className="w-4 h-4" />
                        </button>
                        
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          onClick={(e) => handleContextMenu(e, msg)}
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start space-x-3"
          >
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">
                  Thinking...
                </span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={textFieldRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedSources.length > 0 
                ? "Ask anything about your sources..." 
                : "Upload sources first to start chatting..."
              }
              disabled={isStreaming || selectedSources.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={isStreaming ? () => {} : handleSendMessage}
            disabled={!message.trim() && !isStreaming}
            className={`p-3 rounded-lg transition-colors ${
              isStreaming
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
            title={isStreaming ? "Stop" : "Send"}
          >
            {isStreaming ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          NeuroSpace can make mistakes. Check important information.
        </p>
      </div>

      {/* Context Menu */}
      {contextMenu.message && (
        <div 
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleCopyMessage(contextMenu.message!.content)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            <span>Copy</span>
          </button>
        </div>
      )}

      {/* Overlay to close context menu */}
      {contextMenu.message && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
        />
      )}
    </div>
  );
}

