import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { VisualEditing } from 'next-sanity/visual-editing';
import { draftMode } from 'next/headers';
import Script from 'next/script';
import '../../globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

import { getGlobalSettings, constructMetadata, getSchemaData } from '@/lib/metadata';
import JsonLd from '@/components/seo/JsonLd';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getGlobalSettings(locale);
  
  return constructMetadata(undefined, settings?.seo, `/${locale}`);
}

export default async function RootLayout({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isDraftMode = (await draftMode()).isEnabled;
  const settings = await getGlobalSettings(locale);

  return (
    <html lang={locale} className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <Script
          id="scroll-restoration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              window.scrollTo(0, 0);
            `,
          }}
        />
        {children}
        <JsonLd data={getSchemaData(settings, `/${locale}`)} />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
