import SectionRenderer from '@/components/sections/SectionRenderer';
import { client } from '@/sanity/lib/client';
import { PAGE_QUERY, SETTINGS_QUERY } from '@/sanity/lib/queries';
import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { getDictionary } from '@/lib/get-dictionary';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TranslationSetter from '@/components/providers/TranslationSetter';

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

  let data = null;
  let dict = null;

  try {
    [data, dict] = await Promise.all([
      client.fetch(PAGE_QUERY, { slug, language: locale }, { next: { revalidate: 60 } }),
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
      <TranslationSetter translations={data._translations ?? []} />
      <SectionRenderer sections={data.sections} dict={dict} />
    </>
  );
}
