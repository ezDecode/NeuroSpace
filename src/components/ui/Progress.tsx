import clsx from 'classnames';

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  return (
    <div className={clsx('w-full h-2 rounded-full bg-white/10 overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default Progress;
