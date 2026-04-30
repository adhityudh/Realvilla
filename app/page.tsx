import SmoothScroller from '@/components/SmoothScroller';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import CursorFollower from '@/components/layout/CursorFollower';
import SplashIntro from '@/components/hero/SplashIntro';
import HeroSection from '@/components/hero/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ValuationSection from '@/components/sections/ValuationSection';
import PropertiesSection from '@/components/sections/PropertiesSection';
import MortgageFAQSection from '@/components/sections/MortgageFAQSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';

export default function Home() {
  return (
    <SmoothScroller>
      <CursorFollower />
      <Header />
      <MobileNav />
      <SplashIntro />
      <HeroSection />
      <ValuationSection />
      <PropertiesSection />
      <MortgageFAQSection />
      <TestimonialsSection />
      <AboutSection />
    </SmoothScroller>
  );
}
