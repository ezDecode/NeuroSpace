import cls from 'classnames';

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'green' | 'yellow' | 'red' | 'gray' }) {
	const colorMap = {
		green: 'bg-green-100 text-green-700 border-green-200',
		yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		red: 'bg-red-100 text-red-700 border-red-200',
		gray: 'bg-gray-100 text-gray-700 border-gray-200',
	};
	return (
		<span className={cls('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', colorMap[color])}>
			{children}
		</span>
	);
}