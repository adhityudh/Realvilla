import PropertiesArchivePage from '@/components/sections/PropertiesArchivePage';
import { getDictionary } from '@/lib/get-dictionary';
import TranslationSetter from '@/components/providers/TranslationSetter';
import { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs ? 'Propiedades Exclusivas | Realvilla' : 'Exclusive Properties | Realvilla',
    description: isEs 
      ? 'Explore nuestra exclusiva selección de villas, apartamentos y casas en venta en Tenerife.' 
      : 'Explore our exclusive selection of villas, apartments, and houses for sale in Tenerife.',
  };
}

import { client } from '@/sanity/lib/client';
import { PROPERTY_META_QUERY } from '@/sanity/lib/queries';

export default async function PropertiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Fetch dictionary and filter metadata in parallel on the server
  const [dict, initialMeta] = await Promise.all([
    getDictionary(locale as any),
    client.fetch(PROPERTY_META_QUERY, { language: locale }, { 
      next: { revalidate: 3600, tags: ['meta', 'properties'] } 
    })
  ]);

  const translations = [
    { language: 'en', slug: 'properties' },
    { language: 'es', slug: 'propiedades' }
  ];

  return (
    <>
      <TranslationSetter translations={translations} />
      <PropertiesArchivePage dict={dict} initialMeta={initialMeta} />
    </>
  );
}
