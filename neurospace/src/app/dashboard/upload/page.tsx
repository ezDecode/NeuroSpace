"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface FileWithPreview extends File {
  preview?: string;
  status?: 'uploading' | 'success' | 'error';
  progress?: number;
  fileKey?: string;
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  // Security: Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      ...file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as const,
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFileToS3 = async (file: File, index: number): Promise<{ fileKey: string }> => {
    // Get signed URL from our API
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get upload URL');
    }

    const { signedUrl, fileKey } = await response.json();

    // Upload to S3 using signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    return { fileKey };
  };

  const processFile = async (fileKey: string, fileName: string) => {
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey,
          fileName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process file');
      }

      return await response.json();
    } catch (error) {
      console.error('Processing error:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    // Process files with error isolation
    const uploadPromises = files.map(async (file, index) => {
      try {
        // Update progress to 25%
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress: 25 } : f
        ));

        // Upload to S3
        const { fileKey } = await uploadFileToS3(file, index);
        
        // Update progress to 75%
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress: 75, fileKey } : f
        ));

        // Process file (this will happen in background)
        processFile(fileKey, file.name).catch(error => {
          console.error(`Background processing failed for ${file.name}:`, error);
          // Don't mark as error since upload was successful
        });
        
        // Mark as success
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: 'success' as const, progress: 100 } : f
        ));

      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        setFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ));
      }
    });

    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-600 mt-2">
          Upload your documents to build your AI-powered knowledge base
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8">
        <div
          {...getRootProps()}
          className={`text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-purple-400 bg-purple-50' 
              : 'hover:border-purple-300 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-gray-500 mt-2">
              or click to select files
            </p>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Supports PDF, TXT, DOC, DOCX (Max 10MB per file)
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Files to Upload ({files.length})
          </h3>
          
          <div className="space-y-4">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.error && (
                      <p className="text-sm text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{file.progress}%</p>
                    </div>
                  )}
                  
                  {/* Status Icons */}
                  {file.status === 'success' && (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  )}
                  
                  {file.status === 'error' && (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Upload Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}