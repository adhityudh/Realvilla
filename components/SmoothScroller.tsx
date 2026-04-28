'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { LenisContext } from '@/lib/LenisContext';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

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

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
