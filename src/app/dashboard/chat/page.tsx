'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
  ArrowPathIcon,
  PaperClipIcon,
  XMarkIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

type Reference = { file_name: string; score?: number };

function TypingDots() {
  return (
    <div className="flex gap-1 items-center">
      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
    </div>
  );
}

function ReferenceChips({ refs }: { refs: Reference[] }) {
  if (!refs?.length) return null;
  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs text-white/50 font-medium">Sources:</div>
      <div className="flex flex-wrap gap-2">
        {refs.map((r, idx) => (
          <span
            key={`${r.file_name}-${idx}`}
            className="inline-flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 transition-colors duration-200"
          >
            <DocumentTextIcon className="h-3 w-3" />
            <span>{r.file_name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const quickPrompts = [
  {
    title: 'Summarize documents',
    description: 'Get key insights from your uploaded files',
    prompt: 'Summarize the key points from my documents',
    icon: DocumentTextIcon,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Search knowledge base',
    description: 'Find specific information quickly',
    prompt: 'Find information about',
    icon: MagnifyingGlassIcon,
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Explain concepts',
    description: 'Break down complex topics',
    prompt: 'Explain the concepts in',
    icon: LightBulbIcon,
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Compare documents',
    description: 'Analyze differences and similarities',
    prompt: 'Compare information between',
    icon: ArrowPathIcon,
    color: 'from-orange-500 to-red-500'
  }
];

export default function ChatPage() {
  const { messages, loading, error, mode, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    setIsTyping(true);
    await sendMessage(input.trim());
    setInput('');
    setIsTyping(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showWelcome = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto">
      {/* Mode indicator */}
      {mode && (
        <div className="px-4 pt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60">
            <span className={`w-2 h-2 rounded-full ${mode === 'general' ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
            <span>{mode === 'general' ? 'General knowledge mode' : 'Document knowledge mode'}</span>
          </div>
        </div>
      )}
      {/* Welcome screen */}
      {showWelcome && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col items-center justify-center text-center space-y-8 px-4"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              How can I help you today?
            </h1>
            <p className="text-xl text-white/60 max-w-2xl">
              Ask me anything about your documents, or try one of these quick prompts to get started.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={prompt.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                onClick={() => setInput(prompt.prompt)}
                className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${prompt.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <prompt.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{prompt.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{prompt.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat messages */}
      {!showWelcome && (
        <div className="flex-1 overflow-y-auto py-6 space-y-6 px-4">
          <AnimatePresence initial={false}>
            {messages.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-4"
              >
                {m.role === 'user' ? (
                  <div className="flex justify-end">
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="max-w-3xl"
                    >
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl px-6 py-4 shadow-lg">
                        <div className="text-white font-medium">{m.content}</div>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="max-w-4xl"
                    >
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 shadow-lg">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white leading-relaxed prose-invert">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(m.content);
                              setCopiedId(m.id);
                              setTimeout(() => setCopiedId(null), 1500);
                            }}
                            className="ml-2 p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            aria-label="Copy message"
                          >
                            {copiedId === m.id ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="text-xs text-white/40">
                          {new Date(m.timestamp).toLocaleTimeString()}
                        </div>
                        {(m as unknown as { references?: Reference[] }).references && (
                          <ReferenceChips refs={(m as unknown as { references: Reference[] }).references} />
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 max-w-2xl">
                <div className="text-red-400 text-sm font-medium">Error: {error}</div>
                <div className="text-red-400/60 text-xs mt-1">Please try again or contact support if the problem persists.</div>
              </div>
            </motion.div>
          )}
          
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center space-x-1 text-white/60">
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Insert code block"
                  onClick={() => {
                    if (!textareaRef.current) return;
                    const el = textareaRef.current;
                    const start = el.selectionStart || 0;
                    const end = el.selectionEnd || 0;
                    const value = input;
                    const snippet = "\n```\n\n```\n";
                    const newValue = value.slice(0, start) + snippet + value.slice(end);
                    setInput(newValue);
                    requestAnimationFrame(() => {
                      const pos = start + 4; // inside code block
                      el.focus();
                      el.setSelectionRange(pos, pos);
                    });
                  }}
                  disabled={loading}
                >
                  <CodeBracketIcon className="h-4 w-4" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Clear"
                  onClick={() => setInput('')}
                  disabled={loading || input.length === 0}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Regenerate last"
                  onClick={async () => {
                    if (loading) return;
                    const lastUser = [...messages].reverse().find(m => m.role === 'user');
                    if (lastUser) {
                      setIsTyping(true);
                      await sendMessage(lastUser.content);
                      setIsTyping(false);
                    }
                  }}
                  disabled={loading || messages.filter(m => m.role === 'user').length === 0}
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-white/40">
                {input.length} chars
              </div>
            </div>

            {/* Input container */}
            <div className="relative rounded-2xl border border-white/20 bg-white/10">
              {/* Left attach button */}
              <div className="absolute left-2 top-2">
                <Link
                  href="/dashboard/upload"
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Attach files"
                >
                  <PaperClipIcon className="h-4 w-4" />
                </Link>
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Message NeuroSpace..."
                rows={1}
                className="w-full resize-none bg-transparent px-10 pr-16 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent min-h-[56px] max-h-40 overflow-y-auto transition-all duration-300"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim() || isTyping}
                className="absolute right-2 top-2 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                title="Send"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Hints */}
            <div className="flex items-center justify-between mt-2 text-xs text-white/40 px-2">
              <div className="flex items-center space-x-4">
                <span>Enter to send, Shift+Enter for new line</span>
                {loading && <span className="text-blue-400">AI is thinking...</span>}
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-3 w-3" />
                <span>NeuroSpace can make mistakes. Check important information.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
