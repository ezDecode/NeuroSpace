import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from './useAuth';

export interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
  created_at: string;
  file_type?: string;
  user_id?: string;
}

interface UploadState {
  uploadedFiles: FileData[];
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    uploadedFiles: [],
    isUploading: false,
    progress: 0,
    error: null,
  });

  const { getTokenWithFallback } = useAuth();

  // Load existing files on mount
  useEffect(() => {
    refreshFiles();
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    const token = await getTokenWithFallback();
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Authentication required. Please sign in.',
      }));
      return;
    }

    try {
      const response = await apiClient.uploadFile(file, token);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Add to local state
      const newFile: FileData = {
        id: response.data!.file_id,
        file_name: file.name,
        file_size: file.size,
        status: response.data!.status,
        created_at: new Date().toISOString(),
        file_type: file.type,
      };

      setState(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, newFile],
        error: null,
      }));

      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
      throw error;
    }
  }, [getTokenWithFallback]);

  const uploadMultipleFiles = useCallback(async (files: File[]) => {
    const token = await getTokenWithFallback();
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Authentication required. Please sign in.',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      const totalFiles = files.length;
      let completedFiles = 0;

      for (const file of files) {
        await uploadFile(file);
        completedFiles++;
        
        // Update progress based on completed files
        setState(prev => ({
          ...prev,
          progress: (completedFiles / totalFiles) * 100,
        }));
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
      }));

      // Reset progress after a delay
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: 0 }));
      }, 1000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  }, [uploadFile, getTokenWithFallback]);

  const removeFile = useCallback(async (fileId: string) => {
    const token = await getTokenWithFallback();
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Authentication required. Please sign in.',
      }));
      return;
    }

    try {
      const response = await apiClient.deleteFile(fileId, token);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Remove from local state
      setState(prev => ({
        ...prev,
        uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId),
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      }));
    }
  }, [getTokenWithFallback]);

  const refreshFiles = useCallback(async () => {
    const token = await getTokenWithFallback();
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Authentication required. Please sign in.',
      }));
      return;
    }

    try {
      const response = await apiClient.getFiles(token);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setState(prev => ({
        ...prev,
        uploadedFiles: response.data?.files || [],
        error: null,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch files',
      }));
    }
  }, [getTokenWithFallback]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    uploadFile,
    uploadMultipleFiles,
    removeFile,
    refreshFiles,
    clearError,
  };
}
