'use client';

import { motion } from 'framer-motion';
import { Brain, Users, Zap, Shield, Target, Clock } from 'lucide-react';

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
            Hey, I'm Siddhanta 👋
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            I built this newsletter because AI moves fast, and staying updated shouldn't feel like a full-time job or a hype-fest.
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            Whether you're a builder, a browser, or just AI-curious, this space is for you. I filter out the noise and deliver the best of AI: tools, research, product launches, and breakthrough experiments in a way that's easy to follow and actually enjoyable to read.
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            Let's be honest: the AI world is overwhelming right now. New models, wild demos, billion-dollar funding rounds. It's a lot to keep up with.
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            My mission? Make it make sense.
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            I dig through papers, product updates, startup launches, and industry moves so you don't have to. Each edition brings you a mix of serious breakthroughs, innovative tools, useful resources, and under-the-radar gems, all curated and explained like you're chatting with a smart friend, not reading a textbook.
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            The goal: Help you stay ahead of the curve without burning out trying.
          </p>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
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
              <Target className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Personalized Content
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Choose your interests and get content tailored to your specific AI focus areas.
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-success-100 dark:bg-success-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Flexible Delivery
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Daily, weekly, or monthly delivery at your preferred time.
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

          <div className="text-center">
            <div className="p-4 bg-info-100 dark:bg-info-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-info-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Lightning Fast
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Get breaking AI news within hours of publication, not days or weeks later.
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Community-Driven
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Built by AI enthusiasts, for AI enthusiasts. We value your feedback and contributions.
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
            Meet Your AI Guide
          </h2>
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">SM</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Siddhanta Mohanty
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Founder & AI Content Curator
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-2xl leading-relaxed">
              I'm passionate about making AI accessible and understandable. With years of experience in technology and content curation, I've built this newsletter to help professionals like you stay ahead of the AI revolution without getting overwhelmed by the noise. Every piece of content is carefully selected and explained in plain English.
            </p>
            <div className="mt-6 flex items-center space-x-4 text-sm text-neutral-500">
              <span>• AI Enthusiast</span>
              <span>• Content Curator</span>
              <span>• Tech Explorer</span>
            </div>
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