'use client';

import { REALVILLA_LETTERS } from '@/lib/letters';
import HeroCTAs from './HeroCTAs';

export default function SplashIntro() {
  return (
    <div className="splash-intro">
      <div className="splash-bg" />
      <div className="preloader-border-box">
        <svg id="preloader-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect id="preloader-rect" x="1" y="1" fill="none" stroke="#d4af37" strokeWidth="2" rx="36" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
          <rect id="preloader-shine" x="1" y="1" fill="none" stroke="#fff8e1" strokeWidth="3" rx="36" strokeLinecap="round" pathLength={100} />
        </svg>
      </div>
      <div className="logo-content-area">
        <div className="word-container">
          {REALVILLA_LETTERS.map((letter, i) => (
            <div key={i} className="letter-wrapper" style={{ '--letter-svg': `url('${letter.svg}')`, '--letter-w': letter.width } as React.CSSProperties}>
              <div className={`solid-text ${letter.colorClass}`} />
              <div className="solid-text text-white-reveal" />
            </div>
          ))}
        </div>
        <HeroCTAs className="hero-ctas" />
      </div>
      <div className="hero-description-area">
        <h1 className="hero-title">Elevate Your Tenerife Lifestyle.</h1>
        <p className="hero-subtitle">Premium Tenerife real estate. Expert guidance for buyers, sellers, and investors looking for exclusive opportunities.</p>
        <HeroCTAs className="mobile-hero-ctas" />
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="scroll-line-track"><div className="scroll-line-thumb" /></div>
        </div>
      </div>
    </div>
  );
}
