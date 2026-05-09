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

export default async function PropertiesPage({ params }: { params: Promise<{ locale: string }> }) {
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
