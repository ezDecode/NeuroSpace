import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export function UploadCta() {
	return (
		<div className="p-4 border-t border-gray-200">
			<Link
				href="/dashboard/upload"
				className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
			>
				<PlusIcon className="w-5 h-5 mr-2" />
				Upload Document
			</Link>
		</div>
	);
}