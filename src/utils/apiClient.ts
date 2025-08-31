const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || '';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
  created_at: string;
  file_type?: string;
  user_id?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: string[];
}

export interface ChatRequest {
  message: string;
  sources: string[];
  history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  sources?: string[];
  error?: string;
}

export interface UploadResponse {
  file_id: string;
  status: 'uploaded' | 'processing' | 'error';
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
    this.apiKey = BACKEND_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authToken?: string
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Backend-Key': this.apiKey,
        ...options.headers,
      };

      // Add Authorization header if auth token is provided
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // File Management
  async getFiles(authToken: string): Promise<ApiResponse<{ files: FileData[] }>> {
    return this.request<{ files: FileData[] }>('/api/files', {}, authToken);
  }

  async uploadFile(file: File, authToken: string): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const url = `${this.baseUrl}/api/upload`;
      const headers: HeadersInit = {
        'X-Backend-Key': this.apiKey,
        'Authorization': `Bearer ${authToken}`,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        error: error instanceof Error ? error.message : 'File upload failed',
      };
    }
  }

  async deleteFile(fileId: string, authToken: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/api/files/${fileId}`, {
      method: 'DELETE',
    }, authToken);
  }

  async getFileStatus(fileId: string, authToken: string): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>(`/api/files/${fileId}/status`, {}, authToken);
  }

  // Chat API
  async sendChatMessage(request: ChatRequest, authToken: string): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    }, authToken);
  }

  async sendChatMessageStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: string) => void,
    authToken: string
  ): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/chat/stream`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Backend-Key': this.apiKey,
        'Authorization': `Bearer ${authToken}`,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body available for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.mode) {
                  // This is the header, skip it
                  continue;
                }
                onChunk(data);
              } catch {
                // If it's not JSON, treat it as a text chunk
                onChunk(line);
              }
            }
          }
        }
        
        // Process any remaining content in the buffer
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            if (!data.mode) {
              onChunk(data);
            }
          } catch {
            onChunk(buffer);
          }
        }
        
        onComplete({ response: 'Stream completed' });
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming chat failed:', error);
      onError(error instanceof Error ? error.message : 'Streaming failed');
    }
  }

  // Processing Status
  async getProcessingStatus(fileId: string): Promise<ApiResponse<{ status: string; progress?: number }>> {
    return this.request<{ status: string; progress?: number }>(`/api/processing/status/${fileId}`);
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { FileData, ChatMessage, ChatRequest, ChatResponse, UploadResponse };
