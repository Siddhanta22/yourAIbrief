'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Target, Shield, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Curation',
    description: 'Advanced algorithms analyze and curate the most relevant AI content from hundreds of sources.',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Get breaking AI news and research papers within hours of publication.',
  },
  {
    icon: Target,
    title: 'Personalized Content',
    description: 'Tailored newsletters based on your interests, role, and reading preferences.',
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Human editorial review ensures accuracy and relevance of all content.',
  },
  {
    icon: Clock,
    title: 'Flexible Delivery',
    description: 'Choose your preferred delivery time and frequency.',
  },
  {
    icon: Users,
    title: 'Community Insights',
    description: 'Access to expert analysis and community discussions.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Why Choose YourAIbrief?
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            We combine cutting-edge AI technology with human expertise to deliver the most relevant and timely AI content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 