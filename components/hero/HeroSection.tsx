'use client';

import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.innerWidth <= 768) v.src = '/videos/hero-mobile-video.mp4';
    const revealMedia = () => { v.style.opacity = '1'; v.style.filter = 'blur(0px)'; };
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
