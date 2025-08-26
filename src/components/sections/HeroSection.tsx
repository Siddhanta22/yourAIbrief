'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Users, BookOpen, Settings } from 'lucide-react';
import { SubscriptionForm } from '@/components/forms/SubscriptionForm';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function HeroSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [localEmail, setLocalEmail] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    try {
      setLocalEmail(localStorage.getItem('subscribedEmail'));
    } catch {}
  }, []);

  const isLoggedIn = status === 'authenticated' || !!localEmail;

  const handleSubscribe = async (
    name: string,
    email: string,
    interests: string[],
    deliveryPreferences?: { frequency: string; dayOfWeek?: string; dayOfMonth?: string; timeOfDay: string }
  ) => {
    setIsSubmitting(true);
    setFormMessage(null);
    try {
      console.log('Submitting subscription:', { name, email, interests, deliveryPreferences });
      
      const res = await fetch('/api/test-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          interests,
          preferredSendTime: deliveryPreferences?.timeOfDay,
          frequency: deliveryPreferences?.frequency,
        }),
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        setFormMessage(`API Error (${res.status}): ${errorText}`);
        return;
      }
      
      const data = await res.json();
      console.log('API Response data:', data);
      
      if (data.success) {
        router.push('/subscribed');
      } else if (data.alreadySubscribed) {
        setFormMessage('You are already subscribed with this email address.');
      } else {
        setFormMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setFormMessage(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="subscribe" className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
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

          {/* Content based on login status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            {isLoggedIn ? (
              // Logged in user content
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    Welcome back! 👋
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Here's your AI intelligence summary
                  </p>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">12</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Newsletters</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">85%</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Open Rate</div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Full Dashboard
                  </button>
                  
                  <button
                    onClick={() => {
                      const email = session?.user?.email || localEmail;
                      if (email) {
                        router.push(`/api/user/preferences?email=${encodeURIComponent(email)}`);
                      }
                    }}
                    className="btn-ghost w-full flex items-center justify-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Quick Settings
                  </button>
                </div>
              </div>
            ) : (
              // Non-logged in user content - subscription form
              <>
                {formMessage && (
                  <div className="mb-4 text-red-600 dark:text-red-400 font-medium">
                    {formMessage}
                  </div>
                )}
                <SubscriptionForm onSubmit={handleSubscribe} isSubmitting={isSubmitting} />
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 