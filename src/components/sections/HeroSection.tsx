'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';
import { SubscriptionForm } from '@/components/forms/SubscriptionForm';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (email: string, interests: string[]) => {
    setIsSubmitting(true);
    setFormMessage(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interests }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/subscribed');
      } else if (data.alreadySubscribed) {
        setFormMessage('You are already subscribed with this email address.');
      } else {
        setFormMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      setFormMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Content Curation
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Your Daily{' '}
            <span className="text-gradient">AI Intelligence</span>
            <br />
            Delivered
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed"
          >
            Stay ahead with curated AI news, breakthroughs, and insights. 
            Personalized for researchers, developers, and AI enthusiasts.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex justify-center items-center space-x-8 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>10,000+ subscribers</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>99% open rate</span>
            </div>
          </motion.div>

          {/* Subscription form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            {formMessage && (
              <div className="mb-4 text-red-600 dark:text-red-400 font-medium">
                {formMessage}
              </div>
            )}
            <SubscriptionForm onSubmit={handleSubscribe} isSubmitting={isSubmitting} />
          </motion.div>


        </motion.div>
      </div>
    </section>
  );
} 