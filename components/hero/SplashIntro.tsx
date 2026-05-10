'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { preload } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REALVILLA_LETTERS } from '@/lib/letters';
import { useLenis } from '@/lib/LenisContext';
import Button from '@/components/ui/Button';
import './SplashIntro.css';
import { getHeroRevealAnimation } from './HeroSection';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Global state to track preloader completion across re-renders (SPA)
let globalPreloaderFinished = false;

function useSplashIntroAnimations() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    const splitText = (selector: string) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const htmlElement = el as HTMLElement;
        const text = htmlElement.textContent || '';
        if (htmlElement.querySelector('.word-mask')) return; // Avoid re-splitting

        const words = text.split(' ');
        const fragment = document.createDocumentFragment();
        
        words.forEach((w, i) => {
          const mask = document.createElement('span');
          mask.className = 'word-mask';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = w;
          mask.appendChild(inner);
          fragment.appendChild(mask);
          if (i < words.length - 1) {
            fragment.appendChild(document.createTextNode(' '));
          }
        });

        htmlElement.textContent = '';
        htmlElement.appendChild(fragment);
      });
    };
    splitText('.hero-title');
    splitText('.hero-subtitle');
    gsap.set('.hero-title, .hero-subtitle', { opacity: 1 });
  }, [pathname]);

  useEffect(() => {
    if (!lenis || window.innerWidth > 1024) return;
    
    // Ensure the logo area is fully visible before we start the scroll trigger
    gsap.set('.logo-content-area', { opacity: 1, visibility: 'visible' });

    const fadeTl = gsap.timeline();
    fadeTl
      .fromTo('.logo-content-area', 
        { opacity: 1, visibility: 'visible' },
        { opacity: 0, y: '-=40', ease: 'none' }, 
        0
      )
      .fromTo('.hero-title',
        { opacity: 1 },
        { opacity: 0, y: '-=30', ease: 'none' },
        0.1
      )
      .fromTo('.hero-subtitle',
        { opacity: 1 },
        { opacity: 0, y: '-=20', ease: 'none' },
        0.2
      )
      .fromTo('.mobile-hero-ctas',
        { opacity: 1 },
        { opacity: 0, y: '-=15', ease: 'none' },
        0.3
      )
      .fromTo('.hero-scroll',
        { opacity: 1 },
        { opacity: 0, y: '-=10', ease: 'none' },
        0.4
      );

    const st = ScrollTrigger.create({
      trigger: '.main-hero',
      start: 'top top',
      end: '50% top',
      scrub: true,
      animation: fadeTl,
    });
    return () => st.kill();
  }, [lenis]);
}

