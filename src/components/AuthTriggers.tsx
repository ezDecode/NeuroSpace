'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function SignInTrigger({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!hasClerk) {
    return (
      <Link href="/sign-in" className={className}>
        {children ?? 'Sign in'}
      </Link>
    );
  }
  return (
    <SignInButton mode="modal">
      <button className={className}>{children ?? 'Sign in'}</button>
    </SignInButton>
  );
}

export function SignUpTrigger({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!hasClerk) {
    return (
      <Link href="/sign-up" className={className}>
        {children ?? 'Get started'}
      </Link>
    );
  }
  return (
    <SignUpButton mode="modal">
      <button className={className}>{children ?? 'Get started'}</button>
    </SignUpButton>
  );
}
