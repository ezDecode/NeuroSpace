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
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
            <span className="text-white font-semibold">NeuroSpace</span>
          </Link>
          <div className="flex items-center gap-2">
            <MaybeSignedOut>
              <SignInTrigger className="text-white/80 hover:text-white px-3 py-2" />
              <SignUpTrigger className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-white font-medium shadow hover:from-indigo-600 hover:to-fuchsia-600 transition-colors" />
            </MaybeSignedOut>
            <MaybeSignedIn>
              <Link
                href="/dashboard"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-white font-medium shadow hover:from-indigo-600 hover:to-fuchsia-600 transition-colors"
              >
                Dashboard
              </Link>
            </MaybeSignedIn>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
