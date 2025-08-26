'use client';

import { Sparkles, Target, Clock, Users } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Why Choose Our AI Newsletter?
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Built for AI professionals who want to stay ahead without the noise
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              AI-Powered Curation
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Advanced algorithms filter through thousands of sources to find the most relevant AI content
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Personalized Content
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Choose your interests and get content tailored to your specific AI focus areas
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Flexible Delivery
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Daily, weekly, or monthly delivery at your preferred time
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-warning-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Quality Over Quantity
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Curated from trusted sources, not just aggregated from everywhere
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              Join the AI community and never miss the important developments again
            </p>
            <a 
              href="#subscribe" 
              className="btn-primary inline-flex items-center"
            >
              Start Your Free Subscription
              <Sparkles className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 