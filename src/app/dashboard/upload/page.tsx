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
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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

export default function UploadPage() {
  const { user } = useUser();
  const userId = user?.id;
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

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
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
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
      const response = await fetch(`${backendUrl}/api/files/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
        body: JSON.stringify({
          file_key: fileKey,
          file_name: fileName,
          user_id: userId,
          file_size: fileSize,
          content_type: fileType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create file record: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('File record created:', result);
      return result;
    } catch (error) {
      console.error('Error creating file record:', error);
      throw error;
    }
  };

  const processFile = async (fileKey: string, fileName: string) => {
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileKey, fileName }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process file');
    }
    return await response.json();
  };

  const handleUpload = async () => {
    if (!userId) {
      toast.error('Please sign in to upload files');
      return;
    }
    if (files.length === 0) return;
    setUploading(true);
    
    // Filter out any invalid files before uploading
    const validFiles = files.filter(fileWrapper => isValidFile(fileWrapper.file));
    
    if (validFiles.length === 0) {
      toast.error('No valid files to upload');
      setUploading(false);
      return;
    }
    
    const uploadPromises = validFiles.map(async (fileWrapper) => {
      try {
        console.log('Starting upload for file:', { name: fileWrapper.name, type: fileWrapper.type, size: fileWrapper.size });
        
        // Find the original index of this file in the files array
        const originalIndex = files.findIndex(f => f.name === fileWrapper.name && f.size === fileWrapper.size);
        
        setFiles((prev) => prev.map((f, i) => (i === originalIndex ? { ...f, progress: 25 } : f)));
        const { fileKey } = await uploadFileToS3(fileWrapper);
        setFiles((prev) => prev.map((f, i) => (i === originalIndex ? { ...f, progress: 75, fileKey } : f)));
        
        // Create file record in the backend
        await createFileRecord(fileKey, fileWrapper.name, fileWrapper.size, fileWrapper.type);
        
        processFile(fileKey, fileWrapper.name).catch(() => {});
        setFiles((prev) =>
          prev.map((f, i) => (i === originalIndex ? { ...f, status: 'success' as const, progress: 100 } : f)),
        );
        toast.success(`Uploaded ${fileWrapper.name}`);
      } catch (error: unknown) {
        console.error('Upload error for file:', fileWrapper.name, error);
        const msg = (error as Error)?.message || 'Upload failed';
        const originalIndex = files.findIndex(f => f.name === fileWrapper.name && f.size === fileWrapper.size);
        setFiles((prev) =>
          prev.map((f, i) => (i === originalIndex ? { ...f, status: 'error' as const, error: msg } : f)),
        );
        toast.error(`Failed to upload ${fileWrapper.name}: ${msg}`);
      }
    });
    await Promise.allSettled(uploadPromises);
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center animate-fade-in">
        <h1 className="text-3xl font-normal text-white mb-2 transition-all duration-500 hover:scale-105">Upload Documents</h1>
        <p className="text-white/60 transition-colors duration-300 hover:text-white/80">
          Upload your documents to build your AI-powered knowledge base
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
          isDragActive
            ? 'border-white/50 bg-white/10 scale-[1.02]'
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className={`mx-auto h-16 w-16 text-white/40 mb-4 transition-all duration-300 ${isDragActive ? 'scale-110 text-white/60' : 'hover:scale-110'}`} />
        <h3 className="text-xl font-medium text-white mb-2 transition-colors duration-300">
          {isDragActive ? 'Drop files here' : 'Drop files to upload'}
        </h3>
        <p className="text-white/60 mb-2 transition-colors duration-300 hover:text-white/80">or click to browse</p>
        <p className="text-sm text-white/40 transition-colors duration-300 hover:text-white/60">
          Supports PDF, TXT, DOC, DOCX files up to 10MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-medium text-white transition-all duration-500 hover:scale-105">
            Uploaded files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 rounded-xl border border-white/20 bg-black hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-[1.01] group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <DocumentTextIcon className="w-5 h-5 text-white/60 group-hover:text-black/60 flex-shrink-0 transition-colors duration-300" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white group-hover:text-black truncate transition-colors duration-300">{file.name}</p>
                    <p className="text-sm text-white/60 group-hover:text-black/60 transition-colors duration-300">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.error && (
                      <p className="text-sm text-red-400 group-hover:text-red-600 mt-1 transition-colors duration-300">{file.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {file.status === 'uploading' && (
                    <div className="w-24">
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div
                          className="bg-white group-hover:bg-black h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/60 group-hover:text-black/60 mt-1 text-center transition-colors duration-300">
                        {file.progress}%
                      </p>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <CheckCircleIcon className="w-5 h-5 text-green-400 group-hover:text-green-600 transition-colors duration-300" />
                  )}
                  {file.status === 'error' && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors duration-300" />
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-white/40 group-hover:text-black/40 hover:!text-red-500 transition-all duration-300 transform hover:scale-110"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transform hover:scale-105 disabled:hover:scale-100"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
