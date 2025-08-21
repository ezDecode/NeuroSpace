import clsx from 'classnames';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none',
        'focus:ring-2 focus:ring-fuchsia-500/40 focus:border-white/20',
        className,
      )}
      {...props}
    />
  );
}

export default Input;
