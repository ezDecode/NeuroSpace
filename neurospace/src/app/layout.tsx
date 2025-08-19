import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuroSpace - AI-Powered Personal Knowledge Base",
  description: "Your AI-powered second brain for document storage and intelligent search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-slate-100`}> 
          <div className="min-h-screen/ grid">
            {children}
          </div>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
