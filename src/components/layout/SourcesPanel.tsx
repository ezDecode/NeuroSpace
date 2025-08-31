'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  DocumentIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  FolderIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '@/hooks/useUpload';
import { FileData } from '@/utils/apiClient';

interface SourcesPanelProps {
  selectedSources: string[];
  onSourceSelect: (sources: string[]) => void;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return <DocumentIcon className="w-5 h-5 text-red-500" />;
    case 'doc':
    case 'docx':
      return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
    case 'txt':
    case 'md':
      return <DocumentDuplicateIcon className="w-5 h-5 text-gray-500" />;
    default:
      return <DocumentDuplicateIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'processed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function SourcesPanel({ selectedSources, onSourceSelect }: SourcesPanelProps) {
  const [uploadDialog, setUploadDialog] = useState(false);
  const [linkDialog, setLinkDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileData | null }>({ x: 0, y: 0, file: null });

  const { 
    uploadedFiles, 
    isUploading, 
    progress, 
    error, 
    uploadFile, 
    removeFile, 
    refreshFiles, 
    clearError 
  } = useUpload();

  // Load files on component mount
  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
    setUploadDialog(false);
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    multiple: true
  });

  const filteredFiles = uploadedFiles.filter(file =>
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSourceToggle = (fileId: string) => {
    const newSelected = selectedSources.includes(fileId)
      ? selectedSources.filter(id => id !== fileId)
      : [...selectedSources, fileId];
    onSourceSelect(newSelected);
  };

  const handleContextMenu = (event: React.MouseEvent, file: FileData) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, file });
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await removeFile(fileId);
      onSourceSelect(selectedSources.filter(id => id !== fileId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setContextMenu({ x: 0, y: 0, file: null });
  };

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, file: null });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sources</h2>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Sources let NeuroSpace base its responses on the information that matters most to you.
        </p>

        {/* Add Button */}
        <button
          onClick={() => setUploadDialog(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 border-b border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700">Uploading...</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <FolderIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Saved sources will appear here
            </p>
            <p className="text-xs text-gray-500">
              Click Add above to add PDFs, websites, text, videos, or audio files.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSourceToggle(file.id)}
                onContextMenu={(e) => handleContextMenu(e, file)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(file.id)}
                    onChange={() => handleSourceToggle(file.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  {getFileIcon(file.file_name)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file_name}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {(file.file_size / (1024 * 1024)).toFixed(1)} MB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, file);
                    }}
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source Count */}
      {selectedSources.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <p className="text-xs text-blue-700 font-medium">
            {selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {/* Upload Dialog */}
      {uploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add sources</h3>
            
            <div className="space-y-4">
              {/* Upload Section */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">
                  Upload sources
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Drag & drop or choose file to upload
                </p>
                <p className="text-xs text-gray-500">
                  Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLinkDialog(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>Link</span>
                </button>
                <button
                  disabled
                  className="flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-gray-300 text-gray-400 bg-gray-100 rounded-md cursor-not-allowed"
                >
                  <FolderIcon className="w-5 h-5" />
                  <span>Google Drive</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setUploadDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.file && (
        <div 
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={closeContextMenu}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Rename</span>
          </button>
          <button
            onClick={() => handleDeleteFile(contextMenu.file!.id)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Overlay to close context menu */}
      {contextMenu.file && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
        />
      )}
    </div>
  );
}
