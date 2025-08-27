import { useState } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '@/utils/apiClient';

export type UploadStatus = 'idle' | 'signing' | 'uploading' | 'processing' | 'done' | 'error';

type SignResponse = { url: string; fileKey: string; fileName: string };

type ProcessResponse = { success: boolean };

export function useUpload() {
  const { getAuthHeader } = useAuth();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    try {
      setError(null);
      setStatus('signing');
      const headers = { 'Content-Type': 'application/json', ...(await getAuthHeader()) };
      const { data: signData } = await apiClient.post<SignResponse>(
        '/api/upload',
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
        headers,
      );

      setStatus('uploading');
      await fetch(signData.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setStatus('processing');
      await apiClient.post<ProcessResponse>(
        '/api/process',
        { 
          fileKey: signData.fileKey, 
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        },
        headers,
      );

      setStatus('done');
      return { fileKey: signData.fileKey };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setStatus('error');
      setError(msg);
      throw e;
    }
  }

  return { status, error, uploadFile };
}
