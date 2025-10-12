'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroSection } from '@/components/sections/HeroSection';
import { DashboardSection } from '@/components/sections/DashboardSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { NewsGrid } from '@/components/ui/NewsGrid';
import toast from 'react-hot-toast';

export default function Home() {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via email-first auth
    try {
      const storedUserData = localStorage.getItem('userData');
      const storedEmail = localStorage.getItem('subscribedEmail');
      
      if (storedUserData) {
        const parsed = JSON.parse(storedUserData);
        setUserData(parsed);
        console.log('Home: User is logged in via email-first auth', parsed);
      } else if (storedEmail) {
        // User has email but no userData, check if they exist in database
        console.log('Home: Found email in localStorage, checking if user exists:', storedEmail);
        checkExistingUser(storedEmail);
      } else {
        setUserData(null);
        console.log('Home: No user data found, showing signup form');
      }
    } catch (error) {
      console.error('Home: Error reading localStorage:', error);
      setUserData(null);
    }
    setLoading(false);
  }, []);

  const checkExistingUser = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      console.log('Home: Check existing user response:', data);
      
      if (data.success && data.userExists) {
        // User exists, store their data and show dashboard
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUserData(data.user);
        console.log('Home: Existing user found, showing dashboard');
      } else {
        // User doesn't exist, clear email and show signup
        localStorage.removeItem('subscribedEmail');
        setUserData(null);
        console.log('Home: User not found, showing signup form');
      }
    } catch (error) {
      console.error('Home: Error checking existing user:', error);
      setUserData(null);
    }
  };

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'email-confirmed') {
      toast.success('Email confirmed! Welcome to YourAIbrief! 🎉');
    } else if (error === 'invalid-token') {
      toast.error('Invalid confirmation link. Please try signing up again.');
    } else if (error === 'expired-token') {
      toast.error('Confirmation link has expired. Please sign up again.');
    } else if (error === 'user-not-found') {
      toast.error('User not found. Please sign up again.');
    } else if (error === 'confirmation-failed') {
      toast.error('Confirmation failed. Please try again.');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show dashboard if user is logged in, otherwise show signup form
  if (userData && userData.id) {
    return (
      <main className="min-h-screen">
        <DashboardSection />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <NewsGrid 
        title="See What You'll Get"
        subtitle="A preview of our curated AI newsletter format"
        maxCards={6}
        showTitle={true}
      />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
} 