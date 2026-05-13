'use client';

import { useEffect } from 'react';

export default function FooterPaddingSetter({ active }: { active?: boolean }) {
  useEffect(() => {
    if (!active) return;

    document.body.classList.add('footer-force-high-padding');
    return () => {
      document.body.classList.remove('footer-force-high-padding');
    };
  }, [active]);

  return null;
}
