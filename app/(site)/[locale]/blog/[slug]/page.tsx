import { client } from '@/sanity/lib/client';
import { BLOG_DETAIL_QUERY } from '@/sanity/lib/queries';
import { getGlobalSettings, constructMetadata } from '@/lib/metadata';
import { getDictionary } from '@/lib/get-dictionary';
import { sanitizeSanityData } from '@/lib/sanitize';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TranslationSetter from '@/components/providers/TranslationSetter';
import BlogDetailSection from '@/components/sections/BlogDetailSection';
import { getLocalizedPath } from '@/lib/routes';
import { Locale } from '@/lib/i18n';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string, slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params;
  const [rawPost, settings] = await Promise.all([
    client.fetch(BLOG_DETAIL_QUERY, { slug, language: locale }),
    getGlobalSettings(locale)
  ]);
  const post = sanitizeSanityData(rawPost);
  
  if (!post) return {};

  // Use centralized route helper for canonical path
  const canonicalPath = getLocalizedPath('blog', locale as Locale, slug);

  return constructMetadata(post?.seo, settings?.seo, canonicalPath, settings?.favicon);
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;

  let post = null;
  let dict = null;

  try {
    const [rawPost, dictResult] = await Promise.all([
      client.fetch(BLOG_DETAIL_QUERY, { slug, language: locale }, { next: { revalidate: 60 } }),
      getDictionary(locale as any),
    ]);
    post = sanitizeSanityData(rawPost);
    dict = dictResult;
  } catch (error) {
    console.error('Sanity fetch error:', error);
  }

  if (!post) {
    notFound();
  }

  return (
    <main>
      <TranslationSetter translations={post._translations ?? []} />
      <BlogDetailSection post={post} dict={dict} locale={locale} />
    </main>
  );
}
