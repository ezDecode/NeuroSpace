'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  XMarkIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { componentClasses, designTokens, getCardClass, getButtonClass } from '@/lib/design-system';
import { ProgressBar } from '@/components/ui/LoadingStates';

interface FileWrapper {
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  fileKey?: string;
}

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/rtf': ['.rtf']
};

export default function UploadPage() {
  const [files, setFiles] = useState<FileWrapper[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    
    const newFiles: FileWrapper[] = acceptedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFileToS3 = async (fileWrapper: FileWrapper) => {
    try {
      console.log('Processing file:', {
        name: fileWrapper.name,
        size: fileWrapper.size,
        type: fileWrapper.type
      });

      console.log('uploadFileToS3 called with:', {
        fileName: fileWrapper.name,
        fileSize: fileWrapper.size,
        fileType: fileWrapper.type
      });

      // Call the upload URL API with JSON payload
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileWrapper.name,
          fileType: fileWrapper.type,
          fileSize: fileWrapper.size,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          // Clone the response to avoid "body stream already read" error
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to parse error response:', textError);
          }
        }
        console.log('Upload URL response status:', response.status);
        console.error('Failed to get upload URL:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Got signed URL, uploading to S3...');
      // Expect JSON object with { url, fileKey, fileName }
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse upload response JSON:', jsonError);
        throw new Error('Server returned invalid JSON response');
      }
      
      if (!responseData.url || !responseData.fileKey) {
        throw new Error('Invalid response: missing url or fileKey');
      }
      
      const { url, fileKey } = responseData;

      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: fileWrapper.file,
        headers: {
          'Content-Type': fileWrapper.type,
        },
      });

      console.log('S3 upload response:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload failed:', errorText);
        throw new Error(`S3 upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      console.log('File uploaded successfully to S3');
      return { fileKey };
    } catch (error) {
      console.error('uploadFileToS3 error:', error);
      throw error;
    }
  };

  const createFileRecord = async (fileKey: string, fileName: string, fileSize: number, fileType: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_key: fileKey,
          file_name: fileName,
          file_size: fileSize,
          content_type: fileType,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create file record';
        try {
          // Clone the response to avoid "body stream already read" error
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to parse error response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse createFileRecord response JSON:', jsonError);
        throw new Error('Server returned invalid JSON response');
      }
      
      return result;
    } catch (error) {
      console.error('createFileRecord error:', error);
      throw error;
    }
  };

  const processFile = async (fileKey: string, fileName: string) => {
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: fileKey,
          fileName: fileName,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to process file';
        try {
          // Clone the response to avoid "body stream already read" error
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to parse error response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse processFile response JSON:', jsonError);
        throw new Error('Server returned invalid JSON response');
      }
      
      return result;
    } catch (error) {
      console.error('processFile error:', error);
      throw error;
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const fileWrapper = files[i];
      
      try {
        // Update status to uploading
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'uploading', progress: 10 } : f
        ));
        
        // Upload to S3
        const { fileKey } = await uploadFileToS3(fileWrapper);
        
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, progress: 50 } : f
        ));
        
        // Create file record
        await createFileRecord(fileKey, fileWrapper.name, fileWrapper.size, fileWrapper.type);
        
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'processing', progress: 75 } : f
        ));
        
        // Process file
        await processFile(fileKey, fileWrapper.name);
        
        // Mark as success
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'success', progress: 100, fileKey } : f
        ));
        
        successCount++;
        toast.success(`${fileWrapper.name} uploaded and processed successfully!`);
        
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
    
    // If all files were successful, redirect to documents page
    if (successCount === files.length && successCount > 0) {
      toast.success('All files uploaded successfully! Redirecting to documents...');
      setTimeout(() => {
        router.push('/dashboard/documents');
      }, 2000);
    }
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

  const getStatusIcon = (status: FileWrapper['status']) => {
    switch (status) {
      case 'pending':
        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
      case 'uploading':
        return <ArrowUpTrayIcon className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'processing':
        return <ClockIcon className="h-4 w-4 text-yellow-400 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: FileWrapper['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={componentClasses.layout.page}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className={componentClasses.icon.container}>
          <CloudArrowUpIcon className="h-6 w-6 text-white" />
        </div>
        <h1 className={designTokens.typography.h1}>Upload Documents</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Upload your documents to build your AI knowledge base. Supported formats: PDF, DOC, DOCX, TXT, MD, RTF
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={componentClasses.layout.section}
      >
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragActive 
              ? 'border-white/40 bg-gray-800/50' 
              : 'border-gray-600 bg-gray-900/30'
          } hover:border-white/30 hover:bg-gray-800/30 cursor-pointer`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-gray-400 mb-4">
            or click to browse files
          </p>
          <p className="text-sm text-gray-500">
            Maximum file size: 50MB • Supported: PDF, DOC, DOCX, TXT, MD, RTF
          </p>
        </div>
      </motion.div>

      {/* File List */}
      {files.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={componentClasses.layout.section}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={designTokens.typography.h3}>Files to Upload</h2>
            <button
              onClick={uploadFiles}
              disabled={uploading || files.some(f => f.status === 'error')}
              className={getButtonClass('primary')}
            >
              {uploading ? (
                <>
                  <div className="spinner w-4 h-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Upload All Files
                </>
              )}
            </button>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={getCardClass()}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getFileIcon(file.type)}</div>
                      <div>
                        <div className="text-white font-medium">{file.name}</div>
                        <div className="text-sm text-gray-400">
                          {formatFileSize(file.size)} • {file.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(file.status)}
                        <span className={`text-sm ${
                          file.status === 'success' ? 'text-green-400' :
                          file.status === 'error' ? 'text-red-400' :
                          file.status === 'processing' ? 'text-yellow-400' :
                          file.status === 'uploading' ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {getStatusText(file.status)}
                        </span>
                      </div>
                      
                      {file.status === 'error' && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {file.status !== 'pending' && (
                    <div className="mt-3">
                      <ProgressBar 
                        progress={file.progress} 
                        showPercentage={false}
                      />
                    </div>
                  )}
                  
                  {file.error && (
                    <div className="mt-2 text-sm text-red-400">
                      Error: {file.error}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={componentClasses.layout.section}
      >
        <div className="p-6 rounded-2xl border border-gray-700 bg-gray-800/30">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How it works</h3>
              <p className="text-gray-300 leading-relaxed">
                Your documents are securely uploaded, processed, and indexed for AI-powered search. 
                The system automatically extracts text, creates searchable chunks, and makes your 
                content available for intelligent conversations. Processing typically takes 1-2 minutes 
                depending on file size and complexity.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
