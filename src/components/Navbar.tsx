'use client';

import { MaybeSignedIn, MaybeSignedOut } from './MaybeSigned';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SignInTrigger, SignUpTrigger } from './AuthTriggers';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
            <span className="text-gray-900 font-bold text-xl">NeuroSpace</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Overview
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Plans
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <MaybeSignedOut>
              <SignInTrigger className="hidden sm:block text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors" />
              <SignUpTrigger className="rounded-full bg-black text-white px-6 py-2 font-medium text-sm transition-all duration-200 hover:bg-gray-800 shadow-sm hover:shadow-md" />
            </MaybeSignedOut>
            <MaybeSignedIn>
              <Link
                href="/notebook"
                className="rounded-full bg-black text-white px-6 py-2 font-medium text-sm transition-all duration-200 hover:bg-gray-800 shadow-sm hover:shadow-md"
              >
                Notebook
              </Link>
            </MaybeSignedIn>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
