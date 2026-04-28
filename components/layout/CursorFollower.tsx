'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import './CursorFollower.css';

export default function CursorFollower() {
  useEffect(() => {
    const cursorFollower = document.querySelector('.cursor-follower') as HTMLElement;
    if (cursorFollower && window.innerWidth > 1024) {
      gsap.set(cursorFollower, { xPercent: -50, yPercent: -50 });
      window.addEventListener('mousemove', (e) => { gsap.to(cursorFollower, { x: e.clientX + 40, y: e.clientY + 40, duration: 3.0, ease: 'expo.out', overwrite: 'auto' }); });
    }
  }, []);

  return <div className="cursor-follower" />;
}
