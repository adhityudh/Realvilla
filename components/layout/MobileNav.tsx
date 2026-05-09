'use client';

import { useEffect } from 'react';
import { NAV_LINKS } from '@/lib/letters';
import StretchArrow from '@/components/ui/StretchArrow';
import { useLenis } from '@/lib/LenisContext';
import './MobileNav.css';

export default function MobileNav({ settings, dict }: { settings?: any; dict?: any }) {
  const lenis = useLenis();

  useEffect(() => {
    // ... existing effect logic stays the same ...
    const handleToggle = () => {
      const hamburgerBtn = document.getElementById('hamburgerBtn');
      const mobileNavOverlay = document.getElementById('mobileNavOverlay');
      if (hamburgerBtn && mobileNavOverlay) {
        hamburgerBtn.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        mobileNavOverlay.classList.contains('active') ? lenis?.stop() : lenis?.start();
      }
    };

    const handleLinkClick = () => {
      const hamburgerBtn = document.getElementById('hamburgerBtn');
      const mobileNavOverlay = document.getElementById('mobileNavOverlay');
      if (hamburgerBtn && mobileNavOverlay) {
        hamburgerBtn.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        lenis?.start();
      }
    };

    window.addEventListener('toggle-mobile-menu', handleToggle);
    
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const links = mobileNavOverlay?.querySelectorAll('a');
    links?.forEach(link => link.addEventListener('click', handleLinkClick));

    return () => {
      window.removeEventListener('toggle-mobile-menu', handleToggle);
      links?.forEach(link => link.removeEventListener('click', handleLinkClick));
    };
  }, [lenis]);

  const defaultNavLinks = [
    { label: dict?.nav?.buy, link: '/buy' },
    { label: dict?.nav?.sell, link: '/#contact' },
    { label: dict?.nav?.invest, link: '/invest' },
    { label: dict?.nav?.mortgages, link: '/#contact' },
  ];

  const navLinks = settings?.mobileNav || defaultNavLinks;
  const cta = settings?.headerCta;

  return (
    <>
      <div className="mobile-nav-overlay" id="mobileNavOverlay">
        {navLinks.map((link: any) => (
          <a key={link.label} href={link.link} className="nav-link-mobile">{link.label}</a>
        ))}
        {cta?.label && (
          <a href={cta.link || "#"} className="btn-book-mobile">
            <span>{cta.label}</span>
            <StretchArrow />
          </a>
        )}
      </div>
    </>
  );
}
