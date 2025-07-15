'use client';

import { motion } from 'framer-motion';
import { Brain, Users, Zap, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            About AI Newsletter
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            We're on a mission to democratize access to the latest AI research, breakthroughs, and industry insights.
          </p>
        </motion.div>

        {/* About Me */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            About Me
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Hey, I’m Siddhanta 👋<br/>
            I built this newsletter because AI moves fast—and staying updated shouldn’t feel like a full-time job or a hype-fest.<br/>
            <br/>
            Whether you’re a builder, a browser, or just AI-curious, this space is for you. I filter out the noise and deliver the best of AI—tools, research, product launches, weird experiments—in a way that’s easy to follow and actually fun to read.<br/>
            <br/>
            No jargon. No hype. Just the good stuff. 🎯
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Let’s be honest—the AI world is kinda overwhelming right now. New models. Wild demos. Billion-dollar funding rounds. It’s a lot.<br/>
            <br/>
            My mission? Make it make sense.<br/>
            <br/>
            I dig through papers, product updates, startup launches, and industry moves so you don’t have to. Each edition brings you a mix of serious breakthroughs, quirky tools, useful resources, and under-the-radar gems—all curated and explained like you’re chatting with a smart friend, not reading a textbook.<br/>
            <br/>
            The goal: Help you stay ahead of the curve, without burning out trying.
          </p>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              AI-Powered Curation
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Advanced algorithms analyze hundreds of sources to find the most relevant content for you.
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-secondary-100 dark:bg-secondary-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Community-Driven
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Built by AI enthusiasts, for AI enthusiasts. We value your feedback and contributions.
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-success-100 dark:bg-success-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Lightning Fast
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Get breaking AI news within hours of publication, not days or weeks later.
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-warning-100 dark:bg-warning-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-warning-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Quality Assured
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Human editorial review ensures accuracy and relevance of all content.
            </p>
          </div>
        </motion.div>

        {/* Team (Personalized) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 text-center">
            Who’s Behind This?
          </h2>
          <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-neutral-600">SM</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Siddhanta Mohanty
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
              Founder, Curator, and Your AI Guide
              </p>
            <p className="text-sm text-neutral-500 mt-2 text-center max-w-xl">
              Newsletter nerd and relentless AI explorer. I’m here to help you cut through the noise and stay genuinely ahead—no fake social proof, no clickbait, just real news and insights that matter.
              </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">You</div>
            <div className="text-neutral-600 dark:text-neutral-400">Engaged Reader</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary-600 mb-2">500+</div>
            <div className="text-neutral-600 dark:text-neutral-400">Sources Monitored</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">High</div>
            <div className="text-neutral-600 dark:text-neutral-400">Open Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600 mb-2">24/7</div>
            <div className="text-neutral-600 dark:text-neutral-400">Content Curation</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 