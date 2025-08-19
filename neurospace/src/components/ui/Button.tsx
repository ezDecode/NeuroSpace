import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
	const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-all';
	const styles = {
		primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600',
		secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
		ghost: 'bg-transparent text-gray-700 hover:bg-gray-50',
	}[variant];
	return <button className={`${base} ${styles} ${className}`} {...props} />;
}