'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/lib/LenisContext';
import './HeroSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Global variable to persist device type across navigations (SPA)
let globalDevice: 'desktop' | 'mobile' | null = null;

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

export function getHeroRevealAnimation(tl: gsap.core.Timeline, isMobile: boolean) {
  const heroEl = document.querySelector('.main-hero') as HTMLElement;
  if (!heroEl) return;

  // BATCH READS
  const vW = window.innerWidth;
  const vH = window.innerHeight;
  const hRect = heroEl.getBoundingClientRect();
  
  const heroW = hRect.width;
  const heroH = hRect.height;
  const heroTop = hRect.top;

  const boxW = isMobile
    ? Math.min(vH * 0.3, vW * 0.5)
    : Math.min(vH * 0.35, vW * 0.8);
  const boxH = isMobile ? vH * 0.38 : vH * 0.5;
  
  const heroLocalCenterY = vH / 2 - heroTop;
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
          v.play().catch(() => { });
        }
      },
      onComplete: () => {
        gsap.set(heroEl, { clipPath: 'none', willChange: 'auto' });
      }
    },
    0,
  );

  tl.fromTo('.hero-bg-video', { scale: 1.1 }, { scale: 1, ease: 'power2.out', duration: 2.5 }, 0.2);
}

export default function HeroSection({ data, dict }: { data?: any; dict?: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pathname = usePathname();
  const [device, setDevice] = useState<'desktop' | 'mobile' | null>(globalDevice);

  if (!data) return null;

  const desktopVideoMP4 = data.desktopVideoMP4;
  const desktopVideoWebM = data.desktopVideoWebM;
  const mobileVideoMP4 = data.mobileVideoMP4;
  const mobileVideoWebM = data.mobileVideoWebM;

  useHeroScrollAnimations();

  useEffect(() => {
    if (globalDevice) return; // Only detect once

    const checkDevice = () => {
      const mobile = window.innerWidth <= 768;
      const current = mobile ? 'mobile' : 'desktop';
      globalDevice = current;
      setDevice(current);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const lastSrcRef = useRef<string | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !device) return;

    const currentSrc = device === 'mobile' ? mobileVideoMP4 : desktopVideoMP4;
    
    // Only call load() if the source has actually changed since the last mount/update
    if (lastSrcRef.current && lastSrcRef.current !== currentSrc) {
      v.load();
    }
    lastSrcRef.current = currentSrc;

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

    if (v.readyState >= 2) revealMedia();
    else {
      v.addEventListener('loadeddata', revealMedia);
      v.addEventListener('error', revealMedia); // Reveal even on error so it doesn't stay invisible
    }
    return () => { 
      v.removeEventListener('loadeddata', revealMedia); 
      v.removeEventListener('error', revealMedia);
    };
  }, [device, desktopVideoMP4, mobileVideoMP4]);

  const currentMP4 = device === 'mobile' ? mobileVideoMP4 : desktopVideoMP4;
  const currentWebM = device === 'mobile' ? mobileVideoWebM : desktopVideoWebM;

  return (
    <main className="main-hero" data-is-hero="true" id={data?.id || 'hero'}>
      <video 
        ref={videoRef} 
        className={`hero-bg-video ${!device ? 'is-loading' : ''}`} 
        preload="auto" 
        muted 
        playsInline 
        style={{ opacity: 0 }} // Start invisible, revealed by GSAP
      >
        {currentMP4 && <source src={currentMP4} type='video/mp4; codecs="hvc1"' />}
        {currentWebM && <source src={currentWebM} type="video/webm" />}
      </video>
      <div className="hero-overlay" />
    </main>
  );
}
