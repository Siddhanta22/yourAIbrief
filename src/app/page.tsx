'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { NewsletterPreview } from '@/components/sections/NewsletterPreview';
import toast from 'react-hot-toast';

export default function Home() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'email-confirmed') {
      toast.success('Email confirmed! Welcome to AI Newsletter! 🎉');
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

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <NewsletterPreview />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
} 