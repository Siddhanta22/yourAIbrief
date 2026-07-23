'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, Settings } from 'lucide-react';
import { SubscriptionForm } from '@/components/forms/SubscriptionForm';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function HeroSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Remove localStorage-based email checking - use NextAuth session instead
  // localStorage can still be used for UX convenience (pre-filling email), but not for auth

  // If user is authenticated, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);
  
  // Show signup form only if not authenticated
  const isLoggedIn = status === 'authenticated' && !!session?.user;

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
      
      // First, check if email exists
      console.log('Checking if email exists:', email);
      const checkResponse = await fetch(`/api/user/exists?email=${encodeURIComponent(email)}`);

      if (!checkResponse.ok) {
        console.error('Check email failed:', checkResponse.status);
        // Continue with registration if check fails
      } else {
        const checkData = await checkResponse.json();
        console.log('Email check response:', checkData);

        if (checkData.exists) {
          // User exists - send a one-time sign-in link instead of creating a
          // session directly (typing an email alone is not proof of ownership)
          console.log('User exists, sending sign-in link');
          setFormMessage('Check your email for a sign-in link.');

          try {
            await fetch('/api/auth/request-signin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
          } catch (requestError) {
            console.error('Request sign-in error:', requestError);
          }
          return;
        }
      }

      // User doesn't exist - proceed with registration
      console.log('New user, proceeding with registration');
      
      // The time input already gives 24-hour "HH:MM" directly - no conversion needed.
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          interests,
          preferredSendTime: deliveryPreferences?.timeOfDay || '08:00',
          frequency: deliveryPreferences?.frequency || 'daily',
        }),
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      // Read response body once (can only be read once)
      const responseText = await res.text();
      
      if (!res.ok) {
        console.error('API Error Response:', responseText);
        try {
          const errorData = JSON.parse(responseText);
          setFormMessage(errorData.message || `API Error (${res.status}): ${responseText}`);
        } catch {
          setFormMessage(`API Error (${res.status}): ${responseText}`);
        }
        return;
      }
      
      // Check if response has content before parsing JSON
      if (!responseText || responseText.trim() === '') {
        console.error('Empty response from server');
        setFormMessage('Server returned empty response. Please try again.');
        return;
      }
      
      // Safely parse JSON response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('API Response data:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', responseText);
        setFormMessage('Failed to parse server response. Please try again.');
        return;
      }
      
      if (data.success && data.emailSent) {
        // Subscription successful - /api/subscribe already emailed a
        // one-time confirm-and-sign-in link, so just point them at it.
        router.push('/subscribed');
      } else if (data.success && !data.emailSent) {
        // Account was created, but the confirmation email failed to send -
        // don't send them to a "check your email" page for one that never arrives.
        setFormMessage(data.message || "Subscribed, but we couldn't send your confirmation email. Please try again shortly.");
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
                      router.push('/dashboard');
                    }}
                    className="btn-ghost w-full flex items-center justify-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </button>
                </div>
              </div>
            ) : status === 'loading' ? (
              // Loading state
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
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