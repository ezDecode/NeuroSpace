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
      <div className="absolute left-4 top-0 bottom-0 w-px bg-white/20 sm:left-1/2" />

      <ul className="space-y-12 sm:space-y-16">
        {steps.map((step, index) => (
          <li key={index} className="relative grid sm:grid-cols-2 items-start gap-6">
            <div className="hidden sm:block" />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative rounded-xl border border-white/20 bg-white/5 p-6 sm:p-8"
            >
              <div className="absolute -left-4 top-8 h-8 w-8 rounded-full bg-white border-4 border-black sm:-left-3 sm:h-6 sm:w-6" />
              <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{step.title}</h4>
              <p className="mt-3 text-white/70 text-base sm:text-lg leading-relaxed">{step.description}</p>
            </motion.div>
          </li>
        ))}
      </ul>
    </div>
  );
}
