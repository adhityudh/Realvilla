import { client } from '@/sanity/lib/client';
import { PROPERTY_DETAIL_QUERY } from '@/sanity/lib/queries';
import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { getDictionary } from '@/lib/get-dictionary';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TranslationSetter from '@/components/providers/TranslationSetter';
import PropertyGallery from '@/components/sections/PropertyGallery';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string, slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params;
  const [property, settings] = await Promise.all([
    client.fetch(PROPERTY_DETAIL_QUERY, { slug, language: locale }),
    getGlobalSettings(locale)
  ]);
  
  if (!property) return {};

  return constructMetadata(property?.seo, settings?.seo, `/${locale}/propiedades/${slug}`, settings?.favicon);
}

export default async function PropertyPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;

  let property = null;
  let dict = null;

  try {
    [property, dict] = await Promise.all([
      client.fetch(PROPERTY_DETAIL_QUERY, { slug, language: locale }, { next: { revalidate: 60 } }),
      getDictionary(locale as any)
    ]);
  } catch (error) {
    console.error('Sanity fetch error:', error);
  }

  if (!property) {
    notFound();
  }

  return (
    <main>
      <TranslationSetter translations={property._translations ?? []} />
      <PropertyGallery property={property} dict={dict} />
      {/* Other sections will go here later */}
    </main>
  );
}
