'use client';

import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Stay Ahead in AI?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of AI professionals who get their daily intelligence fix from our curated newsletter.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-secondary bg-white text-primary-600 hover:bg-neutral-100">
            Start Your Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          <button className="btn-ghost text-white border-white hover:bg-white/10">
            Learn More
          </button>
        </div>
        
        <p className="text-sm text-primary-200 mt-6">
          No credit card required • Cancel anytime • 7-day free trial
        </p>
      </div>
    </section>
  );
} 