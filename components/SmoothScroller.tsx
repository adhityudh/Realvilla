'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { LenisContext } from '@/lib/LenisContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.body.classList.add('preloading');

    const isMobile = window.innerWidth <= 1024;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const lenisInstance = new Lenis({
      duration: isMobile ? 0.8 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.6,
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothWheel: true,
      // iOS Safari has GPU-accelerated native scroll — JS smooth touch overrides it
      // causing heavy CPU load and tab crashes on low-memory devices.
      smoothTouch: false,
      touchMultiplier: isMobile ? 1.8 : 2,
      infinite: false,
    } as ConstructorParameters<typeof Lenis>[0]);

    (window as any).lenis = lenisInstance;
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenisInstance.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Initial reset
    lenisInstance.stop();
    lenisInstance.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    // Repeated reset to fight browser scroll restoration
    const resetScroll = () => {
      window.scrollTo(0, 0);
      lenisInstance.scrollTo(0, { immediate: true });
    };

    const timers = [
      setTimeout(resetScroll, 0),
      setTimeout(resetScroll, 50),
      setTimeout(resetScroll, 150),
      setTimeout(resetScroll, 300),
    ];

    setLenis(lenisInstance);

    return () => {
      timers.forEach(clearTimeout);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      lenisInstance.destroy();
    };
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;
    
    // On every route change, reset scroll and refresh triggers
    lenis.scrollTo(0, { immediate: true });
    document.body.classList.add('preloading');

    // Fight native browser anchor scroll during preloading.
    // When navigating to /#section, the browser tries to jump to the anchor
    // synchronously before JS can stop it. We intercept the scroll event and
    // forcibly reset to 0 until the splash animation releases the lock.
    const lockScroll = () => {
      if (document.body.classList.contains('preloading')) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', lockScroll, { passive: true });
    
    // Give a small delay for the new content to be in the DOM
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', lockScroll);
    };
  }, [pathname, lenis]);

  // Scroll to hash target once preloading is released or hash changes
  useEffect(() => {
    if (!lenis) return;

    const handleScrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const targetId = hash.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        // Wait a tiny fraction of a second to ensure DOM renders fully
        setTimeout(() => {
          lenis.scrollTo(element, { offset: -80, duration: 1.2 });
        }, 100);
      }
    };

    let observer: MutationObserver | null = null;

    // If the page is already fully loaded and not preloading, check the hash immediately
    if (!document.body.classList.contains('preloading')) {
      handleScrollToHash();
    } else {
      // Set up MutationObserver to detect when the 'preloading' class is removed, then disconnect
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isPreloading = document.body.classList.contains('preloading');
            if (!isPreloading) {
              handleScrollToHash();
              observer?.disconnect();
              observer = null;
            }
          }
        });
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    // Also listen for manual hash changes (e.g. same page link click)
    window.addEventListener('hashchange', handleScrollToHash);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('hashchange', handleScrollToHash);
    };
  }, [lenis, pathname]);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
