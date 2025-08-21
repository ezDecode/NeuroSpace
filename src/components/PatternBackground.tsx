'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import clsx from 'classnames';

type PatternBackgroundProps = {
  className?: string;
};

export default function PatternBackground({ className }: PatternBackgroundProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const translateYSlow = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const translateYFast = useTransform(scrollYProgress, [0, 1], [0, -160]);

  return (
    <div ref={ref} className={clsx('absolute inset-0 overflow-hidden', className)} aria-hidden>
      {/* Gradient backwash */}
      <motion.div
        style={{ y: translateYSlow }}
        className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_10%,theme(colors.purple.700/.35)_0%,transparent_60%),radial-gradient(900px_500px_at_80%_0%,theme(colors.indigo.600/.25)_0%,transparent_60%),radial-gradient(1200px_600px_at_50%_90%,theme(colors.cyan.600/.20)_0%,transparent_60%)]"
      />

      {/* PatternCraft-like grid */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          y: translateYFast,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px, 64px 64px',
          backgroundPosition: '0 0, 0 0',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

      {/* Top shine */}
      <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-white/10 to-transparent blur-2xl" />
    </div>
  );
}
