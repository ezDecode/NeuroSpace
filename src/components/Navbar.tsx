'use client';

import { SearchBar } from '@/components/navbar/SearchBar';
import { RightActions } from '@/components/navbar/RightActions';

export default function Navbar() {
  return (
    <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <SearchBar />
      <RightActions />
    </div>
  );
}
