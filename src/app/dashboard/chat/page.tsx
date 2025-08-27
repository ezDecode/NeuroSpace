'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import type { ChatMessage } from '@/hooks/useChat';
import { FileSelector } from '@/components/chat/FileSelector';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Reference = { file_name: string; score?: number };

// Simple typing indicator like ChatGPT
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 text-gray-400">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { messages, loading, error, selectedFiles, setSelectedFiles, sendMessage, stopGeneration } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    await sendMessage(input.trim());
    setInput('');
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Escape to clear file selection or stop generation
    if (e.key === 'Escape') {
      if (loading) {
        handleStop();
      } else if (selectedFiles.length > 0) {
        setSelectedFiles([]);
      }
    }
  }

  function handleStop() {
    stopGeneration();
  }

  const showWelcome = messages.length === 0 && !loading;

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-900 text-white -m-4 sm:-m-6 lg:-m-8">
      {/* Header - Simple like ChatGPT */}
      <div className="flex-shrink-0 border-b border-gray-700 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white">NeuroSpace</h1>
            {selectedFiles.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Chatting with:</span>
                <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
                  {selectedFiles.length} document{selectedFiles.length === 1 ? '' : 's'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Welcome screen */}
      {showWelcome && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
              <SparklesIcon className="h-6 w-6 text-gray-900" />
            </div>
            <h2 className="text-3xl font-semibold text-white">
              How can I help you today?
            </h2>
            <p className="text-gray-400">
              Select specific documents below to chat with your knowledge base, or ask general questions.
            </p>
          </div>
        </div>
      )}

      {/* Chat messages */}
      {!showWelcome && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  {m.role === 'user' ? (
                    <div className="flex justify-end mb-4">
                      <div className="bg-white text-gray-900 rounded-3xl px-4 py-2 max-w-[80%]">
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <SparklesIcon className="h-4 w-4 text-gray-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="prose prose-sm max-w-none text-white">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: ({ className, children, ...props }) => {
                                const isInline = !className;
                                if (isInline) {
                                  return (
                                    <code className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                                return (
                                  <pre className="bg-gray-800 border border-gray-600 rounded-lg p-4 overflow-x-auto">
                                    <code className="text-sm text-gray-200" {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              },
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(m.content);
                              setCopiedId(m.id);
                              setTimeout(() => setCopiedId(null), 1500);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
                            title="Copy"
                          >
                            {copiedId === m.id ? (
                              <CheckIcon className="h-4 w-4 text-green-400" />
                            ) : (
                              <ClipboardIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {/* References - if any */}
                        {(() => {
                          const refs = (m as ChatMessage).references;
                          if (!refs || refs.length === 0) return null;
                          return (
                          <div className="mt-3 text-xs text-gray-400">
                            <div className="mb-1 font-medium">Sources:</div>
                            <div className="flex flex-wrap gap-2">
                              {refs.map((ref: Reference, idx: number) => (
                                <span
                                  key={`${ref.file_name}-${idx}`}
                                  className={`px-2 py-1 rounded-full flex items-center space-x-1 ${
                                    selectedFiles.includes(ref.file_name) 
                                      ? 'bg-blue-900 text-blue-200 border border-blue-700' 
                                      : 'bg-gray-800 text-gray-300'
                                  }`}
                                >
                                  <span>📄</span>
                                  <span className="truncate max-w-32">{ref.file_name}</span>
                                  {ref.score && (
                                    <span className="text-xs opacity-60">
                                      ({Math.round(ref.score * 100)}%)
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <SparklesIcon className="h-4 w-4 text-gray-900" />
                </div>
                <div className="flex-1 pt-2">
                  <TypingIndicator />
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                <div className="text-red-200 text-sm">
                  <strong>Error:</strong> {error}
                  {error.includes('Connection lost') && (
                    <button
                      onClick={() => {
                        if (messages.length > 0) {
                          const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
                          if (lastUserMessage) {
                            sendMessage(lastUserMessage.content);
                          }
                        }
                      }}
                      className="ml-2 text-blue-400 hover:text-blue-300 underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Input area - ChatGPT style */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* File Selector */}
          <div className="mb-4">
            <FileSelector 
              selectedFiles={selectedFiles}
              onFilesChange={setSelectedFiles}
            />
          </div>
          
          {/* Message Input */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={selectedFiles.length > 0 
                ? `Ask about ${selectedFiles.length} selected document${selectedFiles.length === 1 ? '' : 's'}...` 
                : "Message NeuroSpace..."
              }
              rows={1}
              className="w-full resize-none border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white bg-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent min-h-[52px] max-h-[200px] overflow-y-auto"
              disabled={loading}
            />
            <div className="absolute right-2 top-2 flex items-center space-x-1">
              {loading ? (
                <button
                  onClick={handleStop}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                  title="Stop generating"
                >
                  <StopIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-lg bg-white text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">
            {selectedFiles.length > 0 
              ? `Chatting with ${selectedFiles.length} selected document${selectedFiles.length === 1 ? '' : 's'}`
              : "NeuroSpace can make mistakes. Check important information."
            }
          </div>
        </div>
      </div>
    </div>
  );
}
