'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HEADER_LETTERS } from '@/lib/letters';
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
function useHeaderScrollAnimations(isHome: boolean, pathname: string) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    let timeoutId = setTimeout(() => {
      const header = document.querySelector('.header') as HTMLElement;
      if (!header) return;

      const isMobile = window.innerWidth <= 1024;
      
      // Decoupled unified selector for any section acting as the topmost hero
      const heroTrigger = '[data-is-hero="true"]';

      // Ensure we capture DOM only AFTER the route has settled.
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
        onRefresh: (self) => {
          // Catch case where we loaded already below trigger line
          if (self.isActive) {
             document.body.classList.add('header-dark-mode');
          } else if (isHome) {
             document.body.classList.remove('header-dark-mode');
          }
        }
      });

      const pillST = ScrollTrigger.create({
        trigger: hasHero ? heroTrigger : 'body',
        start: isHome ? 'bottom top' : "150px top",
        end: 'max',
        onEnter: () => document.body.classList.add('header-pill-mode'),
        onLeaveBack: () => {
          document.body.classList.remove('header-pill-mode');
        },
        onRefresh: (self) => {
          if (self.isActive) document.body.classList.add('header-pill-mode');
        }
      });

      let navST: ScrollTrigger | null = null;
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

      // Stash cleanup refs on custom global storage on the elements or via context if needed, 
      // but storing on window for ease of removal loop is a robust fallback here.
      (header as any)._stWipe = wipeAnim;
      (header as any)._stColor = colorST;
      (header as any)._stPill = pillST;
      (header as any)._stNav = navST;

    }, 80); // Sufficient buffer for Next.js render paint.

    return () => {
      clearTimeout(timeoutId);
      const header = document.querySelector('.header') as HTMLElement;
      if (header) {
        const h = header as any;
        h._stWipe?.scrollTrigger?.kill();
        h._stWipe?.kill();
        h._stColor?.kill();
        h._stPill?.kill();
        h._stNav?.kill();
      }
      
      // Hard reset generic system state to clean state on unmount before retrigger
      document.body.classList.remove('header-dark-mode', 'header-pill-mode');
      const headerBg = document.querySelector('.header .header-bg');
      if (headerBg) gsap.set(headerBg, { opacity: 0, clearProps: 'opacity' });
    };
  }, [lenis, isHome, pathname]);
}

export default function Header({ settings, dict }: { settings?: any; dict?: any }) {
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

  useHeaderScrollAnimations(isHome, pathname);

  const navLinks = settings?.mainNav;

  // Check if a nav link is active by comparing against current pathname
  const isLinkActive = (href: string) => {
    if (!href || href === '#') return false;
    // Strip locale prefix and trailing slash from pathname (e.g., /en/buy/ -> /buy)
    const stripped = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '').replace(/\/$/, '') || '/';
    const normalizedHref = href.replace(/\/$/, '') || '/';
    return stripped === normalizedHref || pathname.replace(/\/$/, '') === normalizedHref;
  };
  const cta = settings?.headerCta;

  const resolveHref = (href?: string) => {
    if (!href) return '#';
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      if (!path) return href;
      const normalizedPath = path.replace(/\/$/, '') || '/';
      const normalizedCurrent = pathname?.replace(/\/$/, '') || '/';
      if (normalizedPath === normalizedCurrent) {
        return `#${hash}`;
      }
    }
    return href;
  };

  const SmartLink = ({ href, children, className }: { href?: string, children: React.ReactNode, className?: string }) => {
    const resolved = resolveHref(href);
    const isHash = resolved.startsWith('#') && resolved.length > 1;

    return (
      <a 
        href={resolved} 
        className={className}
        onClick={(e) => {
          if (isHash) {
            e.preventDefault();
            const targetElement = document.getElementById(resolved.substring(1));
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
              window.history.pushState(null, '', resolved);
            }
          }
        }}
      >
        {children}
      </a>
    );
  };

  return (
    <header className={`header ${!isHome ? 'header-subpage' : ''}`}>
      <div className="header-bg" />
      <div className="mobile-pill-nav">
        {navLinks.map((link: any) => (
          <SmartLink key={link.label} href={link.link} className={`pill-link ${isLinkActive(link.link) ? 'active' : ''}`}>
            <span>{link.label}</span>
          </SmartLink>
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
            <SmartLink key={link.label} href={link.link} className={`nav-link ${isLinkActive(link.link) ? 'active' : ''}`}>{link.label}</SmartLink>
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
