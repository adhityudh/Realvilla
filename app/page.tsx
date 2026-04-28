import SmoothScroller from '@/components/SmoothScroller';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import CursorFollower from '@/components/layout/CursorFollower';
import SplashIntro from '@/components/hero/SplashIntro';
import HeroSection from '@/components/hero/HeroSection';
import PropertiesSection from '@/components/sections/PropertiesSection';
import ValuationSection from '@/components/sections/ValuationSection';

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
      <section style={{ height: '100svh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontWeight: 300 }}>Rest of the website...</h2>
      </section>
    </SmoothScroller>
  );
}
