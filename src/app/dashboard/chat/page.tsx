'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

type Reference = { file_name: string; score?: number };

function TypingDots() {
  return (
    <div className="flex gap-1 items-center">
      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></span>
      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
    </div>
  );
}

function ReferenceChips({ refs }: { refs: Reference[] }) {
  if (!refs?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {refs.map((r, idx) => (
        <span
          key={`${r.file_name}-${idx}`}
          className="text-xs px-2 py-1 rounded-md bg-white/10 text-white/70 border border-white/20"
        >
          📄 {r.file_name}
        </span>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { messages, loading, error, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim()) return;
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
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Welcome screen */}
      {showWelcome && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-normal text-white">
            How can I help you today?
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
            <button
              onClick={() => setInput("Summarize the key points from my documents")}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
            >
              <div className="text-white font-medium mb-1">Summarize documents</div>
              <div className="text-white/60 text-sm">Get key insights from your uploaded files</div>
            </button>
            <button
              onClick={() => setInput("Find information about")}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
            >
              <div className="text-white font-medium mb-1">Search knowledge base</div>
              <div className="text-white/60 text-sm">Find specific information quickly</div>
            </button>
            <button
              onClick={() => setInput("Explain the concepts in")}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
            >
              <div className="text-white font-medium mb-1">Explain concepts</div>
              <div className="text-white/60 text-sm">Break down complex topics</div>
            </button>
            <button
              onClick={() => setInput("Compare information between")}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
            >
              <div className="text-white font-medium mb-1">Compare documents</div>
              <div className="text-white/60 text-sm">Analyze differences and similarities</div>
            </button>
          </div>
        </div>
      )}

      {/* Chat messages */}
      {!showWelcome && (
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {m.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-3xl bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                      <div className="text-white">{m.content}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="max-w-3xl">
                      <div className="text-white leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </div>
                      {(m as unknown as { references?: Reference[] }).references && (
                        <ReferenceChips refs={(m as unknown as { references: Reference[] }).references} />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3">
                <TypingDots />
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 rounded-lg p-3 border border-red-400/20">
              {error}
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input area */}
      <div className="py-4">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="w-full resize-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent min-h-[48px] max-h-32 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center text-white/40 text-xs mt-2">
          NeuroSpace can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
}
