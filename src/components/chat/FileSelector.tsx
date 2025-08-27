'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  CheckIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';

interface File {
  id: string;
  file_name: string;
  file_size: number;
  content_type: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  chunks_count: number;
  created_at: string;
  processed_at: string | null;
}

interface FileSelectorProps {
  selectedFiles: string[];
  onFilesChange: (files: string[]) => void;
  className?: string;
}

export function FileSelector({ selectedFiles, onFilesChange, className = '' }: FileSelectorProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      const processedFiles = (data.files || []).filter((file: File) => file.status === 'processed');
      setFiles(processedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileToggle = (fileName: string) => {
    if (selectedFiles.includes(fileName)) {
      onFilesChange(selectedFiles.filter(f => f !== fileName));
    } else {
      onFilesChange([...selectedFiles, fileName]);
    }
  };

  const clearSelection = () => {
    onFilesChange([]);
  };

  const selectAll = () => {
    onFilesChange(files.map(f => f.file_name));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || contentType.includes('document')) return '📝';
    if (contentType.includes('text')) return '📋';
    return '📄';
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 border border-gray-600 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-600 rounded flex-1 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-800 rounded-lg p-3 ${className}`}>
        <div className="text-red-200 text-sm">Error loading files: {error}</div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`bg-gray-800 border border-gray-600 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-400">
          <FolderOpenIcon className="h-4 w-4" />
          <span className="text-sm">No processed documents available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border border-gray-600 rounded-lg ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-200">
            Select Documents
          </span>
          {selectedFiles.length > 0 && (
            <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
              {selectedFiles.length} selected
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Selected files preview (when collapsed) */}
      {!isOpen && selectedFiles.length > 0 && (
        <div className="px-3 pb-3 border-t border-gray-600">
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedFiles.slice(0, 3).map(fileName => (
              <span 
                key={fileName} 
                className="bg-blue-900/50 text-blue-200 text-xs px-2 py-1 rounded-full flex items-center space-x-1"
              >
                <span className="truncate max-w-20">{fileName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileToggle(fileName);
                  }}
                  className="hover:bg-blue-800 rounded-full p-0.5"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedFiles.length > 3 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{selectedFiles.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* File list (when expanded) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-600 overflow-hidden"
          >
            {/* Controls */}
            <div className="flex items-center justify-between p-3 bg-gray-700 border-b border-gray-600">
              <div className="text-xs text-gray-300">
                {files.length} documents available
              </div>
              <div className="flex items-center space-x-2">
                {files.length > 0 && selectedFiles.length === 0 && (
                  <button
                    onClick={selectAll}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Select All
                  </button>
                )}
                {selectedFiles.length > 0 && selectedFiles.length < files.length && (
                  <button
                    onClick={selectAll}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Select All
                  </button>
                )}
                {selectedFiles.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Clear ({selectedFiles.length})
                  </button>
                )}
              </div>
            </div>

            {/* File list */}
            <div className="max-h-48 overflow-y-auto">
              {files.map(file => (
                <div
                  key={file.id}
                  className={`flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedFiles.includes(file.file_name) ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleFileToggle(file.file_name)}
                >
                  <div className="flex-shrink-0">
                    {selectedFiles.includes(file.file_name) ? (
                      <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-500 rounded"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getFileIcon(file.content_type)}</span>
                      <span className="text-sm font-medium text-gray-200 truncate">
                        {file.file_name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatFileSize(file.file_size)} • {file.chunks_count} chunks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
