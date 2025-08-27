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
import { toast } from 'react-hot-toast';
import { componentClasses, designTokens, getCardClass, getButtonClass } from '@/lib/design-system';
import { PageLoading, ErrorState, EmptyState, StatusBadge, GridSkeleton } from '@/components/ui/LoadingStates';
import { ConfirmModal } from '@/components/ui/Modal';

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
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Cleanup state
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/files');
      if (!response.ok) {
        let errorMessage = 'Failed to fetch files';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
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
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse files response JSON:', jsonError);
        throw new Error('Server returned invalid JSON response');
      }
      
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName });
    setShowDeleteModal(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/files/${fileToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      setFiles(prev => prev.filter(file => file.id !== fileToDelete.id));
      setShowDeleteModal(false);
      setFileToDelete(null);
      toast.success(`"${fileToDelete.name}" has been deleted successfully`);
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error(`Failed to delete "${fileToDelete.name}". Please try again.`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFileToDelete(null);
    setIsDeleting(false);
  };

  const handleCleanupDuplicates = async () => {
    setIsCleaningUp(true);
    try {
      const response = await fetch('/api/files/cleanup-duplicates', {
        method: 'POST',
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to cleanup duplicate files';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse cleanup error response:', jsonError);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      if (data.duplicates_removed > 0) {
        toast.success(`Successfully removed ${data.duplicates_removed} duplicate file records`);
        // Refresh the files list
        await fetchFiles();
      } else {
        toast.success('No duplicate files found to clean up');
      }
    } catch (err) {
      console.error('Error cleaning up duplicates:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to cleanup duplicate files');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const getStatusDisplay = (status: File['status']) => {
    const statusMap = {
      processed: { 
        text: 'Processed', 
        status: 'success' as const,
        icon: CheckCircleIcon
      },
      processing: { 
        text: 'Processing', 
        status: 'warning' as const,
        icon: ClockIcon
      },
      error: { 
        text: 'Error', 
        status: 'error' as const,
        icon: ExclamationTriangleIcon
      },
      uploaded: { 
        text: 'Uploaded', 
        status: 'info' as const,
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
    if (contentType.includes('markdown')) return '📝';
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
      <div className={componentClasses.layout.page}>
        <div className="flex items-center justify-between">
          <h1 className={designTokens.typography.h1}>Documents</h1>
        </div>
        <GridSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={componentClasses.layout.page}>
        <div className="flex items-center justify-between">
          <h1 className={designTokens.typography.h1}>Documents</h1>
        </div>
        <ErrorState 
          title="Failed to load documents"
          message={error}
          onRetry={fetchFiles}
        />
      </div>
    );
  }

  return (
    <div className={componentClasses.layout.page}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className={designTokens.typography.h1}>Documents</h1>
          <p className="text-white/60">Manage your uploaded files and knowledge base</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCleanupDuplicates}
            disabled={isCleaningUp}
            className={getButtonClass('secondary')}
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            <span>{isCleaningUp ? 'Cleaning...' : 'Clean Duplicates'}</span>
          </button>
          <Link href="/dashboard/upload" className={getButtonClass('primary')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            <span>Upload Files</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={componentClasses.layout.gridStats}>
        <div className={getCardClass()}>
          <div className="text-2xl font-bold text-white">{files.length}</div>
          <div className="text-sm text-white/60">Total Files</div>
        </div>
        <div className={getCardClass()}>
          <div className="text-2xl font-bold text-green-400">
            {files.filter(f => f.status === 'processed').length}
          </div>
          <div className="text-sm text-white/60">Processed</div>
        </div>
        <div className={getCardClass()}>
          <div className="text-2xl font-bold text-yellow-400">
            {files.filter(f => f.status === 'processing').length}
          </div>
          <div className="text-sm text-white/60">Processing</div>
        </div>
        <div className={getCardClass()}>
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
        <EmptyState
          title="No files found"
          message={
            searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to get started'
          }
          icon={DocumentTextIcon}
          action={
            !searchTerm && filterStatus === 'all' ? (
              <Link href="/dashboard/upload" className={getButtonClass('primary')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                <span>Upload Files</span>
              </Link>
            ) : undefined
          }
        />
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
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
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
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
                        <StatusBadge status={status.status}>
                          <StatusIcon className="h-3 w-3" />
                          <span className="text-xs font-medium">{status.text}</span>
                        </StatusBadge>
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
                            onClick={() => handleDeleteFile(file.id, file.file_name)}
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
                  className={getCardClass(true)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{getFileIcon(file.content_type)}</div>
                    <StatusBadge status={status.status}>
                      <StatusIcon className="h-3 w-3" />
                      <span className="text-xs font-medium">{status.text}</span>
                    </StatusBadge>
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
                      onClick={() => handleDeleteFile(file.id, file.file_name)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteFile}
        title="Delete Document"
        message={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone and will permanently remove the document from your knowledge base.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
