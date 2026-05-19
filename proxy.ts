import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest) {
  try {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    
    // Filter out wildcard '*' and invalid values to prevent Intl.getCanonicalLocales from throwing RangeError
    const validLanguages = Array.isArray(languages)
      ? languages.filter((lang) => lang && lang !== '*')
      : [];

    if (validLanguages.length === 0) {
      return defaultLocale;
    }

    return match(validLanguages, locales as unknown as string[], defaultLocale);
  } catch (error) {
    console.error('Error matching locale, falling back to default:', error);
    return defaultLocale;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  // Return redirect response
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, studio, static assets, metadata)
    '/((?!api|_next/static|_next/image|studio|favicon.ico|sitemap.xml|robots.txt|videos|images|letters|icons).*)',
  ],
};
