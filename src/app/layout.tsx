import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MaybeClerkProvider from '../components/MaybeClerkProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuroSpace - AI-Powered Personal Knowledge Base',
  description: 'Your AI-powered second brain for document storage and intelligent search',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Avoid static prerender hard failures if Clerk is not configured
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _dynamic = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? undefined : 'force-dynamic';
  return (
    <MaybeClerkProvider>
      <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
        <body className={`${inter.className} min-h-screen bg-white text-gray-900 antialiased`}>
          <div className="grid">{children}</div>
          <Toaster position="top-right" />
        </body>
      </html>
    </MaybeClerkProvider>
  );
}
