'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HeroSection } from '@/components/sections/HeroSection';
import { DashboardSection } from '@/components/sections/DashboardSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { NewsGrid } from '@/components/ui/NewsGrid';
import toast from 'react-hot-toast';

function HomeContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

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

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show dashboard if user is authenticated via NextAuth, otherwise show signup form
  if (status === 'authenticated' && session?.user) {
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
        enablePagination={true}
      />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
} 