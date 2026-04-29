'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REALVILLA_LETTERS, HERO_CTAS } from '@/lib/letters';
import { useLenis } from '@/lib/LenisContext';
import Button from '@/components/ui/Button';
import './SplashIntro.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits .hero-title and .hero-subtitle into word-mask spans so the
 * orchestrator's intro timeline can animate them. Runs on mount before
 * lenis is ready so the DOM is prepared in time.
 */
function useSplashIntroAnimations() {
  const lenis = useLenis();

  // Text split — no lenis dependency, must run before intro timeline
  useEffect(() => {
    const splitText = (selector: string) => {
      document.querySelectorAll(selector).forEach((el) => {
        const words = (el as HTMLElement).innerText.split(' ');
        el.innerHTML = words
          .map((w) => `<span class="word-mask"><span class="word-inner">${w}</span></span>`)
          .join(' ');
      });
    };
    splitText('.hero-title');
    splitText('.hero-subtitle');
    gsap.set('.hero-title, .hero-subtitle', { opacity: 1 });
  }, []);

  // Mobile only: fade out hero description as user scrolls into the hero
  useEffect(() => {
    if (!lenis || window.innerWidth > 1024) return;
    const st = ScrollTrigger.create({
      trigger: '.main-hero',
      start: 'top top',
      end: '25% top',
      scrub: true,
      animation: gsap.to('.hero-description-area', { opacity: 0, ease: 'none' }),
    });
    return () => st.kill();
  }, [lenis]);
}

/**
 * Intro animations for the splash content (letters, titles, CTAs, etc.)
 */
export function getSplashIntroAnimations(tl: gsap.core.Timeline) {
  tl.to('.preloader-border-box', { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0);

  tl.fromTo(
    '.letter-wrapper',
    { opacity: 0, y: 40, filter: 'blur(10px)', scale: 0.95 },
    { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1.0, stagger: 0.05, ease: 'power3.out' },
    0.8,
  );

  tl.to(
    '.splash-bg',
    {
      yPercent: -100,
      ease: 'expo.inOut',
      duration: 1.5,
    },
    2.3,
  );

  tl.to('.text-white-reveal', { clipPath: 'inset(0% 0 0 0)', ease: 'expo.inOut', duration: 1.25 }, 2.3);

  tl.to(
    '.hero-ctas .cta-link, .mobile-hero-ctas .cta-link',
    { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'expo.out' },
    1,
  );

  tl.fromTo(
    '.hero-title .word-inner',
    { yPercent: 100, rotate: 5, filter: 'blur(10px)', opacity: 0 },
    { yPercent: 0, rotate: 0, filter: 'blur(0px)', opacity: 1, duration: 1.0, stagger: 0.08, ease: 'expo.out' },
    1.8,
  );

  tl.fromTo(
    '.hero-subtitle .word-inner',
    { yPercent: 50, opacity: 0, filter: 'blur(5px)' },
    { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.03, ease: 'power3.out' },
    2.0,
  );

  tl.to(
    '.hero-scroll',
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power3.out',
      onComplete: () => {
        const thumb = document.querySelector('.scroll-line-thumb') as HTMLElement;
        if (thumb) thumb.style.animationPlayState = 'running';
      },
    },
    2.2,
  );

  tl.set('.splash-intro', { pointerEvents: 'none' });
}

/**
 * Handles the desktop logo morph animation on scroll.
 */
