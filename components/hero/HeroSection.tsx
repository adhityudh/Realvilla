'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/lib/LenisContext';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

/** Parallax on the bg video + overlay darkening as the hero scrolls out. */
function useHeroScrollAnimations() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const isMobile = window.innerWidth <= 1024;

    const videoST = gsap.to('.hero-bg-video', {
      yPercent: isMobile ? 0 : 30,
      force3D: true,
      ease: 'none',
      scrollTrigger: isMobile ? undefined : {
        trigger: '.main-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });

    const overlayST = gsap.to('.hero-overlay', {
      opacity: 0.85,
      ease: 'none',
      scrollTrigger: {
        trigger: '.main-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });

    return () => {
      videoST.scrollTrigger?.kill();
      overlayST.scrollTrigger?.kill();
    };
  }, [lenis]);
}

/**
 * The intro reveal animation (clip-path opening).
 * Called by useAnimationOrchestrator to keep timings synchronized.
 */
export function getHeroRevealAnimation(tl: gsap.core.Timeline, isMobile: boolean) {
  const heroEl = document.querySelector('.main-hero') as HTMLElement;
  if (!heroEl) return;

  const heroRect = heroEl.getBoundingClientRect();
  const heroW = heroRect.width;
  const heroH = heroRect.height;
  const boxW = isMobile
    ? Math.min(window.innerHeight * 0.3, window.innerWidth * 0.5)
    : Math.min(window.innerHeight * 0.35, window.innerWidth * 0.8);
  const boxH = isMobile ? window.innerHeight * 0.38 : window.innerHeight * 0.5;
  const heroLocalCenterY = window.innerHeight / 2 - heroRect.top;
  const insetTop = heroLocalCenterY - boxH / 2;
  const insetBottom = heroH - (insetTop + boxH);
  const insetLR = (heroW - boxW) / 2;

  tl.fromTo(
    heroEl,
    { clipPath: `inset(${insetTop}px ${insetLR}px ${insetBottom}px ${insetLR}px round ${isMobile ? 22 : 24}px)` },
    {
      clipPath: 'inset(0px 0px 0px 0px round 0px)',
      duration: 1.8,
      ease: 'expo.inOut',
      onStart: () => {
        const v = heroEl.querySelector('.hero-bg-video') as HTMLVideoElement;
        if (v?.tagName?.toLowerCase() === 'video') {
          v.currentTime = 0;
          v.play().catch(() => {});
        }
      },
      onComplete: () => {
        // Performance Optimization: Set clip-path to 'none' once done.
        // This ensures it stays full-screen while removing the calculation overhead.
        gsap.set(heroEl, { clipPath: 'none', willChange: 'auto' });
      }
    },
    0,
  );

  tl.fromTo('.hero-bg-video', { scale: 1.1 }, { scale: 1, ease: 'power2.out', duration: 2.5 }, 0.2);
}

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useHeroScrollAnimations();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.innerWidth <= 768) v.src = '/videos/hero-mobile-video.mp4';
    
    const revealMedia = () => {
      gsap.to(v, {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        ease: 'expo.out',
        overwrite: 'auto',
        onComplete: () => {
          v.style.filter = 'none';
          v.style.willChange = 'transform';
        }
      });
    };

    v.currentTime = 0;
    if (v.readyState >= 2) revealMedia();
    else v.addEventListener('loadeddata', revealMedia);
    return () => { v.removeEventListener('loadeddata', revealMedia); };
  }, []);

  return (
    <main className="main-hero">
      <video ref={videoRef} className="hero-bg-video" src="/videos/hero-video.mp4" preload="auto" muted playsInline />
      <div className="hero-overlay" />
    </main>
  );
}
