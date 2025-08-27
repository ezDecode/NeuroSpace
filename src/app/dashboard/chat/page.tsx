'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  ArrowPathIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Reference = { file_name: string; score?: number };

// Simple typing indicator like ChatGPT
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 text-gray-500">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { messages, loading, error, sendMessage } = useChat();
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
  }

  const showWelcome = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Simple like ChatGPT */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900 text-center">NeuroSpace</h1>
        </div>
      </div>

      {/* Welcome screen */}
      {showWelcome && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900">
              How can I help you today?
            </h2>
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
                      <div className="bg-gray-900 text-white rounded-3xl px-4 py-2 max-w-[80%]">
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <SparklesIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="prose prose-sm max-w-none text-gray-900">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: ({ node, inline, className, children, ...props }) => {
                                if (inline) {
                                  return (
                                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                                return (
                                  <pre className="bg-gray-100 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                                    <code className="text-sm text-gray-800" {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              },
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
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
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy"
                          >
                            {copiedId === m.id ? (
                              <CheckIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <ClipboardIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {/* References - if any */}
                        {(m as any).references && (m as any).references.length > 0 && (
                          <div className="mt-3 text-xs text-gray-500">
                            <div className="flex flex-wrap gap-2">
                              {(m as any).references.map((ref: Reference, idx: number) => (
                                <span
                                  key={`${ref.file_name}-${idx}`}
                                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                >
                                  📄 {ref.file_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 pt-2">
                  <TypingIndicator />
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Input area - ChatGPT style */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message NeuroSpace..."
              rows={1}
              className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-[52px] max-h-[200px] overflow-y-auto"
              disabled={loading}
            />
            <div className="absolute right-2 top-2 flex items-center space-x-1">
              {loading ? (
                <button
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Stop generating"
                >
                  <StopIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            NeuroSpace can make mistakes. Check important information.
          </div>
        </div>
      </div>
    </div>
  );
}
