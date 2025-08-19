'use client';

import { motion } from 'framer-motion';
import clsx from 'classnames';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
};

export default function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={clsx(
        'group relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-b from-white/10 to-white/5 border border-white/15',
        'backdrop-blur-xl',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-cyan-500/10" />
      <div className="relative z-10 flex flex-col gap-3">
        <div className="h-12 w-12 grid place-items-center rounded-xl bg-white/10 border border-white/20 text-white">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
