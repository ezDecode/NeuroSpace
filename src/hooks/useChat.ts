import { useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  references?: { file_name: string; score?: number }[];
}

type AskResponse = { answer: string; references: { file_name: string; score?: number }[] };

export function useChat() {
  const { getAuthHeader } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(content: string) {
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
      const { data } = await apiClient.post<AskResponse>('/api/chat', { content }, headers);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer || 'No answer',
        timestamp: Date.now(),
        references: data.references,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, error, sendMessage };
}
