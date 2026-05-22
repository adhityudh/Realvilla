import { getDictionary } from '@/lib/get-dictionary';
import Link from 'next/link';

export default async function OfferCancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as any);
  const od = dict?.offer || {};

  const isEs = locale === 'es';
  const propertiesPath = isEs ? `/${locale}/propiedades` : `/${locale}/properties`;

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-cream)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        padding: '3.5rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Neutral top bar */}
        <div style={{
          width: '60px',
          height: '4px',
          background: 'var(--border-base)',
          margin: '0 auto 2.5rem',
        }} />

        {/* Cancel icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.04)',
          border: '2px solid var(--border-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          fontSize: '1.75rem',
          color: 'var(--text-muted)',
        }}>
          ✕
        </div>

        <h1 style={{
          fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700,
          color: 'var(--text-black)',
          letterSpacing: '0.04em',
          margin: '0 0 1.25rem',
          textTransform: 'uppercase',
        }}>
          {od.cancel_title || 'Payment Cancelled'}
        </h1>

        <p style={{
          fontFamily: 'var(--font-manrope), sans-serif',
          fontSize: 'var(--text-base-sm)',
          lineHeight: '1.7',
          color: 'var(--text-body)',
          margin: '0 0 2.5rem',
        }}>
          {od.cancel_subtitle || 'Your payment was not completed. Your proposal has not been submitted. You can try again at any time.'}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href={propertiesPath}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.9rem 2rem',
              background: 'transparent',
              border: '1.5px solid var(--border-strong)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-manrope), sans-serif',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            {isEs ? 'Ver Propiedades' : 'View Properties'}
          </Link>
        </div>
      </div>
    </main>
  );
}
