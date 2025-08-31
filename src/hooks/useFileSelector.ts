import { useState, useCallback } from 'react';
import useSWR from 'swr';

interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
  created_at: string;
  file_type?: string;
  file_key?: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
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