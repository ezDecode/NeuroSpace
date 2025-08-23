'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  SparklesIcon,
  FolderIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'classnames';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Overview & analytics' },
  { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon, description: 'Manage your files' },
  { name: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, description: 'AI conversations' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, description: 'Usage insights' },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, description: 'Preferences' },
];

const quickActions = [
  { name: 'New Chat', href: '/dashboard/chat', icon: PlusIcon, color: 'bg-gradient-to-r from-blue-500 to-purple-600' },
  { name: 'Upload Files', href: '/dashboard/upload', icon: FolderIcon, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // Update document body class for layout adjustments
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      if (collapsed) {
        mainElement.classList.add('lg:ml-20');
        mainElement.classList.remove('lg:ml-72');
      } else {
        mainElement.classList.add('lg:ml-72');
        mainElement.classList.remove('lg:ml-20');
      }
    }
  }, [collapsed]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed left-0 top-0 z-40 h-full bg-black/95 backdrop-blur-xl border-r border-white/20 flex flex-col transition-all duration-300 transform',
          {
            'w-72': !collapsed,
            'w-20': collapsed,
            'translate-x-0': mobileOpen,
            '-translate-x-full lg:translate-x-0': !mobileOpen,
          }
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/20">
          <div className={clsx('flex items-center space-x-3 transition-opacity duration-300', { 'opacity-0': collapsed })}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">NeuroSpace</span>
              <div className="text-xs text-white/50">AI Knowledge Base</div>
            </div>
          </div>
          <button
            className="hidden lg:block p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 hover:scale-110"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Bars3Icon className="h-4 w-4" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-white/20">
          <div className={clsx('flex items-center space-x-3', { 'justify-center': collapsed })}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || 'User'} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-6 w-6 text-white" />
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
                </p>
              </div>
            )}
            {!collapsed && (
              <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300">
                <BellIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          {quickActions.map((action, index) => (
            <Link
              key={action.name}
              href={action.href}
              className={clsx(
                'flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg',
                action.color,
                { 'justify-center': collapsed }
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <action.icon className="h-4 w-4 text-white" />
              {!collapsed && <span className="text-sm font-medium text-white">{action.name}</span>}
            </Link>
          ))}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2">
          <div className="space-y-1">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden',
                    {
                      'bg-white text-black shadow-lg': isActive,
                      'text-white/70 hover:text-white hover:bg-white/10': !isActive,
                      'justify-center': collapsed,
                    }
                  )}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                  }}
                  title={collapsed ? item.name : undefined}
                >
                  {/* Active indicator */}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
                  )}
                  
                  <item.icon className={clsx(
                    'h-4 w-4 flex-shrink-0 transition-all duration-300',
                    {
                      'text-black': isActive,
                      'text-white/70 group-hover:text-white': !isActive,
                    }
                  )} />
                  
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <span className={clsx('transition-colors duration-300', {
                        'text-black': isActive,
                        'text-white/70 group-hover:text-white': !isActive,
                      })}>
                        {item.name}
                      </span>
                      <div className={clsx('text-xs transition-colors duration-300', {
                        'text-black/60': isActive,
                        'text-white/40 group-hover:text-white/60': !isActive,
                      })}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/20">
          {!collapsed && (
            <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="text-xs text-white/60 mb-1">Storage Used</div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="text-xs text-white/40">6.5 GB of 10 GB</div>
            </div>
          )}
          
          <Link
            href="/dashboard/upload"
            className={clsx(
              'flex items-center justify-center space-x-2 w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all duration-300 text-sm font-medium transform hover:scale-[1.02] hover:shadow-lg',
              { 'px-3': collapsed }
            )}
          >
            <PlusIcon className="h-4 w-4" />
            {!collapsed && <span>Upload Files</span>}
          </Link>
        </div>
      </div>
    </>
  );
}
