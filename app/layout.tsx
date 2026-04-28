import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'RealVilla - Premium Real Estate in Tenerife',
  description: 'Premium Tenerife real estate. Expert guidance for buyers, sellers, and investors looking for exclusive opportunities.',
  openGraph: {
    title: 'RealVilla - Premium Real Estate in Tenerife',
    description: 'Elevate Your Tenerife Lifestyle. Premium real estate with expert guidance.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; } window.scrollTo(0, 0);` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
