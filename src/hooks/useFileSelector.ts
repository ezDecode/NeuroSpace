import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { mockFiles, createMockFileFetcher, type FileData } from '@/utils/mockFileData';

const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // If backend is not available, use mock data
      if (response.status >= 500) {
        console.warn('Backend not available, using mock data');
        return createMockFileFetcher(200)(url);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to mock data:', error);
    return createMockFileFetcher(200)(url);
  }
};

export function useFileSelector(initialSelectedFiles: string[] = []) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>(initialSelectedFiles);
  const { data: filesData, error, isLoading, mutate } = useSWR<{files: FileData[]}>('/api/files', fetcher);

  const handleSelectionChange = useCallback((newSelectedFiles: string[]) => {
    setSelectedFiles(newSelectedFiles);
  }, []);

  const refreshFiles = useCallback(() => {
    mutate();
  }, [mutate]);

  const getSelectedFileDetails = useCallback(() => {
    if (!filesData?.files) return [];
    return selectedFiles
      .map(fileId => filesData.files.find(f => f.id === fileId))
      .filter(Boolean) as FileData[];
  }, [selectedFiles, filesData?.files]);

  return {
    files: filesData?.files || [],
    selectedFiles,
    selectedFileDetails: getSelectedFileDetails(),
    onSelectionChange: handleSelectionChange,
    isLoading,
    error,
    refreshFiles,
    totalFiles: filesData?.files?.length || 0,
    hasFiles: (filesData?.files?.length || 0) > 0
  };
}