export function setupLogoMorph(isMobile: boolean, heroEl: HTMLElement) {
  if (isMobile) return { morphTl: null, morphST: null };

  const splashIntro = document.querySelector('.splash-intro') as HTMLElement;
  const headerContent = document.querySelector('.header-content') as HTMLElement;
  const logoArea = document.querySelector('.logo-content-area') as HTMLElement;
  if (!logoArea || !splashIntro || !headerContent) return { morphTl: null, morphST: null };

  const logoAreaRect = logoArea.getBoundingClientRect();
  const headerRectLocal = headerContent.getBoundingClientRect();

  // Clean up any existing clone first (handles re-runs on soft-reload/HMR)
  const existingClone = document.getElementById('morph-breakout-logo');
  if (existingClone) existingClone.remove();

  // Create CLONE instead of moving the original to prevent flickering/blink
  const clonedLogo = logoArea.cloneNode(true) as HTMLElement;
  clonedLogo.id = 'morph-breakout-logo';
  
  // Set styles for the clone to match the original position exactly
  // IMPORTANT: For position: fixed, we use the raw rect values which are viewport-relative.
  // Adding window.scrollX/Y would incorrectly offset the logo if the page is scrolled.
  Object.assign(clonedLogo.style, {
    position: 'fixed',
    left: `${logoAreaRect.left}px`,
    top: `${logoAreaRect.top}px`,
    width: `${logoAreaRect.width}px`,
    margin: '0',
    padding: '0',
    zIndex: '200001',
    pointerEvents: 'none',
    willChange: 'transform',
    visibility: 'visible',
  });

  // Append clone to body
  document.body.appendChild(clonedLogo);

  // Get references from clone for animation
  const clonedWordContainer = clonedLogo.querySelector('.word-container') as HTMLElement;
  const clonedHeroCtas = clonedLogo.querySelector('.hero-ctas') as HTMLElement;
  const heroDesc = splashIntro.querySelector('.hero-description-area') as HTMLElement;

  const wordRect = clonedWordContainer.getBoundingClientRect();

  // Hide original logo area IMMEDIATELY to ensure seamless handover
  logoArea.style.visibility = 'hidden';
  logoArea.style.pointerEvents = 'none';

  const headerLogoHeight = window.innerWidth <= 480 ? 14 : 20;
  const targetScale = headerLogoHeight / wordRect.height;
  const targetLeftPx = 48;
  const initialWordCenterY = wordRect.top + wordRect.height / 2;
  const targetHeaderCenterY = headerRectLocal.top + headerRectLocal.height / 2;
  const scrollEnd = heroEl.offsetHeight;
  const wordLocalY = targetHeaderCenterY - initialWordCenterY + scrollEnd;
  const toX = targetLeftPx - wordRect.left;

  gsap.set(heroEl, { overflow: 'hidden', clipPath: 'inset(0px 0px 0px 0px round 0px)' });
  gsap.set(splashIntro, { overflow: 'visible' });
  
  // Initial state for cloned elements
  gsap.set(clonedLogo, { y: 0 });
  gsap.set(clonedHeroCtas, { opacity: 1, y: 0 });
  gsap.set(heroDesc, { opacity: 1 });
  gsap.set(clonedWordContainer, { x: 0, y: 0, scale: 1, transformOrigin: 'left center' });

  const morphTl = gsap.timeline({ paused: true });
  morphTl
    .to(clonedLogo, { y: -scrollEnd, duration: 1, ease: 'none' }, 0)
    .to(clonedHeroCtas, { opacity: 0, y: '250%', duration: 0.25, ease: 'none' }, 0)
    .to(heroDesc, { opacity: 0, duration: 0.5, ease: 'none' }, 0)
    .to(clonedWordContainer, { x: toX, y: wordLocalY, scale: targetScale, duration: 1, ease: 'none', force3D: true }, 0);

  const morphST = ScrollTrigger.create({
    trigger: '.main-hero',
    start: 'top top',
    end: '50% top',
    scrub: true,
    animation: morphTl,
    invalidateOnRefresh: true,
  });

  return { morphTl, morphST };
}


import { getHeroRevealAnimation } from './HeroSection';

/**
 * High-level timing and sequencing for the intro animations.
 * Replaces the separate lib/useAnimationOrchestrator.ts.
 */
