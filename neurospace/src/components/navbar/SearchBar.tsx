import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function SearchBar() {
	return (
		<div className="flex-1 max-w-lg">
			<div className="relative">
				<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
				<input
					type="text"
					placeholder="Search your knowledge base..."
					className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
				/>
			</div>
		</div>
	);
}