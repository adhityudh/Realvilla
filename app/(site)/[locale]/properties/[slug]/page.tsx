import { client } from '@/sanity/lib/client';
import { PROPERTY_DETAIL_QUERY } from '@/sanity/lib/queries';
import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { getDictionary } from '@/lib/get-dictionary';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TranslationSetter from '@/components/providers/TranslationSetter';
import PropertyGallery from '@/components/sections/PropertyGallery';
import PropertyDetails from '@/components/sections/PropertyDetails';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string, slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params;
  const [property, settings] = await Promise.all([
    client.fetch(PROPERTY_DETAIL_QUERY, { slug, language: locale }),
    getGlobalSettings(locale)
  ]);
  
  if (!property) return {};

  const propertySeo = {
    ...property?.seo,
    metaTitle: property?.seo?.metaTitle || property?.title,
    metaDescription: property?.seo?.metaDescription || property?.subtitle,
    ogImage: property?.seo?.ogImage || property?.image
  };

  return constructMetadata(propertySeo, settings?.seo, `/${locale}/properties/${slug}`, settings?.favicon);
}

import SectionRenderer from '@/components/sections/SectionRenderer';
import FooterPaddingSetter from '@/components/providers/FooterPaddingSetter';

export default async function PropertyPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;

  let property = null;
  let dict = null;
  let settings = null;

  try {
    [property, dict, settings] = await Promise.all([
      client.fetch(PROPERTY_DETAIL_QUERY, { slug, language: locale }, { next: { revalidate: 60 } }),
      getDictionary(locale as any),
      getGlobalSettings(locale)
    ]);
  } catch (error) {
    console.error('Sanity fetch error:', error);
  }

  if (!property) {
    notFound();
  }

  return (
    <main>
      <FooterPaddingSetter active={settings?.propertyDetailFooterPaddingHigh} />
      <TranslationSetter translations={property._translations ?? []} />
      <PropertyGallery property={property} dict={dict} />
      <PropertyDetails property={property} dict={dict} locale={locale} />
      {settings?.propertyDetailSections && (
        <SectionRenderer 
          sections={settings.propertyDetailSections} 
          dict={dict} 
          contextData={{ propertyPrice: property?.price }}
        />
      )}
    </main>
  );
}
