import { UserButton } from '@clerk/nextjs';
import { BellIcon } from '@heroicons/react/24/outline';

export function RightActions() {
  return (
    <div className="flex items-center space-x-4">
      <button
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
      </button>
      <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
    </div>
  );
}
