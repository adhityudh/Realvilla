import PropertiesArchivePage from '@/components/sections/PropertiesArchivePage';
import { getDictionary } from '@/lib/get-dictionary';
import TranslationSetter from '@/components/providers/TranslationSetter';
import { Metadata } from 'next';

import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { client } from '@/sanity/lib/client';
import { PROPERTY_META_QUERY, INITIAL_PROPERTIES_QUERY } from '@/sanity/lib/queries';
import { sanitizeSanityData } from '@/lib/sanitize';
import { getLocalizedPath, generateTranslations } from '@/lib/routes';
import { Locale } from '@/lib/i18n';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getGlobalSettings(locale);
  
  // Use centralized route helper for canonical path
  const canonicalPath = getLocalizedPath('properties', locale as Locale);
  
  return constructMetadata(
    settings?.propertiesPageSeo, 
    settings?.seo, 
    canonicalPath, 
    settings?.favicon
  );
}

export default async function PropertiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Fetch dictionary, filter metadata, and initial 12 properties in parallel on the server
  const [dict, rawInitialMeta, rawInitialData] = await Promise.all([
    getDictionary(locale as any),
    client.fetch(PROPERTY_META_QUERY, { language: locale }, { 
      stega: false,
      next: { revalidate: 3600, tags: ['meta', 'properties'] } 
    }),
    client.fetch(INITIAL_PROPERTIES_QUERY, { language: locale }, {
      stega: false,
      next: { revalidate: 60, tags: ['properties'] }
    })
  ]);
  const initialMeta = sanitizeSanityData(rawInitialMeta);
  const initialData = sanitizeSanityData(rawInitialData);

  // Use centralized route helper for translations
  const translations = generateTranslations('properties');

  return (
    <>
      <TranslationSetter translations={translations} />
      <PropertiesArchivePage 
        dict={dict} 
        initialMeta={initialMeta} 
        initialProperties={initialData?.items || []}
        initialTotalCount={initialData?.total || 0}
      />
    </>
  );
}
