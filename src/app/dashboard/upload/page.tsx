'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUser } from '@clerk/nextjs';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface FileWithPreview {
  file: File;
  preview?: string;
  status?: 'uploading' | 'success' | 'error';
  progress?: number;
  fileKey?: string;
  error?: string;
  name: string;
  type: string;
  size: number;
}

// Helper function to validate if an object is a valid File
const isValidFile = (obj: unknown): obj is File => {
  return !!(obj && 
         obj instanceof File && 
         typeof (obj as File).name === 'string' && 
         (obj as File).name.length > 0 &&
         typeof (obj as File).type === 'string' &&
         typeof (obj as File).size === 'number' && 
         (obj as File).size > 0);
};

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/markdown': ['.md'],
  'application/rtf': ['.rtf'],
};

export default function UploadPage() {
  const { user } = useUser();
  const userId = user?.id;
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Security: Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    
    // Filter and validate files before adding to state
    const validFiles = acceptedFiles.filter(file => {
      if (!isValidFile(file)) {
        console.warn('Skipping invalid file:', {
          name: (file as File)?.name || 'undefined',
          type: (file as File)?.type || 'undefined',
          size: (file as File)?.size || 'undefined'
        });
        toast.error(`Invalid file: ${(file as File)?.name || 'Unknown'}`);
        return false;
      }
      return true;
    });
    
    const newFiles = validFiles.map((file): FileWithPreview => {
      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      return {
        file: file,
        preview: URL.createObjectURL(file),
        status: 'uploading' as const,
        progress: 0,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    });
    
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
    
    if (validFiles.length < acceptedFiles.length) {
      toast.error(`${acceptedFiles.length - validFiles.length} invalid files were skipped`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFileToS3 = async (fileWrapper: FileWithPreview): Promise<{ fileKey: string }> => {
    try {
      const file = fileWrapper.file;
      console.log('uploadFileToS3 called with:', { 
        file, 
        fileName: file?.name, 
        fileType: file?.type, 
        fileSize: file?.size,
        isFile: file instanceof File
      });
      
      // Validate file properties before sending
      if (!isValidFile(file)) {
        console.error('Invalid file object:', { 
          file: !!file,
          name: (file as File)?.name || 'undefined', 
          type: (file as File)?.type || 'undefined', 
          size: (file as File)?.size || 'undefined',
          isInstanceOfFile: (file as File) instanceof File,
          fileObject: file
        });
        throw new Error('Invalid file object - not a valid File instance or missing required properties');
      }
      
      const requestBody = { fileName: file.name, fileType: file.type, fileSize: file.size };
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Upload URL response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to get upload URL:', error);
        throw new Error(error.error || 'Failed to get upload URL');
      }
      
      const { signedUrl, fileKey } = await response.json();
      console.log('Got signed URL, uploading to S3...');
      
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 
          'Content-Type': file.type,
          // Remove any CORS headers that might interfere
        },
      });
      
      console.log('S3 upload response:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        headers: Object.fromEntries(uploadResponse.headers.entries())
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload failed:', errorText);
        throw new Error(`Failed to upload file to S3: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
      console.log('File uploaded successfully to S3');
      return { fileKey };
    } catch (error) {
      console.error('uploadFileToS3 error:', error);
      throw error;
    }
  };

  const createFileRecord = async (fileKey: string, fileName: string, fileSize: number, fileType: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify({
          file_key: fileKey,
          file_name: fileName,
          file_size: fileSize,
          content_type: fileType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create file record');
      }

      return await response.json();
    } catch (error) {
      console.error('createFileRecord error:', error);
      throw error;
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const fileWrapper = files[i];
      
      try {
        // Update progress
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, progress: 10 } : f
        ));
        
        // Upload to S3
        const { fileKey } = await uploadFileToS3(fileWrapper);
        
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, progress: 50 } : f
        ));
        
        // Create file record
        await createFileRecord(fileKey, fileWrapper.name, fileWrapper.size, fileWrapper.type);
        
        // Mark as success
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'success', progress: 100, fileKey } : f
        ));
        
        toast.success(`${fileWrapper.name} uploaded successfully!`);
        
      } catch (error) {
        console.error(`Error uploading ${fileWrapper.name}:`, error);
        
        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : f
        ));
        
        toast.error(`Failed to upload ${fileWrapper.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || contentType.includes('document')) return '📝';
    if (contentType.includes('text')) return '📄';
    if (contentType.includes('markdown')) return '📝';
    if (contentType.includes('rtf')) return '📄';
    return '📄';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      case 'uploading':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-white/60" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <CloudArrowUpIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Upload Documents</h1>
        </div>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Add PDFs, documents, and text files to build your AI knowledge base
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-4xl mx-auto">
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragActive
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <ArrowUpTrayIcon className="h-8 w-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-white/60">
                or click to browse your files
              </p>
            </div>
            
            <div className="text-sm text-white/40">
              Supports PDF, DOC, DOCX, TXT, MD, RTF (max 10MB each)
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Files to Upload</h2>
            <button
              onClick={uploadFiles}
              disabled={uploading || files.every(f => f.status === 'success')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {uploading ? (
                <>
                  <div className="spinner"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  <span>Upload All Files</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getFileIcon(file.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium truncate">{file.name}</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(file.status || 'pending')}
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white/60">{formatFileSize(file.size)}</div>
                        <div className="text-white/40">{file.type}</div>
                      </div>
                      
                      {file.status === 'uploading' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                            <span>Uploading...</span>
                            <span>{file.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {file.status === 'success' && (
                        <div className="mt-3 flex items-center space-x-2 text-sm text-green-400">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Uploaded successfully</span>
                        </div>
                      )}
                      
                      {file.status === 'error' && (
                        <div className="mt-3 flex items-center space-x-2 text-sm text-red-400">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <span>{file.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <DocumentMagnifyingGlassIcon className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">How it works</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Your documents are securely uploaded and processed by our AI. The content is broken down into searchable chunks, 
                making it easy to find and reference information later. You can then chat with your documents and get instant answers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
