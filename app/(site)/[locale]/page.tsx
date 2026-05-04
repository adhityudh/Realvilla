import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import SplashIntro from '@/components/hero/SplashIntro';
import SectionRenderer from '@/components/sections/SectionRenderer';
import FooterSection from '@/components/sections/FooterSection';
import { draftMode } from 'next/headers';
import { client } from '@/sanity/lib/client';
import { PAGE_QUERY, SETTINGS_QUERY } from '@/sanity/lib/queries';
import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { getDictionary } from '@/lib/get-dictionary';
import { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const [page, settings] = await Promise.all([
    client.fetch(PAGE_QUERY, { slug: 'home', language: locale }),
    getGlobalSettings(locale)
  ]);
  
  return constructMetadata(page?.seo, settings?.seo, `/${locale}`);
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isDraftMode = (await draftMode()).isEnabled;

  // Fetch homepage and settings data from Sanity
  let data = null;
  let settingsData = null;
  let dict = null;

  try {
    const fetchOptions = { 
      perspective: isDraftMode ? 'previewDrafts' as const : 'published' as const,
      stega: isDraftMode,
      next: { 
        revalidate: isDraftMode ? 0 : 60, 
        tags: ['page', 'home', 'settings'] 
      } 
    };

    [data, settingsData, dict] = await Promise.all([
      client.fetch(PAGE_QUERY, { slug: 'home', language: locale }, fetchOptions),
      client.fetch(SETTINGS_QUERY, { language: locale }, fetchOptions),
      getDictionary(locale as any)
    ]);
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
    <>
      <Header settings={settingsData} />
      <MobileNav settings={settingsData} />
      <SectionRenderer sections={data.sections} dict={dict} />
      <FooterSection data={settingsData?.footer} />
    </>
  );
}
