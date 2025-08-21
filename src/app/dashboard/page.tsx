export const dynamic = 'force-dynamic';
import { DocumentTextIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8 text-center">
      {/* Main heading */}
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-normal text-white transition-all duration-500 hover:scale-[1.02]">
          What can I help with?
        </h1>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Link
          href="/dashboard/upload"
          className="group p-6 rounded-2xl border border-white/20 bg-black hover:bg-white hover:text-black transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10"
        >
          <div className="flex items-start space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-white/70 group-hover:text-black/70 mt-1 flex-shrink-0 transition-colors duration-300" />
            <div>
              <h3 className="text-white group-hover:text-black font-medium mb-1 transition-colors duration-300">Upload documents</h3>
              <p className="text-white/60 group-hover:text-black/60 text-sm leading-relaxed transition-colors duration-300">
                Upload PDFs, documents, and text files to build your knowledge base
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/chat"
          className="group p-6 rounded-2xl border border-white/20 bg-black hover:bg-white hover:text-black transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10"
        >
          <div className="flex items-start space-x-3">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white/70 group-hover:text-black/70 mt-1 flex-shrink-0 transition-colors duration-300" />
            <div>
              <h3 className="text-white group-hover:text-black font-medium mb-1 transition-colors duration-300">Start conversation</h3>
              <p className="text-white/60 group-hover:text-black/60 text-sm leading-relaxed transition-colors duration-300">
                Chat with your documents and get instant answers
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/documents"
          className="group p-6 rounded-2xl border border-white/20 bg-black hover:bg-white hover:text-black transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10"
        >
          <div className="flex items-start space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-white/70 group-hover:text-black/70 mt-1 flex-shrink-0 transition-colors duration-300" />
            <div>
              <h3 className="text-white group-hover:text-black font-medium mb-1 transition-colors duration-300">Browse documents</h3>
              <p className="text-white/60 group-hover:text-black/60 text-sm leading-relaxed transition-colors duration-300">
                View and manage your uploaded documents
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/settings"
          className="group p-6 rounded-2xl border border-white/20 bg-black hover:bg-white hover:text-black transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10"
        >
          <div className="flex items-start space-x-3">
            <Cog6ToothIcon className="h-6 w-6 text-white/70 group-hover:text-black/70 mt-1 flex-shrink-0 transition-colors duration-300" />
            <div>
              <h3 className="text-white group-hover:text-black font-medium mb-1 transition-colors duration-300">Settings</h3>
              <p className="text-white/60 group-hover:text-black/60 text-sm leading-relaxed transition-colors duration-300">
                Configure your preferences and account settings
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom text */}
      <div className="text-white/40 text-sm hover:text-white/60 transition-colors duration-300 cursor-default">
        NeuroSpace can make mistakes. Check important info.
      </div>
    </div>
  );
}
