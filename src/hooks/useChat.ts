import { useState, useCallback, useRef } from 'react';
import { apiClient, ChatMessage, ChatRequest, ChatResponse } from '@/utils/apiClient';
import { useAuth } from './useAuth';

export interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  selectedSources: string[];
}

export interface UseChatReturn extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  sendMessageStream: (message: string) => Promise<void>;
  setSelectedSources: (sources: string[]) => void;
  clearChat: () => void;
  clearError: () => void;
  addMessage: (message: ChatMessage) => void;
}

export function useChat(): UseChatReturn {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isStreaming: false,
    error: null,
    selectedSources: [],
  });

  const { getTokenWithFallback } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state.isStreaming) return;

    const token = await getTokenWithFallback();
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Authentication required. Please sign in.',
      }));
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      error: null,
    }));

    try {
      const request: ChatRequest = {
        message: message.trim(),
        sources: state.selectedSources,
        history: state.messages.slice(-10), // Last 10 messages for context
      };

      const response = await apiClient.sendChatMessage(request, token);

      if (response.error) {
        throw new Error(response.error);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data?.response || 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date(),
        sources: response.data?.sources || [],
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        error: error instanceof Error ? error.message : 'Chat failed',
      }));
    }
  }, [state.messages, state.selectedSources, state.isStreaming, getTokenWithFallback]);

  const sendMessageStream = useCallback(async (message: string) => {
    if (!message.trim() || state.isStreaming) return;

    const token = await getTokenWithFallback();
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Authentication required. Please sign in.',
      }));
      return;
    }

    // Cancel any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isStreaming: true,
      error: null,
    }));

    try {
      const request: ChatRequest = {
        message: message.trim(),
        sources: state.selectedSources,
        history: state.messages.slice(-10),
      };

      await apiClient.sendChatMessageStream(
        request,
        (chunk) => {
          // Handle streaming chunks
          setState(prev => {
            const lastMessage = prev.messages[prev.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              // Update existing assistant message
              const updatedMessages = [...prev.messages];
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunk,
              };
              return { ...prev, messages: updatedMessages };
            } else {
              // Create new assistant message
              const newMessage: ChatMessage = {
                id: Date.now().toString(),
                content: chunk,
                role: 'assistant',
                timestamp: new Date(),
              };
              return { ...prev, messages: [...prev.messages, newMessage] };
            }
          });
        },
        (response) => {
          // Handle completion
          setState(prev => ({
            ...prev,
            isStreaming: false,
          }));
        },
        (error) => {
          // Handle error
          setState(prev => ({
            ...prev,
            isStreaming: false,
            error: error,
          }));
        },
        token
      );

    } catch (error) {
      console.error('Streaming chat error:', error);
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Streaming failed',
      }));
    }
  }, [state.messages, state.selectedSources, state.isStreaming, getTokenWithFallback]);

  const setSelectedSources = useCallback((sources: string[]) => {
    setState(prev => ({ ...prev, selectedSources: sources }));
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({ ...prev, messages: [], error: null }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    sendMessageStream,
    setSelectedSources,
    clearChat,
    clearError,
    addMessage,
  };
}
