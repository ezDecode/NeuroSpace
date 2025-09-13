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
    <div className="relative min-h-screen overflow-x-clip bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col items-center justify-center px-6 sm:px-8 text-center py-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-6">
            Understand <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">anything</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed mb-12"
        >
          Your research and thinking partner, grounded in the information that you trust, built with the latest AI models.
        </motion.p>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full max-w-md"
        >
          <MaybeSignedOut>
            <SignUpTrigger className="w-full sm:w-auto relative inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium bg-white text-black border-0 transition-all duration-200 hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Try NeuroSpace
            </SignUpTrigger>
          </MaybeSignedOut>
          <MaybeSignedIn>
            <GlassButton href="/notebook" className="w-full sm:w-auto text-base px-8 py-4 bg-white text-black rounded-full hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">Open Notebook</GlassButton>
          </MaybeSignedIn>
        </motion.div>
      </section>

      {/* AI-Powered Research Partner Section */}
      <section className="relative mx-auto max-w-6xl px-6 sm:px-8 py-16">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your AI-powered research partner
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid gap-12 lg:grid-cols-2 items-center"
        >
          <div className="order-2 lg:order-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📤</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Upload your sources</h3>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Upload PDFs, websites, YouTube videos, audio files, Google Docs, or Google Slides, 
              and NeuroSpace will summarize them and make interesting connections between topics, 
              all powered by advanced AI understanding capabilities.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-lg">
              <div className="w-full h-64 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">📁</span>
                  </div>
                  <p className="text-gray-500">Drag & drop your files here</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Instant Insights Section */}
      <section className="relative mx-auto max-w-6xl px-6 sm:px-8 py-16">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="grid gap-12 lg:grid-cols-2 items-center"
        >
          <div className="order-1">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 shadow-lg">
              <div className="w-full h-64 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">🧠</span>
                  </div>
                  <p className="text-gray-500">AI analyzing your content...</p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Instant insights</h3>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              With all of your sources in place, NeuroSpace gets to work and becomes a personalized 
              AI expert in the information that matters most to you.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Source Citations Section */}
      <section className="relative mx-auto max-w-6xl px-6 sm:px-8 py-16">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="grid gap-12 lg:grid-cols-2 items-center"
        >
          <div className="order-2 lg:order-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">See the source, not just the answer</h3>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Gain confidence in every response because NeuroSpace provides clear citations for its work, 
              showing you the exact quotes from your sources.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-lg">
              <div className="w-full h-64 bg-white rounded-2xl shadow-sm p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                  <div className="text-xs text-blue-600 mt-2">Source: Document.pdf, Page 3</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How People Use Section */}
      <section className="relative mx-auto max-w-6xl px-6 sm:px-8 py-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How people are using NeuroSpace
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid gap-8 md:grid-cols-3"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Power study</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Upload lecture recordings, textbook chapters, and research papers. Ask NeuroSpace to explain 
              complex concepts in simple terms, provide real-world examples, and reinforce your understanding.
            </p>
            <p className="text-sm font-medium text-blue-600">Learn faster and deeper.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Organize your thinking</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Upload your source material and let NeuroSpace create a polished presentation outline, 
              complete with key talking points and supporting evidence.
            </p>
            <p className="text-sm font-medium text-green-600">Present with confidence.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Spark new ideas</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Upload brainstorming notes, market research, and competitor research. Ask NeuroSpace to 
              identify trends, generate new product ideas, and uncover hidden opportunities.
            </p>
            <p className="text-sm font-medium text-purple-600">Unlock your creative potential.</p>
          </div>
        </motion.div>
      </section>

      {/* Privacy Section */}
      <section className="relative mx-auto max-w-6xl px-6 sm:px-8 py-16">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-50 rounded-3xl p-8 lg:p-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">We value your privacy</h3>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We do not use your personal data to train NeuroSpace. NeuroSpace does not use your personal data, 
            including your source uploads, queries, and the responses from the model for training.
          </p>
        </motion.div>
      </section>

      {/* CTA Footer */}
      <section className="relative mx-auto max-w-6xl px-6 sm:px-8 pb-24">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 lg:p-16 text-center shadow-lg"
        >
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Smart Workspace Awaits
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the knowledge revolution. Start free, scale fast.
          </p>
          <div className="flex items-center justify-center">
            <MaybeSignedOut>
              <SignUpTrigger className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium bg-black text-white border-0 transition-all duration-200 hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Get started
              </SignUpTrigger>
            </MaybeSignedOut>
            <MaybeSignedIn>
              <GlassButton href="/notebook" className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">Go to Notebook</GlassButton>
            </MaybeSignedIn>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
