'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'classnames';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon },
  { name: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-black border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed left-0 top-0 z-40 h-full bg-black border-r border-white/20 flex flex-col transition-all duration-300 transform',
          {
            'w-64': !collapsed,
            'w-16': collapsed,
            'translate-x-0': mobileOpen,
            '-translate-x-full lg:translate-x-0': !mobileOpen,
          }
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className={clsx('flex items-center space-x-2 transition-opacity duration-300', { 'opacity-0': collapsed })}>
            <div className="w-8 h-8 bg-white rounded-lg transition-transform duration-300 hover:scale-110" />
            <span className="text-lg font-semibold text-white">NeuroSpace</span>
          </div>
          <button
            className="hidden lg:block p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 hover:scale-110"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Bars3Icon className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 mb-4 mt-4">
          <Link
            href="/dashboard/chat"
            className={clsx(
              'flex items-center justify-center space-x-2 w-full p-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg',
              { 'px-3': collapsed }
            )}
          >
            <PlusIcon className="h-4 w-4" />
            {!collapsed && <span className="text-sm font-medium">New chat</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <div className="space-y-1">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02]',
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
                  <item.icon className="h-4 w-4 flex-shrink-0 transition-transform duration-300 hover:scale-110" />
                  {!collapsed && <span className="transition-opacity duration-300">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Upload CTA */}
        <div className="p-3 border-t border-white/10">
          <Link
            href="/dashboard/upload"
            className={clsx(
              'flex items-center justify-center space-x-2 w-full p-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all duration-300 text-sm font-medium transform hover:scale-[1.02] hover:shadow-lg',
              { 'px-3': collapsed }
            )}
          >
            <PlusIcon className="h-4 w-4" />
            {!collapsed && <span>Upload</span>}
          </Link>
        </div>
      </div>
    </>
  );
}
