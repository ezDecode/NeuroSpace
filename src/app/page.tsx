'use client';

import { MaybeSignedIn, MaybeSignedOut } from '../components/MaybeSigned';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassButton from '../components/GlassButton';
import { SignUpTrigger } from '../components/AuthTriggers';
import FeatureCard from '../components/FeatureCard';
import Timeline from '../components/Timeline';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#07080B] text-slate-100">
      <Navbar />

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 sm:px-6 text-center">
        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-7xl text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-none"
        >
          Know Everything, Find Anything
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 max-w-7xl text-xl sm:text-2xl md:text-3xl text-white/80 leading-relaxed"
        >
          AI that reads your docs, remembers everything, answers instantly.
        </motion.p>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row w-full max-w-7xl"
        >
          <MaybeSignedOut>
            <SignUpTrigger className="w-full sm:w-auto relative inline-flex items-center justify-center rounded-xl px-10 py-4 text-lg sm:text-xl font-semibold bg-white text-black border-0 transition-all duration-200 hover:bg-gray-100 min-h-[56px]">
              Start for free
            </SignUpTrigger>
          </MaybeSignedOut>
          <MaybeSignedIn>
            <GlassButton href="/dashboard" className="w-full sm:w-auto text-lg sm:text-xl px-10 py-4 min-h-[56px]">Open dashboard</GlassButton>
          </MaybeSignedIn>
          <GlassButton href="#how" className="w-full sm:w-auto bg-transparent border border-white/20 text-white hover:bg-white/5 text-lg sm:text-xl px-10 py-4 min-h-[56px]">
            How it works
          </GlassButton>
        </motion.div>

        {/* Subtle stats strip */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            ['95%+', 'Answer accuracy'],
            ['10x', 'Faster search'],
            ['AES-256', 'Data at rest'],
            ['Zero-trust', 'Access control'],
          ].map(([stat, label]) => (
            <div
              key={label}
              className="rounded-xl border border-white/20 bg-white/5 p-6 sm:p-8 text-center"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stat}</div>
              <div className="text-base sm:text-lg text-white/60 mt-2">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-32">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Built for Speed, Built to Scale
          </h2>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-white/70 leading-relaxed max-w-5xl mx-auto">
            Enterprise AI that works at the speed of thought.
          </p>
        </motion.div>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
        >
          <FeatureCard
            title="Upload & Forget"
            description="Drop files. We handle the rest. Instant AI-powered organization."
            icon="📤"
          />
          <FeatureCard
            title="Ask Anything"
            description="Natural questions. Perfect answers. With proof and sources."
            icon="🔎"
          />
          <FeatureCard
            title="Bank-Level Security"
            description="Military-grade encryption. Your data stays yours, period."
            icon="🔐"
          />
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-32">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">Three Steps to Smart</h2>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-white/70 leading-relaxed max-w-5xl mx-auto">
            From chaos to clarity in minutes, not months.
          </p>
        </motion.div>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-7xl mx-auto"
        >
          <Timeline
            steps={[
              {
                title: 'Upload',
                description:
                  'Drag, drop, done. We instantly structure your content.',
              },
              {
                title: 'Process',
                description:
                  'AI reads everything. Creates smart connections. Ready to search.',
              },
              {
                title: 'Ask',
                description:
                  'Type your question. Get instant answers with sources.',
              },
            ]}
          />
        </motion.div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-32">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">Trusted by Winners</h2>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-white/70 leading-relaxed max-w-5xl mx-auto">Real results from teams who switched to NeuroSpace.</p>
        </motion.div>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-7xl mx-auto"
        >
          <Testimonials
            items={[
              {
                quote:
                  'NeuroSpace turned our scattered docs into a single source of truth. Search speed is unreal.',
                author: 'Maya R.',
                role: 'Head of Ops, Series A SaaS',
              },
              {
                quote:
                  'I ask one question and get exactly what I need with citations. It feels magical.',
                author: 'Alex P.',
                role: 'Founder & Researcher',
              },
              {
                quote:
                  'Setup took minutes. The experience feels premium and thoughtfully designed.',
                author: 'Jordan T.',
                role: 'Design Lead',
              },
            ]}
          />
        </motion.div>
      </section>

      {/* CTA Footer */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-8 sm:p-12 lg:p-16 text-center max-w-7xl mx-auto"
        >
          <h3 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Your Smart Workspace Awaits
          </h3>
          <p className="relative mt-4 text-lg sm:text-xl md:text-2xl text-white/70 leading-relaxed max-w-4xl mx-auto">
            Join the knowledge revolution. Start free, scale fast.
          </p>
          <div className="relative mt-8 flex items-center justify-center gap-6">
            <MaybeSignedOut>
              <SignUpTrigger className="w-full sm:w-auto relative inline-flex items-center justify-center rounded-xl px-10 py-4 text-lg sm:text-xl font-semibold bg-white text-black border-0 transition-all duration-200 hover:bg-gray-100 min-h-[56px] max-w-xs">
                Get started
              </SignUpTrigger>
            </MaybeSignedOut>
            <MaybeSignedIn>
              <GlassButton href="/dashboard" className="w-full sm:w-auto text-lg sm:text-xl px-10 py-4 min-h-[56px]">Go to dashboard</GlassButton>
            </MaybeSignedIn>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