function useIntroOrchestrator() {
  const lenis = useLenis();
  const initialized = useRef(false);

  useEffect(() => {
    if (!lenis || initialized.current) return;
    initialized.current = true;

    const isMobile = window.innerWidth <= 1024;
    let morphTlInstance: gsap.core.Timeline | null = null;
    let morphSTInstance: ScrollTrigger | null = null;

    const tl = gsap.timeline({
      delay: 0,
      paused: true,
      onStart: () => {
        document.body.classList.add('intro-active');
      },
      onComplete: () => {
        window.scrollTo(0, 0);
        lenis.scrollTo(0, { immediate: true });
        lenis.start();
        document.body.classList.remove('preloading');
        document.body.classList.remove('intro-active');
      },
    });

    const heroEl = document.querySelector('.main-hero') as HTMLElement;
    if (!heroEl) return;

    // Compose animations
    getHeroRevealAnimation(tl, isMobile);
    getSplashIntroAnimations(tl);

    const initMorph = () => {
      if (isMobile) return;
      const { morphTl, morphST } = setupLogoMorph(isMobile, heroEl);
      morphTlInstance = morphTl;
      morphSTInstance = morphST;
    };

    const originalOnComplete = tl.vars.onComplete;
    tl.eventCallback('onComplete', () => {
      if (originalOnComplete) originalOnComplete();
      initMorph();
      const skipOnScroll = () => {
        if (tl.progress() < 1) tl.progress(1);
        lenis.off('scroll', skipOnScroll);
      };
      lenis.on('scroll', skipOnScroll);
    });

    const handlePreloaderComplete = () => {
      tl.play();
    };

    window.addEventListener('preloader-complete', handlePreloaderComplete);

    return () => {
      window.removeEventListener('preloader-complete', handlePreloaderComplete);
      [morphTlInstance, morphSTInstance].forEach((inst) => {
        if (inst && 'kill' in inst) (inst as { kill: () => void }).kill();
      });
      const clone = document.getElementById('morph-breakout-logo');
      if (clone) clone.remove();
    };
  }, [lenis]);
}

export default function SplashIntro() {
  useSplashIntroAnimations();
  useIntroOrchestrator();

  // Handle preloader logic internally
  useEffect(() => {
    const preloaderRectEl = document.querySelector('#preloader-rect') as SVGRectElement;
    const preloaderBox = document.querySelector('.preloader-border-box') as HTMLElement;
    const preloaderShine = document.getElementById('preloader-shine');

    if (!preloaderRectEl || !preloaderBox) return;

    const finishPreloader = () => {
      const currentOffset = window.getComputedStyle(preloaderRectEl).strokeDashoffset;
      preloaderRectEl.style.animation = 'none';
      gsap.set(preloaderRectEl, { strokeDashoffset: currentOffset });
      if (preloaderShine) gsap.to(preloaderShine, { opacity: 0, duration: 0.4, ease: 'power2.out' });
      
      gsap.to(preloaderRectEl, {
        strokeDashoffset: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(preloaderBox, { 
            opacity: 0, 
            duration: 0.8, 
            ease: 'power2.out', 
            onComplete: () => {
              window.dispatchEvent(new CustomEvent('preloader-complete'));
            } 
          });
        },
      });
    };

    if (document.readyState === 'complete') {
      // Small delay to ensure everything is rendered
      setTimeout(finishPreloader, 100);
    } else {
      window.addEventListener('load', finishPreloader);
      return () => window.removeEventListener('load', finishPreloader);
    }
  }, []);

  return (
    <div className="splash-intro">
      <div className="splash-bg" />
      <div className="preloader-border-box">
        <svg id="preloader-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect id="preloader-rect" x="1" y="1" fill="none" stroke="#d4af37" strokeWidth="2" rx="36" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
          <rect id="preloader-shine" x="1" y="1" fill="none" stroke="#fff8e1" strokeWidth="3" rx="36" strokeLinecap="round" pathLength={100} />
        </svg>
      </div>
      <div className="logo-content-area">
        <div className="word-container">
          {REALVILLA_LETTERS.map((letter, i) => (
            <div key={i} className="letter-wrapper" style={{ '--letter-svg': `url('${letter.svg}')`, '--letter-w': letter.width } as React.CSSProperties}>
              <div className={`solid-text ${letter.colorClass}`} />
              <div className="solid-text text-white-reveal" />
            </div>
          ))}
        </div>
        <div className="hero-ctas">
          {HERO_CTAS.map((cta) => (
            <Button key={cta.label} label={cta.label} href="#" icon={cta.icon} variant="link" className="cta-link" />
          ))}
        </div>
      </div>
      <div className="hero-description-area">
        <h1 className="hero-title">Elevate Your Tenerife Lifestyle.</h1>
        <p className="hero-subtitle">Premium Tenerife real estate. Expert guidance for buyers, sellers, and investors looking for exclusive opportunities.</p>
        <div className="mobile-hero-ctas">
          {HERO_CTAS.map((cta) => (
            <Button key={cta.label} label={cta.label} href="#" icon={cta.icon} variant="link" className="cta-link" />
          ))}
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="scroll-line-track"><div className="scroll-line-thumb" /></div>
        </div>
      </div>
    </div>
  );
}
