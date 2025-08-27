'use client';

import { 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  PlusIcon,
  FolderIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { componentClasses, designTokens, getCardClass } from '@/lib/design-system';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
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
  
  try {
    return await response.json();
  } catch (jsonError) {
    console.error('Failed to parse response JSON:', jsonError);
    throw new Error('Server returned invalid JSON response');
  }
};

const quickActions = [
  {
    title: 'Upload Documents',
    description: 'Add PDFs, docs, and text files to your knowledge base',
    icon: PlusIcon,
    href: '/dashboard/upload',
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
  },
  {
    title: 'Start New Chat',
    description: 'Begin a conversation with your AI assistant',
    icon: ChatBubbleLeftRightIcon,
    href: '/dashboard/chat',
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
  },
  {
    title: 'Browse Documents',
    description: 'View and manage your uploaded files',
    icon: DocumentTextIcon,
    href: '/dashboard/documents',
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10'
  },
  
];

export default function Dashboard() {
  const { data: filesData, isLoading: filesLoading } = useSWR('/api/files', fetcher);
  
  return (
    <div className={componentClasses.layout.page}>
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className={componentClasses.icon.container}>
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className={designTokens.typography.h1}>
            Welcome back!
          </h1>
        </div>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Your AI knowledge base is ready to help. What would you like to do today?
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={componentClasses.layout.section}
      >
        <div className="flex items-center justify-between">
          <h2 className={designTokens.typography.h2}>Quick Actions</h2>
          <div className="text-sm text-white/40">Get started quickly</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className={`group block ${getCardClass(true)} ${action.gradient}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <ActionIcon className="h-6 w-6 text-white" />
                    </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{action.description}</p>
                  </div>
                </div>
              </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Documents */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={componentClasses.layout.section}
      >
        <div className="flex items-center justify-between">
          <h2 className={designTokens.typography.h2}>Recent Documents</h2>
          <Link href="/dashboard/documents" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            View all
          </Link>
        </div>
        
        {filesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-3 bg-white/5 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filesData?.files?.length > 0 ? (
          <div className="space-y-3">
            {filesData.files.slice(0, 5).map((file: any, index: number) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-blue-400">
                  <DocumentTextIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{file.file_name}</div>
                  <div className="text-xs text-white/60">
                    {((file.file_size || 0) / (1024 * 1024)).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    file.status === 'processed' ? 'bg-green-500/20 text-green-400' :
                    file.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {file.status || 'pending'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <div className="text-white/60 mb-2">No documents yet</div>
            <div className="text-white/40 text-sm">Upload your first document to get started</div>
          </div>
        )}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center py-8"
      >
        <div className="inline-flex items-center space-x-2 text-white/40 text-sm">
          <SparklesIcon className="h-4 w-4" />
          <span>NeuroSpace can make mistakes. Check important information.</span>
        </div>
      </motion.div>
    </div>
  );
}
