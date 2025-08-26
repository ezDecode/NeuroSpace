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
import { componentClasses, designTokens, getCardClass, getButtonClass } from '@/lib/design-system';

// Safe hook to handle cases when Clerk is not configured
function useSafeUser() {
  try {
    return useUser();
  } catch (error) {
    // If Clerk is not properly configured, return null user
    console.warn('Clerk not configured, using fallback user state');
    return { user: null, isLoaded: true, isSignedIn: false };
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Overview' },
  { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon, description: 'Manage your files' },
  { name: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, description: 'AI conversations' },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, description: 'Preferences' },
];

const quickActions = [
  { name: 'New Chat', href: '/dashboard/chat', icon: PlusIcon },
  { name: 'Upload Files', href: '/dashboard/upload', icon: FolderIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSafeUser();

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
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-gray-900/80 border border-gray-600 text-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed left-0 top-0 z-40 h-full bg-gray-900/95 backdrop-blur-xl border-r border-gray-700 flex flex-col transition-all duration-300 transform',
          {
            'w-72': !collapsed,
            'w-20': collapsed,
            'translate-x-0': mobileOpen,
            '-translate-x-full lg:translate-x-0': !mobileOpen,
          }
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
          <div className={clsx('flex items-center space-x-3 transition-opacity duration-300', { 'opacity-0': collapsed })}>
            <div className={componentClasses.icon.small}>
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">NeuroSpace</span>
              <div className="text-xs text-gray-400">AI Knowledge Base</div>
            </div>
          </div>
          <button
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Bars3Icon className="h-4 w-4" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-700">
          <div className={clsx('flex items-center space-x-3', { 'justify-center': collapsed })}>
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || 'User'} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
                </p>
              </div>
            )}
            {!collapsed && (
              <button className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all duration-300">
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
                'flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-white/10 bg-gray-800 border border-gray-600',
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
                    'group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 relative overflow-hidden',
                    {
                      'bg-white text-black shadow-lg': isActive,
                      'text-gray-300 hover:text-white hover:bg-gray-800': !isActive,
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
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                  
                  <item.icon className={clsx(
                    'h-4 w-4 flex-shrink-0 transition-all duration-300',
                    {
                      'text-black': isActive,
                      'text-gray-400 group-hover:text-white': !isActive,
                    }
                  )} />
                  
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <span className={clsx('transition-colors duration-300', {
                        'text-black': isActive,
                        'text-gray-300 group-hover:text-white': !isActive,
                      })}>
                        {item.name}
                      </span>
                      <div className={clsx('text-xs transition-colors duration-300', {
                        'text-black/60': isActive,
                        'text-gray-500 group-hover:text-gray-400': !isActive,
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
        <div className="p-4 border-t border-gray-700">
          
          <Link
            href="/dashboard/upload"
            className={clsx(
              'flex items-center justify-center space-x-2 w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 transition-all duration-300 text-sm font-medium transform hover:scale-105 hover:shadow-lg',
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