export function getSplashIntroAnimations(tl: gsap.core.Timeline, onReleaseScroll: () => void) {
  // Start logo reveal earlier in the timeline
  tl.fromTo(
    '.letter-wrapper',
    { opacity: 0, y: 40, filter: 'blur(10px)', scale: 0.95 },
    { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
    0.4, // Faster reveal (was 1.0)
  );

  tl.to('.preloader-border-box', { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0);

  tl.to(
    '.splash-bg',
    {
      yPercent: -100,
      ease: 'expo.inOut',
      duration: 1.2,
      onStart: onReleaseScroll,
    },
    1.8,
  );

  tl.to('.text-white-reveal', { clipPath: 'inset(0% 0 0 0)', ease: 'expo.inOut', duration: 1.0 }, 1.8);

  tl.to(
    '.hero-ctas .cta-link, .mobile-hero-ctas .cta-link',
    { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.08, ease: 'expo.out' },
    0.6,
  );

  tl.fromTo(
    '.hero-title .word-inner',
    { yPercent: 100, rotate: 5, filter: 'blur(10px)', opacity: 0 },
    { yPercent: 0, rotate: 0, filter: 'blur(0px)', opacity: 1, duration: 1.2, stagger: 0.1, ease: 'expo.out' },
    1.2,
  );

  tl.fromTo(
    '.hero-subtitle .word-inner',
    { yPercent: 50, opacity: 0, filter: 'blur(5px)' },
    { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.05, ease: 'power3.out' },
    1.4,
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
    1.6,
  );

  tl.set('.splash-intro', { pointerEvents: 'none' });
}

function breakoutLogoSynchronously(logoArea: HTMLElement, splashIntro: HTMLElement) {
  if (logoArea.id === 'morph-breakout-logo') return;
  
  // BATCH READS
  const logoAreaRect = logoArea.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(logoArea);
  const margin = computedStyle.margin;
  const scrollY = window.scrollY;

  // BATCH WRITES
  const spacer = logoArea.cloneNode(false) as HTMLElement;
  spacer.className = 'logo-content-area-spacer';
  Object.assign(spacer.style, {
    width: `${logoAreaRect.width}px`,
    height: `${logoAreaRect.height}px`,
    flexShrink: '0',
    visibility: 'hidden',
    pointerEvents: 'none',
    margin: margin
  });
  
  logoArea.parentNode?.insertBefore(spacer, logoArea);
  logoArea.id = 'morph-breakout-logo';
  
  // Set fixed position but keep invisible until ready
  Object.assign(logoArea.style, {
    position: 'fixed',
    left: `${logoAreaRect.left}px`,
    top: `${logoAreaRect.top + scrollY}px`,
    width: `${logoAreaRect.width}px`,
    margin: '0',
    padding: '0',
    zIndex: '300000',
    pointerEvents: 'none',
    willChange: 'transform',
    visibility: 'hidden',
    opacity: '0'
  });
  document.body.appendChild(logoArea);

  // Use GSAP to reveal synchronously to ensure no flicker
  gsap.set(logoArea, { visibility: 'visible', opacity: 1 });
}

export function setupLogoMorph(isMobile: boolean, heroEl: HTMLElement) {
  if (isMobile) return { morphTl: null, morphST: null };
  
  const logoArea = document.getElementById('morph-breakout-logo') as HTMLElement;
  const headerContent = document.querySelector('.header-content') as HTMLElement;
  const splashIntro = document.querySelector('.splash-intro') as HTMLElement;
  
  if (!logoArea || !headerContent || !splashIntro) return { morphTl: null, morphST: null };

  const wordContainer = logoArea.querySelector('.word-container') as HTMLElement;
  const heroCtas = logoArea.querySelector('.hero-ctas') as HTMLElement;
  const heroDesc = splashIntro.querySelector('.hero-description-area') as HTMLElement;

  if (!wordContainer || !heroCtas || !heroDesc) return { morphTl: null, morphST: null };

  // BATCH READS
  const headerRectLocal = headerContent.getBoundingClientRect();
  const wordRect = wordContainer.getBoundingClientRect();
  const logoAreaRect = logoArea.getBoundingClientRect();
  const scrollY = window.scrollY;
  const viewportWidth = window.innerWidth;
  const heroHeight = heroEl.offsetHeight;

  const headerLogoHeight = viewportWidth <= 480 ? 14 : 20;
  const targetScale = headerLogoHeight / wordRect.height;
  const targetLeftPx = 48;
  const initialWordCenterY = wordRect.top + scrollY + wordRect.height / 2;
  const targetHeaderCenterY = headerRectLocal.top + scrollY + headerRectLocal.height / 2;
  const wordLocalY = targetHeaderCenterY - initialWordCenterY + heroHeight;
  const toX = targetLeftPx - wordRect.left;

  // BATCH WRITES
  gsap.set(heroEl, { overflow: 'hidden', clipPath: 'inset(0px 0px 0px 0px round 0px)' });
  gsap.set(splashIntro, { overflow: 'visible' });
  gsap.set(logoArea, { y: 0, opacity: 1, visibility: 'visible' });
  gsap.set(wordContainer, { x: 0, y: 0, scale: 1, transformOrigin: 'left center' });

  const morphTl = gsap.timeline({ paused: true });
  morphTl
    .to(logoArea, { y: -heroHeight, duration: 1, ease: 'none', force3D: true, overwrite: 'auto' }, 0)
    .to(heroCtas, { opacity: 0, y: '250%', duration: 0.25, ease: 'none', force3D: true, overwrite: 'auto' }, 0)
    .to(heroDesc, { opacity: 0, duration: 0.5, ease: 'none', force3D: true, overwrite: 'auto' }, 0)
    .to(wordContainer, { x: toX, y: wordLocalY, scale: targetScale, duration: 1, ease: 'none', force3D: true, overwrite: 'auto' }, 0);

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

function useIntroOrchestrator() {
  const lenis = useLenis();
  const pathname = usePathname();
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // If we've already finished the preloader in this session, don't trigger it again
    // This prevents the 'stuck' state during SPA navigation back to home
    if (globalPreloaderFinished) {
      document.body.classList.remove('preloading');
      document.body.classList.remove('intro-active');
      return;
    }

    // Immediate cleanup for SPA navigations
    const existingLogo = document.getElementById('morph-breakout-logo');
    if (existingLogo) existingLogo.remove();
    document.body.classList.add('preloading');

    if (!lenis) return;

    // Lock scroll and reset to top for the new intro
    lenis.stop();
    lenis.scrollTo(0, { immediate: true });

    const isMobile = window.innerWidth <= 1024;
    let morphTlInstance: gsap.core.Timeline | null = null;
    let morphSTInstance: ScrollTrigger | null = null;

    const releaseScroll = () => {
      lenis.start();
      document.body.classList.remove('preloading');
      document.body.classList.remove('intro-active');
    };

    // Reload page on resize/zoom after intro is done to fix logo position.
    // Only react to WIDTH changes above a threshold — mobile browser chrome
    // collapse only changes innerHeight, and scrollbar appearance changes
    // innerWidth by ~15px, so we ignore those to avoid spurious reloads.
    const WIDTH_THRESHOLD = 16;
    let resizeTimer: ReturnType<typeof setTimeout>;
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (!globalPreloaderFinished) return; // Only after intro is complete
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastWidth) < WIDTH_THRESHOLD) return;
      lastWidth = currentWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        window.location.reload();
      }, 300);
    };
    window.addEventListener('resize', handleResize);

    let morphInitialized = false;
    const initMorph = () => {
      if (isMobile || morphInitialized) return;
      morphInitialized = true;
      const heroEl = document.querySelector('.main-hero') as HTMLElement;
      if (!heroEl) return;
      const { morphTl, morphST } = setupLogoMorph(isMobile, heroEl);
      morphTlInstance = morphTl;
      morphSTInstance = morphST;
    };

    ctx.current = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        onStart: () => { document.body.classList.add('intro-active'); },
        onComplete: () => { releaseScroll(); initMorph(); },
      });

      // Small delay to ensure siblings (HeroSection) are rendered
      const initTimer = setTimeout(() => {
        const heroEl = document.querySelector('.main-hero') as HTMLElement;
        const logoArea = document.querySelector('.logo-content-area') as HTMLElement;
        const splashIntro = document.querySelector('.splash-intro') as HTMLElement;
        if (!heroEl || !logoArea || !splashIntro) {
          // Safety fallback: if elements are missing, release scroll anyway
          releaseScroll();
          return;
        }
        
        if (!isMobile) breakoutLogoSynchronously(logoArea, splashIntro);
        else gsap.set(logoArea, { opacity: 1, visibility: 'visible' });

        getHeroRevealAnimation(tl, isMobile);
        getSplashIntroAnimations(tl, releaseScroll);
        tl.add(() => { initMorph(); }, 1.6);

        // This would only happen if preloader somehow finished before this timer
        if (globalPreloaderFinished) {
          tl.play();
        }
      }, 100); // Slightly longer delay for safer DOM check

      const handlePreloaderComplete = () => { tl.play(); };
      window.addEventListener('preloader-complete', handlePreloaderComplete);
      
      const handleSkip = () => {
        if (tl.time() < 1.4) return;
        if (tl.progress() < 1 && tl.isActive()) {
          gsap.to(tl, { progress: 1, duration: 0.6, ease: 'power2.out' });
          cleanupSkip();
        }
      };
      const cleanupSkip = () => {
        window.removeEventListener('wheel', handleSkip);
        window.removeEventListener('touchstart', handleSkip);
      };
      window.addEventListener('wheel', handleSkip);
      window.addEventListener('touchstart', handleSkip);

      // Store cleanup in context
      return () => {
        clearTimeout(initTimer);
        cleanupSkip();
        window.removeEventListener('preloader-complete', handlePreloaderComplete);
        morphTlInstance?.kill();
        morphSTInstance?.kill();
        const clone = document.getElementById('morph-breakout-logo');
        if (clone) clone.remove();
        // Crucial: release scroll if we unmount during animation
        releaseScroll();
      };
    });

    return () => {
      ctx.current?.revert();
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [lenis, pathname]); // Re-run on pathname change
}

