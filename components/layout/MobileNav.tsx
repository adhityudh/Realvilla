'use client';

import { useEffect } from 'react';
import { NAV_LINKS } from '@/lib/letters';
import StretchArrow from '@/components/ui/StretchArrow';
import { useLenis } from '@/lib/LenisContext';
import './MobileNav.css';

export default function MobileNav() {
  const lenis = useLenis();

  useEffect(() => {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    if (hamburgerBtn && mobileNavOverlay) {
      hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        mobileNavOverlay.classList.contains('active') ? lenis?.stop() : lenis?.start();
      });
      mobileNavOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => { hamburgerBtn.classList.remove('active'); mobileNavOverlay.classList.remove('active'); document.body.classList.remove('menu-open'); lenis?.start(); });
      });
    }
  }, [lenis]);
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
