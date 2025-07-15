'use client';

export function NewsletterPreview() {
  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            See What You'll Get
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            A preview of our curated AI newsletter format
          </p>
        </div>
        
        <div className="card max-w-4xl mx-auto p-8">
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                AI Breakthroughs & Research
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Latest papers, discoveries, and scientific advances in artificial intelligence.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  New Transformer Architecture Shows 40% Performance Improvement
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Researchers at Stanford introduce a novel attention mechanism that significantly reduces computational complexity while improving accuracy across multiple benchmarks.
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Source: arXiv</span>
                  <span>2 hours ago</span>
                </div>
              </div>
              
              <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Breakthrough in Multimodal AI Understanding
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  OpenAI's latest model demonstrates unprecedented ability to understand and reason across text, images, and audio simultaneously.
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Source: OpenAI Blog</span>
                  <span>4 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 