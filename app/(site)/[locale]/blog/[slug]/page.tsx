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
  let blogDetailCta = null;

  try {
    const [rawPost, dictResult, settings] = await Promise.all([
      client.fetch(BLOG_DETAIL_QUERY, { slug, language: locale }, { next: { revalidate: 60 } }),
      getDictionary(locale as any),
      getGlobalSettings(locale),
    ]);
    post = sanitizeSanityData(rawPost);
    dict = dictResult;
    
    // Check if specific blog post has a custom Sidebar CTA override (validated by having a headline)
    const postCta = post?.blogDetailCta;
    const hasPostCta = postCta && postCta.headline;
    blogDetailCta = hasPostCta ? postCta : (settings?.blogDetailCta ?? null);
    const blogDetailAbout = settings?.blogDetailAbout ?? null;
    
    return (
      <main>
        <TranslationSetter translations={post._translations ?? []} />
        <BlogDetailSection 
          post={post} 
          dict={dict} 
          locale={locale} 
          blogDetailCta={blogDetailCta} 
          blogDetailAbout={blogDetailAbout} 
        />
      </main>
    );
  } catch (error) {
    console.error('Sanity fetch error:', error);
  }

  if (!post) {
    notFound();
  }

  return null;
}
