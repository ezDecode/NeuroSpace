'use client';

import { motion } from 'framer-motion';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

type TestimonialsProps = {
  items: Testimonial[];
};

export default function Testimonials({ items }: TestimonialsProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, idx) => (
          <motion.figure
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="rounded-xl border border-white/20 bg-white/5 p-6 sm:p-8"
          >
            <blockquote className="text-white/80 leading-relaxed text-base sm:text-lg">"{t.quote}"</blockquote>
            <figcaption className="mt-4 text-sm sm:text-base text-white/60">
              <span className="font-semibold text-white">{t.author}</span> — {t.role}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}
