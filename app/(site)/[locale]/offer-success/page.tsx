import { getDictionary } from '@/lib/get-dictionary';
import Link from 'next/link';

export default async function OfferSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; property?: string }>;
}) {
  const { locale } = await params;
  const { session_id, property } = await searchParams;
  const dict = await getDictionary(locale as any);
  const od = dict?.offer || {};

  const isEs = locale === 'es';
  const propertiesPath = isEs ? `/${locale}/propiedades` : `/${locale}/properties`;
  const propertyPath = property ? `${propertiesPath}/${property}` : propertiesPath;

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
        maxWidth: '560px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        padding: '3.5rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Gold top bar */}
        <div style={{
          width: '60px',
          height: '4px',
          background: 'var(--color-gold)',
          margin: '0 auto 2.5rem',
        }} />

        {/* Success icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(200, 180, 138, 0.12)',
          border: '2px solid var(--color-gold-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          fontSize: '1.75rem',
        }}>
          ✓
        </div>

        <h1 style={{
          fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
          fontWeight: 700,
          color: 'var(--text-black)',
          letterSpacing: '0.04em',
          margin: '0 0 1.25rem',
          textTransform: 'uppercase',
        }}>
          {od.success_title || 'Proposal Submitted!'}
        </h1>

        <p style={{
          fontFamily: 'var(--font-manrope), sans-serif',
          fontSize: 'var(--text-base-sm)',
          lineHeight: '1.7',
          color: 'var(--text-body)',
          margin: '0 0 2rem',
        }}>
          {od.success_subtitle || 'Your offer has been successfully registered and the deposit payment confirmed. You will receive a copy of your proposal document by email shortly.'}
        </p>

        {session_id && (
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-faint)',
            margin: '0 0 2.5rem',
            fontFamily: 'monospace',
          }}>
            {isEs ? 'Referencia' : 'Reference'}: {session_id}
          </p>
        )}

        <Link
          href={propertiesPath}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.9rem 2.5rem',
            background: 'var(--text-black)',
            color: 'var(--text-white)',
            fontFamily: 'var(--font-manrope), sans-serif',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'background 0.3s ease',
          }}
        >
          {od.success_close || 'Back to Properties'}
        </Link>
      </div>
    </main>
  );
}
