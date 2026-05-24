import { client } from '@/sanity/lib/client';
import { PROPERTY_DETAIL_QUERY } from '@/sanity/lib/queries';
import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { getDictionary } from '@/lib/get-dictionary';
import { sanitizeSanityData } from '@/lib/sanitize';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TranslationSetter from '@/components/providers/TranslationSetter';
import PropertyGallery from '@/components/sections/PropertyGallery';
import PropertyDetails from '@/components/sections/PropertyDetails';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string, slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params;
  const [rawProperty, settings] = await Promise.all([
    client.fetch(PROPERTY_DETAIL_QUERY, { slug, language: locale }),
    getGlobalSettings(locale)
  ]);
  const property = sanitizeSanityData(rawProperty);
  
  if (!property) return {};

  const propertySeo = {
    ...property?.seo,
    metaTitle: property?.seo?.metaTitle || property?.title,
    metaDescription: property?.seo?.metaDescription || property?.subtitle,
    ogImage: property?.seo?.ogImage || property?.image
  };

  return constructMetadata(propertySeo, settings?.seo, `/${locale}/propiedades/${slug}`, settings?.favicon);
}

import SectionRenderer from '@/components/sections/SectionRenderer';
import FooterPaddingSetter from '@/components/providers/FooterPaddingSetter';
import OtherProperties from '@/components/sections/OtherProperties';
import { GalleryModalProvider } from '@/components/providers/GalleryModalContext';

export default async function PropertyPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;

  let property = null;
  let dict = null;
  let settings = null;

  try {
    const [rawProperty, dictResult, settingsResult] = await Promise.all([
      client.fetch(PROPERTY_DETAIL_QUERY, { slug, language: locale }, { next: { revalidate: 60 } }),
      getDictionary(locale as any),
      getGlobalSettings(locale)
    ]);
    property = sanitizeSanityData(rawProperty);
    dict = dictResult;
    settings = settingsResult;
  } catch (error) {
    console.error('Sanity fetch error:', error);
  }

  if (!property) {
    notFound();
  }

  return (
    <GalleryModalProvider>
      <main>
        <FooterPaddingSetter active={settings?.propertyDetailFooterPaddingHigh} />
        <TranslationSetter translations={property._translations ?? []} />
        <PropertyGallery property={property} dict={dict} offerEnabled={settings?.propertyOfferEnabled ?? false} />
        <PropertyDetails 
          property={property} 
          dict={dict} 
          locale={locale} 
          whatsappNumber={settings?.contactWhatsAppNumber}
          whatsappMessageTemplate={settings?.contactPresetMessageTemplate}
          propertyContactPresetMessage={settings?.propertyContactPresetMessage}
          offerEnabled={settings?.propertyOfferEnabled ?? false}
          offerDepositAmount={settings?.propertyOfferDepositAmount ?? 500}
          offerConditionsTitle={settings?.propertyOfferConditionsTitle}
          offerConditionsIntro={settings?.propertyOfferConditionsIntro}
          offerConditionsTerms={settings?.propertyOfferConditionsTerms}
          offerConditionsAccept={settings?.propertyOfferConditionsAccept}
          offerPriceHelper={settings?.propertyOfferPriceHelper}
          offerConditionsHelper={settings?.propertyOfferConditionsHelper}
        />
        <OtherProperties 
          currentPropertyId={property._id}
          categoryId={property.category?._id}
          municipality={property.location?.municipality}
          locale={locale}
          dict={dict}
        />
        {settings?.propertyDetailSections && (
          <SectionRenderer 
            sections={settings.propertyDetailSections} 
            dict={dict} 
            contextData={{ 
              propertyPrice: property?.price, 
              whatsappNumber: settings?.contactWhatsAppNumber,
              mortgageCalculator: settings?.mortgageCalculator
            }}
          />
        )}
      </main>
    </GalleryModalProvider>
  );
}
