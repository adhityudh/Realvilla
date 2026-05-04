import { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { SETTINGS_QUERY } from '@/sanity/lib/queries'

export type SeoData = {
  metaTitle?: string
  metaDescription?: string
  ogImage?: { asset: { url: string } }
  noIndex?: boolean
  canonicalUrl?: string
  favicon?: string
}

export async function getGlobalSettings(locale: string) {
  return await client.fetch(SETTINGS_QUERY, { language: locale }, {
    next: { tags: ['settings'] }
  })
}

export function constructMetadata(
  seo?: SeoData,
  globalSeo?: SeoData,
  path?: string,
  favicon?: string
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const title = seo?.metaTitle || globalSeo?.metaTitle || 'RealVilla - Premium Real Estate'
  const description = seo?.metaDescription || globalSeo?.metaDescription || 'Premium Tenerife real estate. Expert guidance for buyers, sellers, and investors.'
  const ogImage = seo?.ogImage?.asset?.url || globalSeo?.ogImage?.asset?.url
  const noIndex = seo?.noIndex || globalSeo?.noIndex
  const activeFavicon = favicon || globalSeo?.favicon

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | RealVilla`,
    },
    description,
    metadataBase: baseUrl ? new URL(baseUrl) : undefined,
    icons: activeFavicon ? {
      icon: [
        {
          url: activeFavicon,
          type: activeFavicon.endsWith('.svg') ? 'image/svg+xml' : undefined,
        },
        // PNG fallback for scrapers like WhatsApp
        {
          url: `${activeFavicon}${activeFavicon.includes('?') ? '&' : '?'}fm=png&w=32&h=32`,
          type: 'image/png',
          sizes: '32x32',
        },
        {
          url: `${activeFavicon}${activeFavicon.includes('?') ? '&' : '?'}fm=png&w=180&h=180`,
          type: 'image/png',
          sizes: '180x180',
        }
      ],
      shortcut: activeFavicon,
      apple: `${activeFavicon}${activeFavicon.includes('?') ? '&' : '?'}fm=png&w=180&h=180`,
    } : undefined,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: path ? `${baseUrl}${path}` : baseUrl,
      siteName: 'RealVilla',
      locale: path?.startsWith('/es') ? 'es_ES' : 'en_US',
      type: 'website',
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || (path ? `${baseUrl}${path}` : baseUrl),
      languages: {
        'en': `${baseUrl}/en`,
        'es': `${baseUrl}/es`,
      },
    },
  }

  return metadata
}

export function getSchemaData(settings: any, path?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const url = path ? `${baseUrl}${path}` : baseUrl

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "RealVilla",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": settings?.logo || `${baseUrl}/logo.png`,
        },
        "sameAs": settings?.socialLinks?.map((s: any) => s.url) || [],
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "RealVilla",
        "publisher": { "@id": `${baseUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        "url": url,
        "name": settings?.seo?.metaTitle || "RealVilla",
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "description": settings?.seo?.metaDescription,
      }
    ]
  }
}
