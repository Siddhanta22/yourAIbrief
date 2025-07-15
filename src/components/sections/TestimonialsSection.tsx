'use client';

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            What Our Subscribers Say
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Join thousands of AI professionals who trust our newsletter
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              "This newsletter has become my go-to source for AI news. The curation is spot-on and the insights are invaluable."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary-600 font-semibold">S</span>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Sarah Chen</p>
                <p className="text-sm text-neutral-500">ML Engineer, Google</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              "The personalized content based on my interests has saved me hours of research. Highly recommended!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-secondary-600 font-semibold">M</span>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Michael Rodriguez</p>
                <p className="text-sm text-neutral-500">AI Researcher, Stanford</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              "Finally, a newsletter that cuts through the noise and delivers truly relevant AI content. Love it!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-success-600 font-semibold">A</span>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Alex Thompson</p>
                <p className="text-sm text-neutral-500">CTO, AI Startup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 