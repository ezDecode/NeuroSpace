'use client';

import { motion } from 'framer-motion';

type Step = {
  title: string;
  description: string;
};

type TimelineProps = {
  steps: Step[];
};

export default function Timeline({ steps }: TimelineProps) {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent md:left-1/2" />

      <ul className="space-y-12 md:space-y-16">
        {steps.map((step, index) => (
          <li key={index} className="relative grid md:grid-cols-2 items-start gap-6">
            <div className="hidden md:block" />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="absolute -left-3 top-8 h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 border border-white/30 shadow" />
              <h4 className="text-lg font-semibold text-white">{step.title}</h4>
              <p className="mt-2 text-white/70 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          </li>
        ))}
      </ul>
    </div>
  );
}
