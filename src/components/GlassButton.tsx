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
    'relative inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold',
    'bg-white/10 text-white',
    'border border-white/20',
    'transition-all duration-200',
    'hover:bg-white/20',
    className,
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
      <Link href={href} className={base}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={base}>
      {content}
    </button>
  );
}
