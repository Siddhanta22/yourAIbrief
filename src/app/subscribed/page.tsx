'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Mail, BookOpen, Users, TrendingUp, ArrowRight } from 'lucide-react';
import LiveHeadlinesSection from '@/components/sections/LiveHeadlinesSection';

export default function SubscribedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center mb-8 border border-neutral-200 dark:border-neutral-700"
      >
        <div className="flex flex-col items-center mb-4">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-2">
            <Sparkles className="w-8 h-8 text-primary-600" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-700 dark:text-primary-300 mb-2">
            Subscription Successful!
          </h1>
          <p className="text-lg text-neutral-700 dark:text-neutral-200 max-w-xl mx-auto">
            Welcome to your daily AI brief. Here’s what you’ll experience every day:
          </p>
        </div>

        {/* What to Expect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
          <div className="flex items-start space-x-3">
            <Mail className="w-6 h-6 text-primary-500 mt-1" />
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">Curated AI News</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Handpicked stories and breakthroughs delivered to your inbox.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <BookOpen className="w-6 h-6 text-secondary-500 mt-1" />
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">Actionable Insights</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Summaries and takeaways you can use right away.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Users className="w-6 h-6 text-success-500 mt-1" />
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">Personalized Content</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Topics tailored to your interests and goals.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-6 h-6 text-warning-500 mt-1" />
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">Stay Ahead</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Be the first to know about trends and opportunities.</div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="my-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Why Choose Our AI Newsletter?</h2>
          <p className="text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
            Join the world of AI. We combine cutting-edge AI technology with human expertise to deliver the most relevant and timely AI content. Stay informed, inspired, and ahead of the curve.
          </p>
        </div>

        {/* Explore More */}
        <div className="my-8">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Explore More</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/about">
              <button className="btn-primary flex items-center justify-center w-full sm:w-auto">
                <ArrowRight className="w-4 h-4 mr-2" /> Learn About Us
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="btn-secondary flex items-center justify-center w-full sm:w-auto">
                <ArrowRight className="w-4 h-4 mr-2" /> Go to Dashboard
              </button>
            </Link>
            <Link href="/">
              <button className="btn-ghost flex items-center justify-center w-full sm:w-auto">
                <ArrowRight className="w-4 h-4 mr-2" /> Back to Home
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
      {/* Interactive News Headlines Section */}
      <LiveHeadlinesSection />
    </div>
  );
} 