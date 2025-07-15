import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { NewsletterPreview } from '@/components/sections/NewsletterPreview';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';
import LiveHeadlinesSection from '@/components/sections/LiveHeadlinesSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <LiveHeadlinesSection />
      <FeaturesSection />
      <NewsletterPreview />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
} 