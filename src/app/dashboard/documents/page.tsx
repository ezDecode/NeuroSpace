'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  TrashIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const getStatusDisplay = (status: File['status']) => {
    const statusMap = {
      processed: { 
        text: 'Processed', 
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        borderColor: 'border-green-400/20',
        icon: CheckCircleIcon
      },
      processing: { 
        text: 'Processing', 
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        borderColor: 'border-yellow-400/20',
        icon: ClockIcon
      },
      error: { 
        text: 'Error', 
        color: 'text-red-400',
        bgColor: 'bg-red-400/10',
        borderColor: 'border-red-400/20',
        icon: ExclamationTriangleIcon
      },
      uploaded: { 
        text: 'Uploaded', 
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/20',
        icon: DocumentTextIcon
      },
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || contentType.includes('document')) return '📝';
    if (contentType.includes('text')) return '📄';
    if (contentType.includes('image')) return '🖼️';
    return '📄';
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || file.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Documents</h1>
        </div>
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <div className="text-white/60">Loading documents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Documents</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">{error}</div>
          <button 
            onClick={fetchFiles}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Documents</h1>
          <p className="text-white/60">Manage your uploaded files and knowledge base</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Upload Files</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-2xl font-bold text-white">{files.length}</div>
          <div className="text-sm text-white/60">Total Files</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-2xl font-bold text-green-400">
            {files.filter(f => f.status === 'processed').length}
          </div>
          <div className="text-sm text-white/60">Processed</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-2xl font-bold text-yellow-400">
            {files.filter(f => f.status === 'processing').length}
          </div>
          <div className="text-sm text-white/60">Processing</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-2xl font-bold text-white">
            {formatFileSize(files.reduce((acc, f) => acc + f.file_size, 0))}
          </div>
          <div className="text-sm text-white/60">Total Size</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="all">All Status</option>
            <option value="uploaded">Uploaded</option>
            <option value="processing">Processing</option>
            <option value="processed">Processed</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="h-8 w-8 text-white/40" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No files found</h3>
          <p className="text-white/60 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to get started'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Upload Files</span>
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-white/60 font-medium">File</th>
                <th className="text-left py-4 px-4 text-white/60 font-medium">Size</th>
                <th className="text-left py-4 px-4 text-white/60 font-medium">Status</th>
                <th className="text-left py-4 px-4 text-white/60 font-medium">Uploaded</th>
                <th className="text-left py-4 px-4 text-white/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredFiles.map((file, index) => {
                  const status = getStatusDisplay(file.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.tr
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getFileIcon(file.content_type)}</div>
                          <div>
                            <div className="text-white font-medium">{file.file_name}</div>
                            <div className="text-sm text-white/40">{file.content_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/60">{formatFileSize(file.file_size)}</td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${status.bgColor} ${status.borderColor} border`}>
                          <StatusIcon className={`h-3 w-3 ${status.color}`} />
                          <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/60 text-sm">{formatDate(file.created_at)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredFiles.map((file, index) => {
              const status = getStatusDisplay(file.status);
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{getFileIcon(file.content_type)}</div>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${status.bgColor} ${status.borderColor} border`}>
                      <StatusIcon className={`h-3 w-3 ${status.color}`} />
                      <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <h3 className="text-white font-medium truncate">{file.file_name}</h3>
                    <div className="text-sm text-white/40">{formatFileSize(file.file_size)}</div>
                    <div className="text-xs text-white/30">{formatDate(file.created_at)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
