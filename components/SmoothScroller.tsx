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
    const lenisInstance = new Lenis({
      duration: isMobile ? 0.8 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.6,
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothWheel: true,
      smoothTouch: true,
      touchMultiplier: isMobile ? 1.8 : 2,
      infinite: false,
    } as ConstructorParameters<typeof Lenis>[0]);

    (window as any).lenis = lenisInstance;
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenisInstance.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenisInstance.stop();
    lenisInstance.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    setTimeout(() => {
      window.scrollTo(0, 0);
      lenisInstance.scrollTo(0, { immediate: true });
    }, 50);

    setLenis(lenisInstance);

    return () => {
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
    
    // Give a small delay for the new content to be in the DOM
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, lenis]);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
