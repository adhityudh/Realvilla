'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Ensures the 'preloading' class is removed and scroll is released
 * on pages that don't have a SplashIntro component.
 */
export default function ScrollReleaser() {
  const pathname = usePathname();

  useEffect(() => {
    const checkAndRelease = () => {
      const splash = document.querySelector('.splash-intro');
      if (!splash) {
        document.body.classList.remove('preloading');
        if ((window as any).lenis) (window as any).lenis.start();
      }
    };

    // Immediate check
    checkAndRelease();

    // Delayed check to account for dynamic mounting
    const timer = setTimeout(checkAndRelease, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
