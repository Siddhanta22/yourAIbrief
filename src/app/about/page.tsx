'use client';

import { NewsGrid } from '@/components/ui/NewsGrid';

export default function AboutPage() {
  return (
    <main className="min-h-screen dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-neutral-100 mb-6">
            About YourAIbrief
          </h1>
          <p className="text-xl text-gray-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto">
            We combine cutting-edge AI technology with human expertise to deliver the most relevant and timely AI content to researchers, developers, and AI enthusiasts worldwide.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-neutral-100 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-neutral-400 mb-6">
                To democratize access to AI knowledge by curating the most important developments,
                breakthroughs, and insights from the world of artificial intelligence.
              </p>
              <p className="text-lg text-gray-600 dark:text-neutral-400">
                We believe that staying informed about AI developments shouldn't be overwhelming.
                Our newsletter distills complex information into digestible, actionable insights.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-4">What We Cover</h3>
              <ul className="space-y-3 text-gray-700 dark:text-neutral-300">
                <li>• Latest AI research and breakthroughs</li>
                <li>• Industry news and analysis</li>
                <li>• Practical AI applications</li>
                <li>• Expert insights and opinions</li>
                <li>• Emerging trends and technologies</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <NewsGrid 
        title="Latest AI Developments"
        subtitle="Stay updated with the most important AI news"
        maxCards={6}
        showTitle={true}
      />

    </main>
  );
}