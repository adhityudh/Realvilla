'use client';

import { HERO_CTAS } from '@/lib/letters';
import StretchArrow from '@/components/ui/StretchArrow';

export default function HeroCTAs({ className }: { className: string }) {
  return (
    <div className={className}>
      {HERO_CTAS.map((cta) => (
        <a key={cta.label} href="#" className="cta-link">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cta.icon} alt={cta.label} className="cta-icon" />
          <span>{cta.label}</span>
          <StretchArrow className="cta-stretch-arrow" />
        </a>
      ))}
    </div>
  );
}
