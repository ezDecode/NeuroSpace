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
      className="sticky top-0 z-50 w-full"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/5 backdrop-blur-xl px-4 py-3 sm:py-2 shadow-lg">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white" />
            <span className="text-white font-bold text-lg sm:text-xl">NeuroSpace</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <MaybeSignedOut>
              <SignInTrigger className="hidden sm:block text-white/80 hover:text-white px-3 py-2 text-base" />
              <SignUpTrigger className="rounded-xl bg-white text-black px-4 py-2 sm:px-6 sm:py-3 font-semibold text-sm sm:text-base transition-colors hover:bg-gray-100" />
            </MaybeSignedOut>
            <MaybeSignedIn>
              <Link
                href="/notebook"
                className="rounded-xl bg-white text-black px-4 py-2 sm:px-6 sm:py-3 font-semibold text-sm sm:text-base transition-colors hover:bg-gray-100"
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
