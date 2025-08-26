export const dynamic = 'force-dynamic';
import Sidebar from '@/components/Sidebar';
import ErrorBoundary from './ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 overflow-hidden transition-all duration-300 lg:ml-72">
        <div className="h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
