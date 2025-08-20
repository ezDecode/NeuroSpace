'use client';

import { motion } from 'framer-motion';
import clsx from 'classnames';
import Link from 'next/link';

type GlassButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export default function GlassButton({ children, href, onClick, className }: GlassButtonProps) {
  const base = clsx(
    'relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold',
    'backdrop-blur-xl bg-white/10 text-white',
    'border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.2)]',
    'transition-transform duration-300',
    'hover:scale-[1.03] active:scale-[0.98]',
  );

  const innerGlow = (
    <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-cyan-500/30 opacity-0 hover:opacity-100 transition-opacity" />
  );

  const content = (
    <motion.span
      initial={{ y: 2, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className={clsx(base, className)}>
        {innerGlow}
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={clsx(base, className)}>
      {innerGlow}
      {content}
    </button>
  );
}
