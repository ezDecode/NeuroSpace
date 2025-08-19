"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/sidebar/Logo";
import { NavItem } from "@/components/sidebar/NavItem";
import { UploadCta } from "@/components/sidebar/UploadCta";
import { HomeIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: HomeIcon },
	{ name: "Documents", href: "/dashboard/documents", icon: DocumentTextIcon },
	{ name: "Chat", href: "/dashboard/chat", icon: ChatBubbleLeftRightIcon },
	{ name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
	const pathname = usePathname();

	return (
		<div className="flex flex-col w-64 bg-white border-r border-gray-200">
			{/* Logo */}
			<div className="flex items-center h-16 px-6 border-b border-gray-200">
				<Logo />
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-4 py-6 space-y-2">
				{navigation.map(item => (
					<NavItem key={item.name} href={item.href} name={item.name} Icon={item.icon} active={pathname === item.href} />
				))}
			</nav>

			<UploadCta />
		</div>
	);
}