'use client';

import React from 'react';
import FileSelector from '@/components/chat/FileSelector';
import { useFileSelector } from '@/hooks/useFileSelector';

export default function FileSelectorDemoPage() {
  const {
    files,
    selectedFiles,
    selectedFileDetails,
    onSelectionChange,
    isLoading,
    error,
    refreshFiles,
    totalFiles,
    hasFiles
  } = useFileSelector();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FileSelector Demo</h1>
          <p className="text-gray-600">
            This demo shows the FileSelector component with mock data when the backend is unavailable.
          </p>
        </div>

        {/* Status Banner */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Backend Not Available
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Using mock data for demonstration. Start the backend service to use real files.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={refreshFiles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Files
          </button>
          {selectedFiles.length > 0 && (
            <button
              onClick={() => onSelectionChange([])}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Selection ({selectedFiles.length})
            </button>
          )}
        </div>

        {/* Current Selection Display */}
        {selectedFileDetails.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Files</h2>
            <div className="grid gap-3">
              {selectedFileDetails.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{file.file_name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.file_size / (1024 * 1024)).toFixed(1)} MB • {file.status}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectionChange(selectedFiles.filter(id => id !== file.id))}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FileSelector Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">File Selector</h2>
            <div className="text-sm text-gray-500">
              {totalFiles} files • {selectedFiles.length} selected
            </div>
          </div>
          
          <FileSelector
            files={files}
            selectedFiles={selectedFiles}
            onSelectionChange={onSelectionChange}
            isLoading={isLoading}
            className="max-h-96 overflow-y-auto"
            maxDisplayCount={5} // Show fewer files initially for demo
            showSelectAll={true}
          />
        </div>

        {/* Features Demo */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Demonstrated</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Individual file selection with checkboxes</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Select all / Deselect all functionality</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>File preview chips with remove buttons</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Load more pagination (shows 5 initially)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>File type icons and status indicators</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Smooth animations and transitions</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Accessibility (ARIA) support</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Error handling and type safety</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Files</span>
                <span className="text-sm font-medium text-gray-900">{totalFiles}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Selected Files</span>
                <span className="text-sm font-medium text-blue-600">{selectedFiles.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Loading State</span>
                <span className={`text-sm font-medium ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isLoading ? 'Loading...' : 'Ready'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Backend Status</span>
                <span className={`text-sm font-medium ${error ? 'text-red-600' : 'text-green-600'}`}>
                  {error ? 'Offline (Mock Data)' : 'Connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}