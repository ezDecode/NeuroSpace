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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((t, idx) => (
          <motion.figure
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl"
          >
            <blockquote className="text-white/80 leading-relaxed">“{t.quote}”</blockquote>
            <figcaption className="mt-4 text-sm text-white/60">
              <span className="font-medium text-white">{t.author}</span> — {t.role}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}
