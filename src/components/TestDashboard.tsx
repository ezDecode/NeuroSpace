'use client';

import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  SparklesIcon,
  PlusIcon,
  FolderIcon,
  ChartBarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { componentClasses, designTokens, getCardClass, getButtonClass } from '@/lib/design-system';

// Test with minimal data
const testStats = [
  {
    title: 'Test Stat',
    icon: DocumentTextIcon,
  }
];

export default function TestDashboard() {
  return (
    <div className={componentClasses.layout.page}>
      <h1 className={designTokens.typography.h1}>Test Dashboard</h1>
      
      <div className={componentClasses.layout.gridStats}>
        {testStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={getCardClass(true)}>
              <IconComponent className="h-6 w-6 text-white" />
              <div>{stat.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
