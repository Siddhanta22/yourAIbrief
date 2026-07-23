'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { HeroSection } from '@/components/sections/HeroSection';
import { DashboardSection } from '@/components/sections/DashboardSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';
import { NewsGrid } from '@/components/ui/NewsGrid';

function HomeContent() {
  const { data: session, status } = useSession();

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