import SmoothScroller from '@/components/SmoothScroller';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import SplashIntro from '@/components/hero/SplashIntro';
import SectionRenderer from '@/components/sections/SectionRenderer';
import FooterSection from '@/components/sections/FooterSection';
import { client } from '@/sanity/lib/client';
import { PAGE_QUERY } from '@/sanity/lib/queries';

export default async function Home() {
  // Fetch homepage data from Sanity
  // We use slug 'home' for the homepage by convention
  let data = null;
  try {
    data = await client.fetch(
      PAGE_QUERY, 
      { slug: 'home' },
      { next: { revalidate: 60, tags: ['page', 'home'] } }
    );
  } catch (error) {
    console.error('Sanity fetch error:', error);
  }

  // If no data is found in Sanity, we show a helpful message for the developer
  // but keep the global structure
  if (!data) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1>Welcome to Realvilla</h1>
        <p>No homepage data found in Sanity. Please create a <strong>Page</strong> document with the slug <strong>"home"</strong> in the Sanity Studio.</p>
        <a href="/studio" style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          background: '#000', 
          color: '#fff', 
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Go to Sanity Studio
        </a>
      </div>
    );
  }

  return (
    <SmoothScroller>
      <Header />
      <MobileNav />
      <SectionRenderer sections={data.sections} />
      <FooterSection />
    </SmoothScroller>
  );
}
