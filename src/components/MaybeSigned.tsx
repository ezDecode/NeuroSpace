'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function MaybeSignedIn({ children }: { children: React.ReactNode }) {
  if (!hasClerk) return null;
  return <SignedIn>{children}</SignedIn>;
}

export function MaybeSignedOut({ children }: { children: React.ReactNode }) {
  if (!hasClerk) return <>{children}</>;
  return <SignedOut>{children}</SignedOut>;
}
