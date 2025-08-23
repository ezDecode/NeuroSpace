'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SparklesIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Mock data - in real app, this would come from API
const usageStats = {
  totalDocuments: 24,
  totalChats: 156,
  totalTokens: 12470,
  storageUsed: 6.5,
  storageLimit: 10,
  documentsThisMonth: 8,
  chatsThisMonth: 45,
  avgResponseTime: 2.3,
  accuracy: 94.2
};

const monthlyData = [
  { month: 'Jan', documents: 4, chats: 12, tokens: 1200 },
  { month: 'Feb', documents: 6, chats: 18, tokens: 1800 },
  { month: 'Mar', documents: 8, chats: 25, tokens: 2400 },
  { month: 'Apr', documents: 12, chats: 32, tokens: 3100 },
  { month: 'May', documents: 16, chats: 38, tokens: 3800 },
  { month: 'Jun', documents: 24, chats: 45, tokens: 4500 },
];

const recentActivity = [
  {
    id: 1,
    type: 'upload',
    title: 'Project Proposal.pdf',
    description: 'Document uploaded and processed',
    time: '2 hours ago',
    icon: DocumentTextIcon,
    color: 'text-blue-400'
  },
  {
    id: 2,
    type: 'chat',
    title: 'Q4 Strategy Discussion',
    description: '15 messages exchanged',
    time: '4 hours ago',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-purple-400'
  },
  {
    id: 3,
    type: 'processing',
    title: 'Technical Manual.docx',
    description: 'Document processing completed',
    time: '1 day ago',
    icon: ClockIcon,
    color: 'text-green-400'
  },
  {
    id: 4,
    type: 'chat',
    title: 'Product Requirements',
    description: '8 messages exchanged',
    time: '2 days ago',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-purple-400'
  }
];

const topDocuments = [
  { name: 'Project Proposal.pdf', views: 45, chats: 12, size: '2.3 MB' },
  { name: 'Technical Manual.docx', views: 38, chats: 8, size: '1.8 MB' },
  { name: 'Q4 Strategy.pdf', views: 32, chats: 15, size: '3.1 MB' },
  { name: 'Product Requirements.txt', views: 28, chats: 6, size: '0.5 MB' },
  { name: 'Meeting Notes.pdf', views: 25, chats: 4, size: '1.2 MB' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-white/60">Track your usage and performance insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-400">
              <ArrowUpIcon className="h-3 w-3" />
              <span>+{getGrowthRate(usageStats.documentsThisMonth, 6)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">{usageStats.totalDocuments}</div>
            <div className="text-sm text-white/60">Total Documents</div>
            <div className="text-xs text-white/40">{usageStats.documentsThisMonth} this month</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-400">
              <ArrowUpIcon className="h-3 w-3" />
              <span>+{getGrowthRate(usageStats.chatsThisMonth, 32)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">{usageStats.totalChats}</div>
            <div className="text-sm text-white/60">Chat Sessions</div>
            <div className="text-xs text-white/40">{usageStats.chatsThisMonth} this month</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-400">
              <ArrowUpIcon className="h-3 w-3" />
              <span>+{getGrowthRate(usageStats.totalTokens, 10000)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">{formatNumber(usageStats.totalTokens)}</div>
            <div className="text-sm text-white/60">AI Tokens Used</div>
            <div className="text-xs text-white/40">This month</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-400">
              <ArrowDownIcon className="h-3 w-3" />
              <span>-{getGrowthRate(usageStats.avgResponseTime, 3.1)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">{usageStats.avgResponseTime}s</div>
            <div className="text-sm text-white/60">Avg Response Time</div>
            <div className="text-xs text-white/40">Faster than last month</div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Usage Trends</h3>
            <TrendingUpIcon className="h-5 w-5 text-white/60" />
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{data.month}</span>
                  <span className="text-white">{data.documents} docs, {data.chats} chats</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${(data.documents / Math.max(...monthlyData.map(d => d.documents))) * 100}%`,
                      animationDelay: `${index * 200}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Storage Usage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Storage Usage</h3>
            <div className="text-sm text-white/60">
              {usageStats.storageUsed} GB / {usageStats.storageLimit} GB
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="w-full bg-white/10 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${(usageStats.storageUsed / usageStats.storageLimit) * 100}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-white font-medium">{usageStats.storageUsed} GB</div>
                <div className="text-white/60">Used</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-white font-medium">{usageStats.storageLimit - usageStats.storageUsed} GB</div>
                <div className="text-white/60">Available</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Most Active Documents</h3>
          <EyeIcon className="h-5 w-5 text-white/60" />
        </div>
        
        <div className="space-y-4">
          {topDocuments.map((doc, index) => (
            <div key={doc.name} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">📄</div>
                <div>
                  <div className="text-white font-medium">{doc.name}</div>
                  <div className="text-sm text-white/60">{doc.size}</div>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-white font-medium">{doc.views}</div>
                  <div className="text-white/60">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium">{doc.chats}</div>
                  <div className="text-white/60">Chats</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          <ClockIcon className="h-5 w-5 text-white/60" />
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center ${activity.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{activity.title}</div>
                  <div className="text-sm text-white/60">{activity.description}</div>
                </div>
                <div className="text-xs text-white/40">{activity.time}</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}