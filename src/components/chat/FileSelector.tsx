'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpenIcon,
  DocumentTextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// File data interface based on the existing API structure
interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
  created_at: string;
  file_type?: string;
  file_key?: string;
}

interface FileSelectorProps {
  files: FileData[];
  selectedFiles: string[];
  onSelectionChange: (selectedFiles: string[]) => void;
  isLoading?: boolean;
  className?: string;
}

export default function FileSelector({ 
  files, 
  selectedFiles, 
  onSelectionChange, 
  isLoading = false,
  className = ''
}: FileSelectorProps) {
  // Component state management
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Memoized computations for performance
  const visibleFiles = useMemo(() => {
    if (!Array.isArray(files)) return [];
    return files.slice(0, displayCount);
  }, [files, displayCount]);

  const hasMoreFiles = useMemo(() => {
    return files.length > displayCount;
  }, [files.length, displayCount]);

  // Event handlers with proper TypeScript typing
  const handleFileToggle = useCallback((fileId: string) => {
    if (!fileId) return;
    
    try {
      const newSelected = selectedFiles.includes(fileId)
        ? selectedFiles.filter(id => id !== fileId)
        : [...selectedFiles, fileId];
      onSelectionChange(newSelected);
    } catch (error) {
      console.warn('Error toggling file selection:', error);
    }
  }, [selectedFiles, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    try {
      if (selectedFiles.length === files.length) {
        onSelectionChange([]);
      } else {
        const allFileIds = files
          .filter(file => file && file.id)
          .map(file => file.id);
        onSelectionChange(allFileIds);
      }
    } catch (error) {
      console.warn('Error selecting all files:', error);
    }
  }, [files, selectedFiles.length, onSelectionChange]);

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + 10, files.length));
  }, [files.length]);

  const handleRemoveFile = useCallback((fileId: string) => {
    if (!fileId) return;
    
    try {
      const newSelected = selectedFiles.filter(id => id !== fileId);
      onSelectionChange(newSelected);
    } catch (error) {
      console.warn('Error removing file from selection:', error);
    }
  }, [selectedFiles, onSelectionChange]);

  // Get file icon based on file type
  const getFileIcon = useCallback((fileName: string) => {
    if (!fileName) return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <DocumentTextIcon className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentTextIcon className="w-4 h-4 text-blue-500" />;
      case 'txt':
      case 'md':
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  // Format file size
  const formatFileSize = useCallback((size: number) => {
    if (!size || size === 0) return '0 MB';
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // Error boundary for individual file items
  const renderFileItem = useCallback((file: FileData) => {
    if (!file || !file.id || !file.file_name) return null;

    const isSelected = selectedFiles.includes(file.id);

    return (
      <motion.div
        key={file.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
        role="listitem"
        aria-label={`File ${file.file_name}`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleFileToggle(file.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
          aria-label={`Select ${file.file_name}`}
          data-testid={`file-checkbox-${file.id}`}
        />
        
        <div className="flex-shrink-0">
          {getFileIcon(file.file_name)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 truncate">
              {file.file_name}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              file.status === 'processed' ? 'bg-green-100 text-green-800' :
              file.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              file.status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {file.status}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    );
  }, [selectedFiles, handleFileToggle, getFileIcon, formatFileSize]);

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="File selector">
      {/* File Preview Chips - Selected Files Display */}
      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <div className="text-sm font-medium text-gray-700">
            Selected Files ({selectedFiles.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((fileId) => {
              const file = files.find(f => f?.id === fileId);
              if (!file) return null;
              
              return (
                <motion.div
                  key={fileId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span className="truncate max-w-[120px]">{file.file_name}</span>
                  <button
                    onClick={() => handleRemoveFile(fileId)}
                    className="flex-shrink-0 hover:bg-blue-200 rounded-full p-1 transition-colors"
                    aria-label={`Remove ${file.file_name}`}
                    data-testid={`remove-file-${fileId}`}
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {files.length} file{files.length !== 1 ? 's' : ''} available
        </div>
        
        {selectedFiles.length > 0 && selectedFiles.length < files.length && (
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            aria-label="Select all files"
            data-testid="select-all-button"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Select All</span>
          </button>
        )}
        
        {selectedFiles.length === files.length && files.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700 transition-colors"
            aria-label="Deselect all files"
            data-testid="deselect-all-button"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Deselect All</span>
          </button>
        )}
      </div>

      {/* File List */}
      <div className="space-y-2" role="list" aria-label="Available files">
        <AnimatePresence>
          {visibleFiles.map(renderFileItem)}
        </AnimatePresence>
        
        {/* Empty State */}
        {files.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <FolderOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <div className="text-sm text-gray-500">No files available</div>
            <div className="text-xs text-gray-400 mt-1">Upload some files to get started</div>
          </motion.div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <div className="text-sm text-gray-500">Loading files...</div>
          </motion.div>
        )}
      </div>

      {/* Load More Functionality */}
      {hasMoreFiles && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="flex items-center space-x-2 mx-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Load more files (showing ${displayCount} of ${files.length})`}
            data-testid="load-more-button"
          >
            <span>Load More Files</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          <div className="text-xs text-gray-400 mt-1">
            Showing {Math.min(displayCount, files.length)} of {files.length} files
          </div>
        </motion.div>
      )}
    </div>
  );
}