import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { locales } from '@/lib/i18n'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Ensure trailing slash removal for robust concatenation
  const rawBase = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const baseUrl = rawBase.replace(/\/$/, '')

  const sitemapEntries: MetadataRoute.Sitemap = []

  // 1. Add homepages for each language
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    })
  })

  try {
    // 2. Fetch all dynamic pages and properties from Sanity database
    // Filter out drafts and make sure slug exists
    const query = `*[_type in ["page", "property"] && !(_id in path("drafts.**")) && defined(slug.current) && slug.current != "home"] {
      _type,
      "slug": slug.current,
      "language": coalesce(language, "en"),
      _updatedAt
    }`
    
    const results = await client.fetch(query, {}, { next: { revalidate: 3600 } })

    results.forEach((item: any) => {
      const lang = item.language === 'es' ? 'es' : 'en'
      let fullUrl = ''
      let priority = 0.7

      if (item._type === 'property') {
        // Core Property Details Pages (Highest priority dynamic content)
        const routePrefix = lang === 'es' ? 'propiedades' : 'properties'
        fullUrl = `${baseUrl}/${lang}/${routePrefix}/${item.slug}`
        priority = 0.8
      } else {
        // Custom Pages (Buy, Contact, etc.)
        fullUrl = `${baseUrl}/${lang}/${item.slug}`
        priority = 0.6
      }

      sitemapEntries.push({
        url: fullUrl,
        lastModified: item._updatedAt ? new Date(item._updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: priority,
      })
    })

  } catch (e) {
    console.error('⚠️ Sitemap generation encounter failed fetching CMS routes:', e)
  }

  return sitemapEntries
}
