'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Custom styled button component
const StyledButton = ({ 
  children, 
  className, 
  onClick, 
  disabled = false 
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </motion.button>
);

export function SignInTrigger({
  children,
  className,
  variant = 'default'
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}) {
  const baseClasses = "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700";
  const outlineClasses = "bg-transparent border border-white/20 text-white hover:bg-white/10";
  const ghostClasses = "bg-white/10 text-white hover:bg-white/20";

  const getClasses = () => {
    switch (variant) {
      case 'outline':
        return outlineClasses;
      case 'ghost':
        return ghostClasses;
      default:
        return baseClasses;
    }
  };

  if (!hasClerk) {
    return (
      <Link href="/sign-in" className={className}>
        <StyledButton className={getClasses()}>
          {children ?? 'Sign in'}
        </StyledButton>
      </Link>
    );
  }

  return (
    <SignInButton mode="modal">
      <StyledButton className={`${getClasses()} ${className}`}>
        {children ?? 'Sign in'}
      </StyledButton>
    </SignInButton>
  );
}

export function SignUpTrigger({
  children,
  className,
  variant = 'default'
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}) {
  const baseClasses = "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700";
  const outlineClasses = "bg-transparent border border-white/20 text-white hover:bg-white/10";
  const ghostClasses = "bg-white/10 text-white hover:bg-white/20";

  const getClasses = () => {
    switch (variant) {
      case 'outline':
        return outlineClasses;
      case 'ghost':
        return ghostClasses;
      default:
        return baseClasses;
    }
  };

  if (!hasClerk) {
    return (
      <Link href="/sign-up" className={className}>
        <StyledButton className={getClasses()}>
          {children ?? 'Get started'}
        </StyledButton>
      </Link>
    );
  }

  return (
    <SignUpButton mode="modal">
      <StyledButton className={`${getClasses()} ${className}`}>
        {children ?? 'Get started'}
      </StyledButton>
    </SignUpButton>
  );
}

// Enhanced auth modal wrapper for custom styling
export function AuthModalWrapper({ 
  children, 
  title, 
  subtitle 
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md p-8 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl"
      >
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>}
            {subtitle && <p className="text-white/60">{subtitle}</p>}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
