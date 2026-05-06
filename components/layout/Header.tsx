'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HEADER_LETTERS, NAV_LINKS } from '@/lib/letters';
import { useLenis } from '@/lib/LenisContext';
import Button from '@/components/ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * All scroll-driven header behaviours:
 *   - Wipe effect as the hero section exits (CSS var --header-wipe)
 *   - Dark-mode class once the header clears the hero bottom
 *   - Pill-mode class once the hero is fully scrolled past (desktop)
 *   - Nav links fade-in once the user is 30% into the hero (desktop)
 */
function useHeaderScrollAnimations(isHome: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const header = document.querySelector('.header') as HTMLElement;
    if (!header) return;

    const isMobile = window.innerWidth <= 1024;
    const heroTrigger = isHome ? '.main-hero' : '.buy-hero'; // Support buy-hero too if it exists

    // If neither exists, we might still want basic scroll behavior or none
    const hasHero = document.querySelector(heroTrigger);

    const headerBg = header.querySelector('.header-bg');
    const wipeAnim = gsap.to(headerBg, {
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: hasHero ? heroTrigger : 'body',
        start: isHome ? () => `bottom ${header.offsetHeight}px` : "50px top",
        end: isHome ? 'bottom top' : "150px top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    } as gsap.TweenVars);

    const colorST = ScrollTrigger.create({
      trigger: hasHero ? heroTrigger : 'body',
      start: hasHero 
        ? () => isMobile ? 'bottom top' : `bottom ${header.offsetHeight}px`
        : "top top",
      end: 'max',
      onEnter: () => {
        document.body.classList.add('header-dark-mode');
        if (isMobile) {
          gsap.to('.header-logo', { opacity: 1, visibility: 'visible', pointerEvents: 'auto', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        }
      },
      onLeaveBack: () => {
        if (isHome) {
          document.body.classList.remove('header-dark-mode');
          if (isMobile) {
            gsap.to('.header-logo', { opacity: 0, visibility: 'hidden', pointerEvents: 'none', duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
          }
        }
      },
    });

    // We don't add header-pill-mode immediately here anymore, 
    // so it can animate width/radius when pillST triggers.

    let pillST: ScrollTrigger | null = null;
    let navST: ScrollTrigger | null = null;

    pillST = ScrollTrigger.create({
      trigger: hasHero ? heroTrigger : 'body',
      start: isHome ? 'bottom top' : "150px top",
      end: 'max',
      onEnter: () => document.body.classList.add('header-pill-mode'),
      onLeaveBack: () => {
        document.body.classList.remove('header-pill-mode');
      },
    });

    if (!isMobile) {
      const headerNav = document.querySelector('.header-nav') as HTMLElement;
      if (headerNav && isHome) {
        const navLinks = headerNav.querySelectorAll('.nav-link');
        navST = ScrollTrigger.create({
          trigger: heroTrigger,
          start: '30% top',
          onEnter: () => {
            gsap.to(headerNav, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
            gsap.fromTo(
              navLinks,
              { opacity: 0, y: -15, filter: 'blur(5px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.08, ease: 'power2.out', overwrite: true },
            );
          },
          onLeaveBack: () => {
            gsap.to(headerNav, { opacity: 0, pointerEvents: 'none', duration: 0.3 });
            gsap.to(navLinks, { opacity: 0, y: -15, filter: 'blur(5px)', duration: 0.3 });
          },
        });
      }
    }

    return () => {
      wipeAnim.scrollTrigger?.kill();
      colorST.kill();
      pillST?.kill();
      navST?.kill();
    };
  }, [lenis, isHome]);
}

export default function Header({ settings }: { settings?: any }) {
  const pathname = usePathname();
  
  // Detect if we are on the Home page (e.g., /en, /es, /)
  const isHome = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.length <= 1; // It's home if it's just / or /[locale]
  }, [pathname]);

  const currentLocale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  useHeaderScrollAnimations(isHome);

  const navLinks = settings?.mainNav || NAV_LINKS.map(l => ({ label: l.label, link: l.href }));

  // Check if a nav link is active by comparing against current pathname
  const isLinkActive = (href: string) => {
    if (!href || href === '#') return false;
    // Strip locale prefix and trailing slash from pathname (e.g., /en/buy/ -> /buy)
    const stripped = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '').replace(/\/$/, '') || '/';
    const normalizedHref = href.replace(/\/$/, '') || '/';
    return stripped === normalizedHref || pathname.replace(/\/$/, '') === normalizedHref;
  };
  const cta = settings?.headerCta;

  return (
    <header className={`header ${!isHome ? 'header-subpage' : ''}`}>
      <div className="header-bg" />
      <div className="mobile-pill-nav">
        {navLinks.map((link: any, i: number) => (
          <span key={link.label} style={{ display: 'contents' }}>
            <a href={link.link} className={`pill-link ${isLinkActive(link.link) ? 'active' : ''}`}><span>{link.label}</span></a>
            {i < navLinks.length - 1 && <div className="pill-sep" />}
          </span>
        ))}
      </div>
      <div className="header-content">
        <a href={`/${currentLocale}`} className="header-logo" aria-label="Real Villa">
          {HEADER_LETTERS.map((letter, i) => (
            <img 
              key={i} 
              src={letter.svg} 
              className="header-letter-img" 
              alt="" 
            />
          ))}
        </a>
        <nav className="header-nav">
          {navLinks.map((link: any) => (
            <a key={link.label} href={link.link} className={`nav-link ${isLinkActive(link.link) ? 'active' : ''}`}>{link.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <LanguageSwitcher />
          {cta?.label && (
            <Button 
              label={cta.label} 
              href={cta.link || "#"} 
              variant="dark" 
              className="btn-book" 
            />
          )}
        </div>
        <button 
          className="hamburger" 
          id="hamburgerBtn" 
          aria-label="Menu"
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-mobile-menu'))}
        >
          <span></span><span></span>
        </button>
      </div>
    </header>
  );
}
