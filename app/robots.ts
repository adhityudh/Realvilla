import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  
  // Hanya izinkan indexing jika domain sesuai dengan yang ada di env
  // Dan pastikan bukan domain vercel preview
  const isProduction = !!baseUrl && !baseUrl.includes('vercel.app')

  return {
    rules: {
      userAgent: '*',
      allow: isProduction ? '/' : undefined,
      disallow: isProduction ? ['/studio/', '/api/'] : '/',
    },
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : undefined,
  }
}
