// Test file to isolate the issue
import React from 'react';
import { 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  PlusIcon,
  FolderIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  ArrowUpIcon,
  UsersIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// Test arrays to check for undefined components
const stats = [
  {
    icon: DocumentTextIcon,
  },
  {
    icon: ChatBubbleLeftRightIcon,
  },
  {
    icon: FolderIcon,
  },
  {
    icon: CpuChipIcon,
  }
];

const recentActivity = [
  {
    icon: DocumentTextIcon,
  },
  {
    icon: ChatBubbleLeftRightIcon,
  },
  {
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    icon: ChatBubbleLeftRightIcon,
  }
];

const quickActions = [
  {
    icon: PlusIcon,
  },
  {
    icon: ChatBubbleLeftRightIcon,
  },
  {
    icon: DocumentTextIcon,
  },
  {
    icon: ChartBarIcon,
  }
];

console.log('Testing dynamic icon references...');

// Test stats array
stats.forEach((stat, index) => {
  console.log(`stat[${index}].icon:`, stat.icon ? 'OK' : 'UNDEFINED');
});

// Test recentActivity array
recentActivity.forEach((activity, index) => {
  console.log(`activity[${index}].icon:`, activity.icon ? 'OK' : 'UNDEFINED');
});

// Test quickActions array
quickActions.forEach((action, index) => {
  console.log(`action[${index}].icon:`, action.icon ? 'OK' : 'UNDEFINED');
});
