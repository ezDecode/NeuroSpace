'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

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

export default function DocumentsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      // Remove the file from the local state
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      // You could add a toast notification here
    }
  };

  const getStatusDisplay = (status: File['status']) => {
    const statusMap = {
      processed: { text: 'Processed', color: 'text-green-400' },
      processing: { text: 'Processing', color: 'text-yellow-400' },
      error: { text: 'Error', color: 'text-red-400' },
      uploaded: { text: 'Uploaded', color: 'text-white/60' },
    };
    return statusMap[status];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-white/60">Loading documents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-normal text-white transition-all duration-500 hover:scale-105">No documents yet</h2>
            <p className="text-white/60 transition-colors duration-300 hover:text-white/80">Upload your first document to get started</p>
          </div>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg"
          >
            <PlusIcon className="h-4 w-4" />
            Upload document
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-normal text-white transition-all duration-500 hover:scale-105">Documents</h1>
          <p className="text-white/60 mt-1 transition-colors duration-300 hover:text-white/80">{files.length} document{files.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg"
        >
          <PlusIcon className="h-4 w-4" />
          Upload
        </Link>
      </div>

      <div className="space-y-2">
        {files.map((file, index) => {
          const status = getStatusDisplay(file.status);
          return (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 rounded-xl border border-white/20 bg-black hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <DocumentTextIcon className="h-5 w-5 text-white/60 group-hover:text-black/60 flex-shrink-0 transition-colors duration-300" />
                <div className="min-w-0 flex-1">
                  <div className="text-white group-hover:text-black font-medium truncate transition-colors duration-300">{file.file_name}</div>
                  <div className="flex items-center gap-3 text-sm text-white/60 group-hover:text-black/60 transition-colors duration-300">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-sm transition-colors duration-300 ${status.color.replace('text-', 'group-hover:text-')}`}>
                  {status.text}
                </span>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="p-1.5 text-white/40 group-hover:text-red-500 transition-all duration-300 transform hover:scale-110"
                  title="Delete document"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
