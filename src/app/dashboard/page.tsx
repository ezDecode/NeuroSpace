'use client';

import { 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  PlusIcon,
  FolderIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  ArrowUpIcon,
  UsersIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { componentClasses, designTokens, getCardClass, getButtonClass } from '@/lib/design-system';

// Mock data - in real app, this would come from API
const stats = [
  {
    title: 'Total Documents',
    value: '24',
    change: '+12%',
    changeType: 'positive',
    icon: DocumentTextIcon,
    color: 'from-blue-500 to-cyan-500',
    description: 'Files uploaded'
  },
  {
    title: 'Chat Sessions',
    value: '156',
    change: '+8%',
    changeType: 'positive',
    icon: ChatBubbleLeftRightIcon,
    color: 'from-purple-500 to-pink-500',
    description: 'This month'
  },
  {
    title: 'Storage Used',
    value: '6.5 GB',
    change: '+2.1 GB',
    changeType: 'neutral',
    icon: FolderIcon,
    color: 'from-green-500 to-emerald-500',
    description: 'Of 10 GB total'
  },
  {
    title: 'AI Responses',
    value: '1,247',
    change: '+23%',
    changeType: 'positive',
    icon: CpuChipIcon,
    color: 'from-orange-500 to-red-500',
    description: 'Generated today'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'upload',
    title: 'Project Proposal.pdf',
    description: 'Document uploaded successfully',
    time: '2 minutes ago',
    icon: DocumentTextIcon,
    color: 'text-blue-400'
  },
  {
    id: 2,
    type: 'chat',
    title: 'New conversation started',
    description: 'Asked about Q4 strategy',
    time: '15 minutes ago',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-purple-400'
  },
  {
    id: 3,
    type: 'processing',
    title: 'Technical Manual.docx',
    description: 'Document processing completed',
    time: '1 hour ago',
    icon: DocumentMagnifyingGlassIcon,
    color: 'text-green-400'
  },
  {
    id: 4,
    type: 'chat',
    title: 'Conversation ended',
    description: '5 messages exchanged',
    time: '2 hours ago',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-purple-400'
  }
];

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
  {
    title: 'View Analytics',
    description: 'Check your usage statistics and insights',
    icon: ChartBarIcon,
    href: '/dashboard/analytics',
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-500/10 to-red-500/10'
  }
];

export default function Dashboard() {
  // Debug log to verify design system exports are working
  console.log('Design System Debug:', { componentClasses, getButtonClass });
  
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

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={componentClasses.layout.gridStats}
      >
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className={getCardClass(true)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.changeType === 'positive' ? 'text-green-400' : 
                  stat.changeType === 'negative' ? 'text-red-400' : 'text-white/60'
                }`}>
                  <ArrowUpIcon className="h-3 w-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.title}</div>
                <div className="text-xs text-white/40">{stat.description}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
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
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
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

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={componentClasses.layout.section}
      >
        <div className="flex items-center justify-between">
          <h2 className={designTokens.typography.h2}>Recent Activity</h2>
          <Link href="/dashboard/activity" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            View all
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((activity, index) => {
            const ActivityIcon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center ${activity.color}`}>
                  <ActivityIcon className="h-5 w-5" />
                </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{activity.title}</div>
                <div className="text-xs text-white/60">{activity.description}</div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-white/40">
                <ClockIcon className="h-3 w-3" />
                <span>{activity.time}</span>
              </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
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
