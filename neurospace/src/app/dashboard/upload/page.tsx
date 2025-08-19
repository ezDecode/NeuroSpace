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
import toast from 'react-hot-toast';

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

  const uploadFileToS3 = async (file: File): Promise<{ fileKey: string }> => {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get upload URL');
    }
    const { signedUrl, fileKey } = await response.json();
    const uploadResponse = await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    if (!uploadResponse.ok) throw new Error('Failed to upload file to S3');
    return { fileKey };
  };

  const processFile = async (fileKey: string, fileName: string) => {
    const response = await fetch('/api/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileKey, fileName }) });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process file');
    }
    return await response.json();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    const uploadPromises = files.map(async (file, idx) => {
      try {
        setFiles(prev => prev.map((f, i) => i === idx ? { ...f, progress: 25 } : f));
        const { fileKey } = await uploadFileToS3(file);
        setFiles(prev => prev.map((f, i) => i === idx ? { ...f, progress: 75, fileKey } : f));
        processFile(fileKey, file.name).catch(() => {});
        setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'success' as const, progress: 100 } : f));
        toast.success(`Uploaded ${file.name}`);
      } catch (error: unknown) {
        const msg = (error as Error)?.message || 'Upload failed';
        setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'error' as const, error: msg } : f));
        toast.error(`Failed to upload ${file.name}`);
      }
    });
    await Promise.allSettled(uploadPromises);
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Documents</h1>
        <p className="text-slate-300 mt-2">Upload your documents to build your AI-powered knowledge base</p>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 backdrop-blur">
        <div
          {...getRootProps()}
          className={`text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-purple-400 bg-purple-500/10' 
              : 'hover:border-purple-300 hover:bg-white/10'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-slate-300" />
          <div className="mt-4">
            <p className="text-lg font-medium text-white">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-slate-300 mt-2">or click to select files</p>
          </div>
          <p className="text-sm text-slate-400 mt-4">Supports PDF, TXT, DOC, DOCX (Max 10MB per file)</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h3 className="text-lg font-semibold text-white mb-4">Files to Upload ({files.length})</h3>
          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-4">
                  <DocumentTextIcon className="w-8 h-8 text-slate-300" />
                  <div>
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-sm text-slate-300">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {file.error && <p className="text-sm text-red-300 mt-1">{file.error}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {file.status === 'uploading' && (
                    <div className="w-40">
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${file.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{file.progress}%</p>
                    </div>
                  )}
                  {file.status === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-400" />}
                  {file.status === 'error' && <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />}
                  <button onClick={() => removeFile(index)} className="p-1 text-slate-300 hover:text-red-300 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleUpload} disabled={uploading} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow">
              {uploading ? 'Uploading…' : 'Upload Files'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}