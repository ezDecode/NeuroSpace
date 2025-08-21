import clsx from 'classnames';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('text-center p-10 border border-dashed border-white/15 rounded-2xl', className)}>
      <h3 className="text-white font-semibold">{title}</h3>
      {description && <p className="text-white/70 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
