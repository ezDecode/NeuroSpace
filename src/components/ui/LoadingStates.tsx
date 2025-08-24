import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { componentClasses, designTokens, getCardClass, getButtonClass } from '@/lib/design-system';

// Loading Spinner Component
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`spinner ${sizeClasses[size]} ${className}`} />
  );
}

// Page Loading State
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-white/60">{message}</p>
    </div>
  );
}

// Skeleton Loading Component
export function Skeleton({ className = '', ...props }: { className?: string, [key: string]: any }) {
  return (
    <div 
      className={`animate-pulse bg-white/10 rounded ${className}`}
      {...props}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className={getCardClass()}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// Grid Skeleton
export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={componentClasses.layout.gridStats}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Error State Component
export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'An error occurred while loading the content.',
  onRetry,
  showRetry = true 
}: { 
  title?: string, 
  message?: string, 
  onRetry?: () => void,
  showRetry?: boolean 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center"
    >
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
      </div>
      <div className="space-y-2">
        <h3 className={designTokens.typography.h3}>{title}</h3>
        <p className="text-white/60 max-w-md">{message}</p>
      </div>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className={getButtonClass('secondary')}
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Try Again
        </button>
      )}
    </motion.div>
  );
}

// Success State Component
export function SuccessState({ 
  title = 'Success!', 
  message = 'Operation completed successfully.',
  icon = CheckCircleIcon 
}: { 
  title?: string, 
  message?: string,
  icon?: any 
}) {
  const Icon = icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center"
    >
      <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
        <Icon className="h-8 w-8 text-green-400" />
      </div>
      <div className="space-y-2">
        <h3 className={designTokens.typography.h3}>{title}</h3>
        <p className="text-white/60 max-w-md">{message}</p>
      </div>
    </motion.div>
  );
}

// Empty State Component
export function EmptyState({ 
  title = 'No data found', 
  message = 'There are no items to display.',
  icon = InformationCircleIcon,
  action 
}: { 
  title?: string, 
  message?: string,
  icon?: any,
  action?: React.ReactNode 
}) {
  const Icon = icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center"
    >
      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
        <Icon className="h-8 w-8 text-white/40" />
      </div>
      <div className="space-y-2">
        <h3 className={designTokens.typography.h3}>{title}</h3>
        <p className="text-white/60 max-w-md">{message}</p>
      </div>
      {action && (
        <div className="pt-4">
          {action}
        </div>
      )}
    </motion.div>
  );
}

// Progress Bar Component
export function ProgressBar({ 
  progress, 
  label, 
  showPercentage = true 
}: { 
  progress: number, 
  label?: string,
  showPercentage?: boolean 
}) {
  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-white/60">{label}</span>}
          {showPercentage && <span className="text-white/60">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="w-full bg-white/10 rounded-full h-2">
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Status Badge Component
export function StatusBadge({ 
  status, 
  children 
}: { 
  status: 'success' | 'warning' | 'error' | 'info',
  children: React.ReactNode 
}) {
  const badgeClasses = {
    success: componentClasses.badge.success,
    warning: componentClasses.badge.warning,
    error: componentClasses.badge.error,
    info: componentClasses.badge.info
  };

  return (
    <span className={badgeClasses[status]}>
      {children}
    </span>
  );
}