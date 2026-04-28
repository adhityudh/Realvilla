'use client';

import { NAV_LINKS } from '@/lib/letters';
import StretchArrow from '@/components/ui/StretchArrow';

export default function MobileNav() {
  return (
    <>
      <div className="mobile-pill-nav">
        {NAV_LINKS.map((link, i) => (
          <span key={link.label} style={{ display: 'contents' }}>
            <a href={link.href} className="pill-link"><span>{link.label}</span></a>
            {i < NAV_LINKS.length - 1 && <div className="pill-sep" />}
          </span>
        ))}
      </div>
      <div className="mobile-nav-overlay" id="mobileNavOverlay">
        {NAV_LINKS.map((link) => (
          <a key={link.label} href={link.href} className="nav-link-mobile">{link.label}</a>
        ))}
        <a href="#" className="btn-book-mobile">
          <span>Speak to an Expert</span>
          <StretchArrow />
        </a>
      </div>
    </>
  );
}
