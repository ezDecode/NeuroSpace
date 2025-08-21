'use client';

import { motion } from 'framer-motion';
import clsx from 'classnames';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: string;
  className?: string;
};

export default function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={clsx(
        'group relative overflow-hidden rounded-xl p-6 sm:p-8',
        'bg-white/5 border border-white/20',
        'transition-all duration-300 hover:bg-white/10',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="h-16 w-16 sm:h-20 sm:w-20 grid place-items-center rounded-xl bg-white/10 border border-white/20 text-white text-3xl sm:text-4xl">
          {icon}
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{title}</h3>
        <p className="text-base sm:text-lg text-white/70 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
