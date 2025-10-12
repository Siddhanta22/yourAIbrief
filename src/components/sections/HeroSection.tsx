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
    const checkLocalEmail = () => {
      try {
        const email = localStorage.getItem('subscribedEmail');
        console.log('HeroSection checking localStorage:', email);
        setLocalEmail(email);
      } catch {}
    };
    
    // Check initially
    checkLocalEmail();
    
    // Listen for storage changes (when localStorage is cleared from another tab/component)
    window.addEventListener('storage', checkLocalEmail);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkLocalEmail, 1000);
    
    return () => {
      window.removeEventListener('storage', checkLocalEmail);
      clearInterval(interval);
    };
  }, []);

  // Check for existing user on mount
  useEffect(() => {
    console.log('HeroSection: Checking session state on mount');
    console.log('Current status:', status, 'localEmail:', localEmail);
    
    // Check if user exists in database
    if (localEmail && status !== 'authenticated') {
      console.log('HeroSection: Found email, checking if user exists:', localEmail);
      checkExistingUser(localEmail);
    }
  }, [status, localEmail]);

  const checkExistingUser = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      console.log('HeroSection: Check existing user response:', data);
      
      if (data.success && data.userExists) {
        // User exists, redirect to dashboard
        console.log('HeroSection: Existing user found, redirecting to dashboard');
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('subscribedEmail', email);
        window.location.href = '/dashboard';
      } else {
        // User doesn't exist, clear email
        console.log('HeroSection: User not found, clearing email');
        localStorage.removeItem('subscribedEmail');
        setLocalEmail(null);
      }
    } catch (error) {
      console.error('HeroSection: Error checking existing user:', error);
    }
  };

  // FORCE show signup form - HeroSection should NEVER show logged-in state
  const [forceShowSignup, setForceShowSignup] = useState(false);
  
  useEffect(() => {
    // Check if we're coming from logout or if there's a signup parameter
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogout = urlParams.get('from') === 'logout';
    const showSignup = urlParams.get('show') === 'signup';
    
    if (fromLogout || showSignup) {
      console.log('Force showing signup form due to URL parameters');
      setForceShowSignup(true);
    }
  }, []);
  
  // ALWAYS show signup form in HeroSection - logged-in users should go to dashboard
  const isLoggedIn = false; // FORCE FALSE - HeroSection is only for signup
  console.log('HeroSection isLoggedIn:', isLoggedIn, 'status:', status, 'localEmail:', localEmail, 'forceShowSignup:', forceShowSignup);

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
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();
      console.log('Email check response:', checkData);

      if (checkData.success && checkData.userExists) {
        // User exists - redirect to dashboard
        console.log('User exists, redirecting to dashboard');
        localStorage.setItem('userData', JSON.stringify(checkData.user));
        localStorage.setItem('subscribedEmail', email);
        setLocalEmail(email);
        setFormMessage('Welcome back! Redirecting to your dashboard...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
        return;
      }

      // User doesn't exist - proceed with registration
      console.log('New user, proceeding with registration');
      const res = await fetch('/api/subscribe', {
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
        // Store email in localStorage for email-first auth
        try {
          localStorage.setItem('subscribedEmail', email);
          console.log('Stored email in localStorage:', email);
        } catch (error) {
          console.error('Failed to store email in localStorage:', error);
        }
        
        setFormMessage('Subscription successful! Welcome to AI Newsletter! Check your email for a welcome message.');
        
        // Redirect to success page after a short delay
        setTimeout(() => {
          router.push('/subscribed');
        }, 2000);
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