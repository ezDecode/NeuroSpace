import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  references?: { file_name: string; score?: number }[];
}

interface AskResponse {
  answer: string;
  references: { file_name: string; score?: number }[];
  mode?: 'general' | 'document';
}

export function useChat() {
  const { getAuthHeader, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'general' | 'document' | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const storageKey = user?.id ? `neurospace_chat_${user.id}` : 'neurospace_chat';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { messages: ChatMessage[]; mode: 'general' | 'document' | null };
        setMessages(parsed.messages || []);
        if (parsed.mode) setMode(parsed.mode);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ messages, mode }));
    } catch {}
  }, [messages, mode, storageKey]);

  async function sendMessage(content: string) {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setError(null);
    setLoading(true);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const headers = await getAuthHeader();
      // Kick off streaming request
      const resp = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(headers || {}) },
        body: JSON.stringify({ content }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        const text = await resp.text().catch(() => '');
        throw new Error(text || `Request failed: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantId = crypto.randomUUID();
      let created = false;
      let buffer = '';
      let references: { file_name: string; score?: number }[] | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // The first line is a JSON header with the mode, then raw tokens
        if (!created) {
          const newlineIdx = buffer.indexOf('\n');
          if (newlineIdx === -1) continue;
          const headerLine = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          try {
            const header = JSON.parse(headerLine) as { mode?: 'general' | 'document'; references?: { file_name: string; score?: number }[] };
            if (header.mode === 'general' || header.mode === 'document') setMode(header.mode);
            if (Array.isArray(header.references)) references = header.references;
          } catch {}
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), references },
          ]);
          created = true;
        }

        if (buffer) {
          const chunk = buffer;
          buffer = '';
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)));
        }
      }

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, error, mode, sendMessage };
}
