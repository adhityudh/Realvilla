import BlogArchiveSection from '@/components/sections/BlogArchiveSection';
import { getDictionary } from '@/lib/get-dictionary';
import TranslationSetter from '@/components/providers/TranslationSetter';
import { Metadata } from 'next';
import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { client } from '@/sanity/lib/client';
import { BLOG_ARCHIVE_QUERY } from '@/sanity/lib/queries';
import { sanitizeSanityData } from '@/lib/sanitize';
import { getLocalizedPath, generateTranslations } from '@/lib/routes';
import { Locale } from '@/lib/i18n';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getGlobalSettings(locale);
  
  // Use centralized route helper for canonical path
  const canonicalPath = getLocalizedPath('blog', locale as Locale);
  
  return constructMetadata(
    settings?.blogPageSeo, 
    settings?.seo, 
    canonicalPath, 
    settings?.favicon
  );
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [dict, rawInitialData] = await Promise.all([
    getDictionary(locale as any),
    client.fetch(BLOG_ARCHIVE_QUERY, { language: locale, start: 0, end: 9 }, { 
      stega: false,
      next: { revalidate: 60, tags: ['blog'] } 
    }),
  ]);
  const initialData = sanitizeSanityData(rawInitialData);

  // Use centralized route helper for translations
  const translations = generateTranslations('blog');

  return (
    <>
      <TranslationSetter translations={translations} />
      <BlogArchiveSection 
        dict={dict}
        locale={locale}
        initialFeatured={initialData?.featured || null}
        initialItems={initialData?.items || []}
        initialTotalCount={initialData?.total || 0}
      />
    </>
  );
}
