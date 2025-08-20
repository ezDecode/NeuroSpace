'use client';

import { MaybeSignedIn, MaybeSignedOut } from '../components/MaybeSigned';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import PatternBackground from '../components/PatternBackground';
import GlassButton from '../components/GlassButton';
import { SignUpTrigger } from '../components/AuthTriggers';
import FeatureCard from '../components/FeatureCard';
import Timeline from '../components/Timeline';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#07080B] text-slate-100">
      <PatternBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-5xl text-5xl md:text-7xl font-semibold tracking-tight"
        >
          Elevate your
          <span className="block bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
            second brain
          </span>
          with NeuroSpace
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 max-w-3xl text-lg text-white/70"
        >
          Upload, organize, and ask. NeuroSpace turns your documents into living knowledge with
          lightning-fast, secure AI retrieval.
        </motion.p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MaybeSignedOut>
            <SignUpTrigger className="relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold backdrop-blur-xl bg-white/10 text-white border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]">
              Start for free
            </SignUpTrigger>
          </MaybeSignedOut>
          <MaybeSignedIn>
            <GlassButton href="/dashboard">Open dashboard</GlassButton>
          </MaybeSignedIn>
          <GlassButton href="#how" className="bg-white/5">
            How it works
          </GlassButton>
        </div>

        {/* Subtle stats strip */}
        <div className="mt-14 grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['95%+', 'Answer accuracy'],
            ['10x', 'Faster search'],
            ['AES-256', 'Data at rest'],
            ['Zero-trust', 'Access control'],
          ].map(([stat, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl text-center"
            >
              <div className="text-xl font-semibold text-white">{stat}</div>
              <div className="text-xs text-white/60">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-5xl font-semibold">
            Everything you need, beautifully crafted
          </h2>
          <p className="mt-4 text-white/70">
            Premium, minimal components powered by secure AI infrastructure.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Smart Upload"
            description="Drag & drop any file. We parse, chunk, and embed with precision for best-in-class retrieval."
            icon={<span className="text-2xl">📤</span>}
          />
          <FeatureCard
            title="AI Search"
            description="Ask in natural language. Receive grounded, concise answers with citations and traceability."
            icon={<span className="text-2xl">🔎</span>}
          />
          <FeatureCard
            title="Secure Storage"
            description="Enterprise-grade encryption and access controls. Your knowledge, only yours."
            icon={<span className="text-2xl">🔐</span>}
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-5xl font-semibold">How it works</h2>
          <p className="mt-4 text-white/70">
            Three simple steps to supercharge your knowledge workflow.
          </p>
        </div>
        <div className="mt-12">
          <Timeline
            steps={[
              {
                title: 'Upload',
                description:
                  'Drop in PDFs, docs, and notes. We securely ingest and structure your data.',
              },
              {
                title: 'Index',
                description:
                  'We embed content with state-of-the-art models for accurate semantic retrieval.',
              },
              {
                title: 'Ask',
                description:
                  'Query in natural language. Get answers, citations, and actions instantly.',
              },
            ]}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-5xl font-semibold">Loved by teams and creators</h2>
          <p className="mt-4 text-white/70">What our users say after switching to NeuroSpace.</p>
        </div>
        <div className="mt-12">
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
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_200px_at_50%_-20%,theme(colors.fuchsia.500/.25)_0%,transparent_60%)]" />
          <h3 className="relative text-2xl md:text-4xl font-semibold">
            Build your second brain today
          </h3>
          <p className="relative mt-3 text-white/70">
            Join teams moving knowledge forward with confidence.
          </p>
          <div className="relative mt-6 flex items-center justify-center gap-3">
            <MaybeSignedOut>
              <SignUpTrigger className="relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold backdrop-blur-xl bg-white/10 text-white border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]">
                Get started
              </SignUpTrigger>
            </MaybeSignedOut>
            <MaybeSignedIn>
              <GlassButton href="/dashboard">Go to dashboard</GlassButton>
            </MaybeSignedIn>
          </div>
        </div>
      </section>
    </div>
  );
}
