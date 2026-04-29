'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HEADER_LETTERS, NAV_LINKS } from '@/lib/letters';
import { useLenis } from '@/lib/LenisContext';
import Button from '@/components/ui/Button';
import './Header.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * All scroll-driven header behaviours:
 *   - Wipe effect as the hero section exits (CSS var --header-wipe)
 *   - Dark-mode class once the header clears the hero bottom
 *   - Pill-mode class once the hero is fully scrolled past (desktop)
 *   - Nav links fade-in once the user is 30% into the hero (desktop)
 */
function useHeaderScrollAnimations() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const header = document.querySelector('.header') as HTMLElement;
    if (!header) return;

    const isMobile = window.innerWidth <= 1024;

    const wipeAnim = gsap.to(header, {
      '--header-wipe': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.main-hero',
        start: () => `bottom ${header.offsetHeight}px`,
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    } as gsap.TweenVars);

    const colorST = ScrollTrigger.create({
      trigger: '.main-hero',
      start: () => `bottom ${header.offsetHeight}px`,
      end: 'max',
      onEnter: () => document.body.classList.add('header-dark-mode'),
      onLeaveBack: () => document.body.classList.remove('header-dark-mode'),
    });

    let pillST: ScrollTrigger | null = null;
    let navST: ScrollTrigger | null = null;

    if (!isMobile) {
      pillST = ScrollTrigger.create({
        trigger: '.main-hero',
        start: 'bottom top',
        end: 'max',
        onEnter: () => document.body.classList.add('header-pill-mode'),
        onLeaveBack: () => document.body.classList.remove('header-pill-mode'),
      });

      const headerNav = document.querySelector('.header-nav') as HTMLElement;
      if (headerNav) {
        const navLinks = headerNav.querySelectorAll('.nav-link');
        navST = ScrollTrigger.create({
          trigger: '.main-hero',
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
  }, [lenis]);
}

export default function Header() {
  useHeaderScrollAnimations();

  return (
    <header className="header">
      <div className="header-content">
        <a href="/" className="header-logo">
          {HEADER_LETTERS.map((letter, i) => (
            <div key={i} className="header-letter" style={{ '--letter-svg': `url('${letter.svg}')`, '--letter-w': letter.width } as React.CSSProperties} />
          ))}
        </a>
        <nav className="header-nav">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="nav-link">{link.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <Button label="Speak to an Expert" href="#" variant="dark" className="btn-book" />
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
