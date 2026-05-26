import { Locale, locales } from './i18n';

/**
 * Centralized route configuration for localized URLs
 * Add new routes here to automatically generate rewrites and redirects
 */
export const routes = {
  properties: {
    en: 'properties',
    es: 'propiedades',
  },
  blog: {
    en: 'blog',
    es: 'blog',
  },
  // Add more routes as needed
  // about: { en: 'about', es: 'acerca' },
} as const;

export type RouteKey = keyof typeof routes;

/**
 * Get the localized slug for a given route and locale
 * @example getLocalizedSlug('properties', 'es') // 'propiedades'
 */
export function getLocalizedSlug(route: RouteKey, locale: Locale): string {
  return routes[route][locale];
}

/**
 * Get the full localized path for a given route, locale, and optional slug
 * @example getLocalizedPath('properties', 'es') // '/es/propiedades'
 * @example getLocalizedPath('properties', 'es', 'villa-123') // '/es/propiedades/villa-123'
 */
export function getLocalizedPath(
  route: RouteKey,
  locale: Locale,
  slug?: string
): string {
  const localizedRoute = getLocalizedSlug(route, locale);
  const basePath = `/${locale}/${localizedRoute}`;
  return slug ? `${basePath}/${slug}` : basePath;
}

/**
 * Generate translation links for a route across all locales
 * Used for hreflang tags and language switchers
 * @example generateTranslations('properties') 
 * // [{ language: 'en', slug: 'properties' }, { language: 'es', slug: 'propiedades' }]
 */
export function generateTranslations(route: RouteKey): Array<{
  language: string;
  slug: string;
}> {
  return locales.map((locale) => ({
    language: locale,
    slug: getLocalizedSlug(route, locale),
  }));
}

/**
 * Generate translation links for a specific property/blog post across all locales
 * @param route - The route key (e.g., 'properties', 'blog')
 * @param translations - Array of translation objects from CMS with language and slug
 * @example generateItemTranslations('properties', [{ language: 'en', slug: 'villa-123' }, { language: 'es', slug: 'villa-123' }])
 */
export function generateItemTranslations(
  route: RouteKey,
  translations: Array<{ language: string; slug: string }>
): Array<{ language: string; slug: string; path: string }> {
  return translations.map((translation) => {
    const locale = translation.language as Locale;
    const routeSlug = getLocalizedSlug(route, locale);
    return {
      language: translation.language,
      slug: translation.slug,
      path: `/${locale}/${routeSlug}/${translation.slug}`,
    };
  });
}

/**
 * Get the route key from a localized slug
 * @example getRouteKeyFromSlug('propiedades', 'es') // 'properties'
 * @example getRouteKeyFromSlug('properties', 'en') // 'properties'
 */
export function getRouteKeyFromSlug(
  slug: string,
  locale: Locale
): RouteKey | null {
  for (const [key, translations] of Object.entries(routes)) {
    if (translations[locale] === slug) {
      return key as RouteKey;
    }
  }
  return null;
}

/**
 * Check if a route slug is valid for a given locale
 * @example isValidRouteSlug('propiedades', 'es') // true
 * @example isValidRouteSlug('properties', 'es') // false (should be 'propiedades')
 */
export function isValidRouteSlug(slug: string, locale: Locale): boolean {
  return getRouteKeyFromSlug(slug, locale) !== null;
}

/**
 * Get the correct localized slug for a route, even if given the wrong locale's slug
 * @example getCorrectSlug('properties', 'es') // 'propiedades'
 * @example getCorrectSlug('propiedades', 'en') // 'properties'
 */
export function getCorrectSlug(slug: string, targetLocale: Locale): string | null {
  // First, find which route this slug belongs to
  for (const locale of locales) {
    const routeKey = getRouteKeyFromSlug(slug, locale);
    if (routeKey) {
      return getLocalizedSlug(routeKey, targetLocale);
    }
  }
  return null;
}

/**
 * Generate all rewrite rules for Next.js config
 * Maps localized URLs to the canonical route handler
 */
export function getAllRouteRewrites(): Array<{
  source: string;
  destination: string;
}> {
  const rewrites: Array<{ source: string; destination: string }> = [];

  for (const [routeKey, translations] of Object.entries(routes)) {
    // For each locale, if the localized slug differs from English, create a rewrite
    for (const locale of locales) {
      const localizedSlug = translations[locale as Locale];
      const canonicalSlug = translations.en; // Use English as canonical

      // Only create rewrite if the localized slug differs from canonical
      if (localizedSlug !== canonicalSlug) {
        rewrites.push({
          source: `/${locale}/${localizedSlug}/:path*`,
          destination: `/${locale}/${canonicalSlug}/:path*`,
        });
      }
    }
  }

  return rewrites;
}

/**
 * Generate all redirect rules for Next.js config
 * Ensures users see the correct localized URL for their locale
 */
export function getAllRouteRedirects(): Array<{
  source: string;
  destination: string;
  permanent: boolean;
}> {
  const redirects: Array<{
    source: string;
    destination: string;
    permanent: boolean;
  }> = [];

  for (const [routeKey, translations] of Object.entries(routes)) {
    // For each locale, redirect wrong slug to correct slug
    for (const locale of locales) {
      const correctSlug = translations[locale as Locale];

      // Check all other locale slugs and redirect them if they're used with wrong locale
      for (const otherLocale of locales) {
        if (otherLocale === locale) continue;

        const wrongSlug = translations[otherLocale as Locale];

        // Only create redirect if slugs are different
        if (wrongSlug !== correctSlug) {
          redirects.push({
            source: `/${locale}/${wrongSlug}/:path*`,
            destination: `/${locale}/${correctSlug}/:path*`,
            permanent: true,
          });
        }
      }
    }
  }

  return redirects;
}
