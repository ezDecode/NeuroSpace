import Link from 'next/link';

export function NavItem({ href, name, Icon, active }: { href: string; name: string; Icon: any; active: boolean; }) {
	return (
		<Link
			href={href}
			className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
				active ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
			}`}
		>
			<Icon className="w-5 h-5 mr-3" />
			{name}
		</Link>
	);
}