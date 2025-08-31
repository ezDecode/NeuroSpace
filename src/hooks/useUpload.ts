import { useState, useCallback } from 'react';
import { apiClient, FileData, UploadResponse } from '@/utils/apiClient';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: FileData[];
}

export interface UseUploadReturn extends UploadState {
  uploadFile: (file: File) => Promise<void>;
  uploadMultipleFiles: (files: File[]) => Promise<void>;
  clearError: () => void;
  removeFile: (fileId: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
}

export function useUpload(): UseUploadReturn {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFiles: [],
  });

  const uploadFile = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 20, 90),
        }));
      }, 200);

      const response = await apiClient.uploadFile(file);
      
      clearInterval(progressInterval);

      if (response.error) {
        throw new Error(response.error);
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        error: null,
      }));

      // Refresh the files list
      await refreshFiles();

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
  }, []);

  const uploadMultipleFiles = useCallback(async (files: File[]) => {
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
  }, [uploadFile]);

  const removeFile = useCallback(async (fileId: string) => {
    try {
      const response = await apiClient.deleteFile(fileId);
      
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
  }, []);

  const refreshFiles = useCallback(async () => {
    try {
      const response = await apiClient.getFiles();
      
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
  }, []);

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
