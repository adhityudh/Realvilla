import React from 'react';

/**
 * Safely intercept clicks on anchor URLs, purges hidden zero-width/Unicode characters, 
 * and triggers a smooth scrolling motion via Lenis or browser native fallback.
 * 
 * @param e The React mouse event to intercept and prevent default
 * @param url The raw URL or anchor hash to process
 * @param offset Pixels offset (usually compensates for sticky header height)
 * @returns `true` if the target element was found and scrolled, `false` otherwise.
 */
export const smoothScrollToAnchor = (
  e: React.MouseEvent<any>, 
  url: string, 
  offset: number = -80
): boolean => {
  if (!url) return false;

  // 🧹 EXTREME PURGE: Clear invisible zero-width characters, control tags & trailing spaces
  const cleanUrl = String(url)
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // purge zero-width sequences
    .replace(/[^\x20-\x7E]/g, '') // purge non-ascii/unprintable chars
    .trim();

  // Guard: Verify if the URL points to a local page anchor on the same page/pathname
  if (typeof window !== 'undefined') {
    const isLocalAnchor = (val: string): boolean => {
      if (val.startsWith('#')) return true;
      if (!val.includes('#')) return false;

      const normalizePath = (p: string) => p.replace(/\/$/, '') || '/';

      if (val.startsWith('http://') || val.startsWith('https://')) {
        try {
          const parsed = new URL(val);
          const current = new URL(window.location.href);
          return parsed.origin === current.origin && normalizePath(parsed.pathname) === normalizePath(current.pathname);
        } catch {
          return false;
        }
      }

      if (val.startsWith('mailto:') || val.startsWith('tel:') || val.startsWith('javascript:')) {
        return false;
      }

      try {
        const parsed = new URL(val, window.location.origin);
        const current = new URL(window.location.href);
        return normalizePath(parsed.pathname) === normalizePath(current.pathname);
      } catch {
        return false;
      }
    };

    if (!isLocalAnchor(cleanUrl)) {
      return false;
    }
  }

  const hashIndex = cleanUrl.indexOf('#');
  if (hashIndex !== -1) {
    const anchorId = cleanUrl.substring(hashIndex + 1).trim();
    if (anchorId) {
      const el = document.getElementById(anchorId);
      if (el) {
        e.preventDefault();
        
        // Prioritize the global Lenis instance for premium eases
        if (typeof window !== 'undefined' && (window as any).lenis) {
          (window as any).lenis.scrollTo(el, { offset, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        return true; // Successfully handled local scroll
      }
    }
  }

  return false; // Element target not found in the current DOM viewport
};
