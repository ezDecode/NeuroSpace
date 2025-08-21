import clsx from 'classnames';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-xl bg-white/10', className)} />;
}

export default Skeleton;