export default function SplashIntro({ data, dict }: { data?: any, dict?: any }) {
  useSplashIntroAnimations();
  useIntroOrchestrator();

  if (!data) return null;

  const title = data.title;
  const subtitle = data.subtitle;
  const ctas = data.ctas;

  // Preload logo letters and CTA icons
  REALVILLA_LETTERS.forEach((letter) => {
    preload(letter.svg, { as: 'image' });
  });
  ctas?.forEach((cta: any) => {
    if (cta.icon) preload(cta.icon, { as: 'image' });
  });

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
        strokeDashoffset: 0, duration: 0.5, ease: 'power2.out',
        onComplete: () => {
          globalPreloaderFinished = true;
          gsap.to(preloaderBox, {
            opacity: 0, duration: 0.8, ease: 'power2.out',
            onComplete: () => { window.dispatchEvent(new CustomEvent('preloader-complete')); }
          });
        },
      });
    };
    const waitForDOM = new Promise((resolve) => {
      if (document.readyState === 'interactive' || document.readyState === 'complete') resolve(true);
      else document.addEventListener('DOMContentLoaded', () => resolve(true), { once: true });
    });
    const waitForVideo = new Promise((resolve) => {
      const checkVideo = () => {
        const video = document.querySelector('.hero-bg-video') as HTMLVideoElement;
        if (video) {
          if (video.readyState >= 2) resolve(true);
          else {
            video.addEventListener('loadeddata', () => resolve(true), { once: true });
            video.addEventListener('error', () => resolve(true), { once: true });
            video.addEventListener('stalled', () => resolve(true), { once: true });
          }
        } else {
          setTimeout(() => {
            const retry = document.querySelector('.hero-bg-video') as HTMLVideoElement;
            if (retry) {
              if (retry.readyState >= 2) resolve(true);
              else {
                retry.addEventListener('loadeddata', () => resolve(true), { once: true });
                retry.addEventListener('error', () => resolve(true), { once: true });
              }
            } else resolve(true);
          }, 100);
        }
      };
      checkVideo();
    });

    const waitForAssets = new Promise((resolve) => {
      const assets: string[] = [
        ...REALVILLA_LETTERS.map(l => l.svg),
        ...(ctas?.map((c: any) => c.icon).filter(Boolean) || [])
      ];
      
      if (assets.length === 0) {
        resolve(true);
        return;
      }

      let loadedCount = 0;
      const total = assets.length;

      const onAssetLoaded = () => {
        loadedCount++;
        if (loadedCount === total) resolve(true);
      };

      assets.forEach(src => {
        const img = new Image();
        img.onload = onAssetLoaded;
        img.onerror = onAssetLoaded; // Resolve anyway on error to avoid hanging
        img.src = src;
      });
    });

    const waitForVideoWithTimeout = Promise.race([
      waitForVideo,
      new Promise(resolve => setTimeout(resolve, 800)) // Shorter wait (was 2.5s)
    ]);

    const safetyTimeout = setTimeout(finishPreloader, 5000);
    // Wait for DOM, Assets (Logo/Icons), and the Video Background (with timeout)
    Promise.all([waitForDOM, waitForAssets, waitForVideoWithTimeout]).then(() => { 
      clearTimeout(safetyTimeout); 
      finishPreloader(); 
    });
    return () => clearTimeout(safetyTimeout);
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
          {ctas?.map((cta: any, i: number) => (
            <Button key={i} label={cta.label} href={cta.link || '#'} icon={cta.icon} variant="link" className="cta-link" priority={true} />
          ))}
        </div>
      </div>
      <div className="hero-description-area">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <div className="mobile-hero-ctas">
          {ctas?.map((cta: any, i: number) => (
            <Button key={i} label={cta.label} href={cta.link || '#'} icon={cta.icon} variant="link" className="cta-link" priority={true} />
          ))}
        </div>
        <div className="hero-scroll">
          <span>{dict?.hero?.scroll || 'Scroll'}</span>
          <div className="scroll-line-track"><div className="scroll-line-thumb" /></div>
        </div>
      </div>
    </div>
  );
}
