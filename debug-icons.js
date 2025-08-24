// Debug script to check if all icons are properly imported
const icons = {
  DocumentTextIcon: require('@heroicons/react/24/outline').DocumentTextIcon,
  ChatBubbleLeftRightIcon: require('@heroicons/react/24/outline').ChatBubbleLeftRightIcon,
  Cog6ToothIcon: require('@heroicons/react/24/outline').Cog6ToothIcon,
  PlusIcon: require('@heroicons/react/24/outline').PlusIcon,
  FolderIcon: require('@heroicons/react/24/outline').FolderIcon,
  ChartBarIcon: require('@heroicons/react/24/outline').ChartBarIcon,
  ClockIcon: require('@heroicons/react/24/outline').ClockIcon,
  SparklesIcon: require('@heroicons/react/24/outline').SparklesIcon,
  ArrowUpIcon: require('@heroicons/react/24/outline').ArrowUpIcon,
  UsersIcon: require('@heroicons/react/24/outline').UsersIcon,
  DocumentMagnifyingGlassIcon: require('@heroicons/react/24/outline').DocumentMagnifyingGlassIcon,
  CpuChipIcon: require('@heroicons/react/24/outline').CpuChipIcon
};

console.log('Icon check results:');
for (const [name, icon] of Object.entries(icons)) {
  console.log(`${name}: ${icon ? 'OK' : 'UNDEFINED'}`);
}
