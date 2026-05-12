import PropertiesArchivePage from '@/components/sections/PropertiesArchivePage';
import { getDictionary } from '@/lib/get-dictionary';
import TranslationSetter from '@/components/providers/TranslationSetter';
import { Metadata } from 'next';

import { getGlobalSettings, constructMetadata } from '@/lib/metadata';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getGlobalSettings(locale);
  
  return constructMetadata(
    settings?.propertiesPageSeo, 
    settings?.seo, 
    `/${locale}/propiedades`, 
    settings?.favicon
  );
}

export default async function PropiedadesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as any);

  const translations = [
    { language: 'en', slug: 'properties' },
    { language: 'es', slug: 'propiedades' }
  ];

  return (
    <>
      <TranslationSetter translations={translations} />
      <PropertiesArchivePage dict={dict} />
    </>
  );
}
