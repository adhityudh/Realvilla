import SectionRenderer from '@/components/sections/SectionRenderer';
import { client } from '@/sanity/lib/client';
import { PAGE_QUERY, SETTINGS_QUERY } from '@/sanity/lib/queries';
import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { getDictionary } from '@/lib/get-dictionary';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TranslationSetter from '@/components/providers/TranslationSetter';
import FooterPaddingSetter from '@/components/providers/FooterPaddingSetter';

import { draftMode } from 'next/headers';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string, slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params;
  const [page, settings] = await Promise.all([
    client.fetch(PAGE_QUERY, { slug, language: locale }),
    getGlobalSettings(locale)
  ]);
  
  if (!page) return {};

  return constructMetadata(page?.seo, settings?.seo, `/${locale}/${slug}`, settings?.favicon);
}

export default async function DynamicPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;
  const isDraftMode = (await draftMode()).isEnabled;

  let data = null;
  let dict = null;

  try {
    const fetchOptions = { 
      perspective: isDraftMode ? 'previewDrafts' as const : 'published' as const,
      stega: isDraftMode,
      next: { 
        revalidate: isDraftMode ? 0 : 60, 
        tags: ['page', slug] 
      } 
    };

    [data, dict] = await Promise.all([
      client.fetch(PAGE_QUERY, { slug, language: locale }, fetchOptions),
      getDictionary(locale as any)
    ]);
  } catch (error) {
    console.error('Sanity fetch error:', error);
  }

  if (!data) {
    notFound();
  }

  return (
    <>
      <FooterPaddingSetter active={data.footerPaddingHigh} />
      <TranslationSetter translations={data._translations ?? []} />
      <SectionRenderer sections={data.sections} dict={dict} />
    </>
  );
}
