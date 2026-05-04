import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { locales } from '@/lib/i18n'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''

  // Add homepage for each locale
  const sitemapEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }))

  // Future proof: Fetch all pages and properties from Sanity
  // const query = `*[_type in ["page", "property"] && defined(slug.current) && slug.current != "home"] {
  //   _type,
  //   "slug": slug.current,
  //   language,
  //   _updatedAt
  // }`
  // const results = await client.fetch(query)
  // results.forEach((item: any) => { ... })

  return sitemapEntries
}
