import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to NeuroSpace</h1>
        <p className="text-purple-100 text-lg">
          Your AI-powered knowledge base is ready to help you learn and discover.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/dashboard/upload"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-600">0</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
          <p className="text-gray-600 text-sm">Upload and process your files</p>
        </Link>

        <Link
          href="/dashboard/chat"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-600">0</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversations</h3>
          <p className="text-gray-600 text-sm">Ask questions about your knowledge</p>
        </Link>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
          <p className="text-gray-600 text-sm">Your latest interactions</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge Score</h3>
          <p className="text-gray-600 text-sm">Your learning progress</p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Upload Your First Document</h3>
              <p className="text-gray-600 text-sm">
                Start by uploading a PDF, text file, or document to build your knowledge base.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Wait for Processing</h3>
              <p className="text-gray-600 text-sm">
                Our AI will extract text, generate embeddings, and make your content searchable.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Start Asking Questions</h3>
              <p className="text-gray-600 text-sm">
                Use the chat interface to ask questions about your uploaded documents.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Upload Your First Document
          </Link>
        </div>
      </div>
    </div>
  );
}
