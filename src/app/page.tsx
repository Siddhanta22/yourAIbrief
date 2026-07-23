'use client';

import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';
import { NewsGrid } from '@/components/ui/NewsGrid';

function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  // Show loading state while checking session, and while redirecting
  // authenticated visitors to the one real dashboard (avoids maintaining
  // a second, parallel "dashboard" view here that can drift out of sync).
  if (status === 'loading' || (status === 'authenticated' && session?.user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
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