import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { locales } from '@/lib/i18n'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Ensure trailing slash removal for robust concatenation
  const rawBase = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const baseUrl = rawBase.replace(/\/$/, '')

  const sitemapEntries: MetadataRoute.Sitemap = []

  // 1. Add homepages for each language WITH official Hreflang cross-alternates
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          es: `${baseUrl}/es`,
        }
      }
    })
  })

  try {
    // 2. Fetch all dynamic pages and properties AND their connected translations from Sanity
    const query = `*[_type in ["page", "property"] && !(_id in path("drafts.**")) && defined(slug.current) && slug.current != "home"] {
      _type,
      "slug": slug.current,
      "language": coalesce(language, "en"),
      _updatedAt,
      "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value-> {
        "language": coalesce(language, "en"),
        "slug": slug.current
      }
    }`
    
    const results = await client.fetch(query, {}, { next: { revalidate: 3600 } })

    results.forEach((item: any) => {
      const lang = item.language === 'es' ? 'es' : 'en'
      let fullUrl = ''
      let priority = 0.7
      let alternates: any = undefined

      // Generate current URL
      if (item._type === 'property') {
        const routePrefix = lang === 'es' ? 'propiedades' : 'properties'
        fullUrl = `${baseUrl}/${lang}/${routePrefix}/${item.slug}`
        priority = 0.8
      } else {
        fullUrl = `${baseUrl}/${lang}/${item.slug}`
        priority = 0.6
      }

      // Construct explicit cross-language alternates mapped directly from real Sanity translation links
      if (item.translations && item.translations.length > 0) {
        const langMap: Record<string, string> = {}
        
        item.translations.forEach((t: any) => {
          const tLang = t.language === 'es' ? 'es' : 'en'
          
          if (item._type === 'property') {
            const tPrefix = tLang === 'es' ? 'propiedades' : 'properties'
            langMap[tLang] = `${baseUrl}/${tLang}/${tPrefix}/${t.slug}`
          } else {
            langMap[tLang] = `${baseUrl}/${tLang}/${t.slug}`
          }
        })

        // Ensure at least the current page and another are mapped to yield active alternates
        if (Object.keys(langMap).length > 0) {
          alternates = { languages: langMap }
        }
      }

      sitemapEntries.push({
        url: fullUrl,
        lastModified: item._updatedAt ? new Date(item._updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: priority,
        alternates: alternates,
      })
    })

  } catch (e) {
    console.error('⚠️ Sitemap generation encounter failed fetching CMS routes:', e)
  }

  return sitemapEntries
}
