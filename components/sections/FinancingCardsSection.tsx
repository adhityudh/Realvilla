'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import './FinancingCardsSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FinancingCard {
  heading: string;
  copy: string;
}

interface FinancingCardsSectionProps {
  data?: {
    mainDescription?: string;
    backgroundImage?: {
      asset?: {
        url?: string;
      };
    };
    cta?: {
      label?: string;
      link?: string;
    };
    cards?: FinancingCard[];
  };
}

export default function FinancingCardsSection({ data }: FinancingCardsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // GSAP Staggered Smooth Revelations
    const elements = sectionRef.current.querySelectorAll(
      '.financing-main-content, .glass-card-item, .financing-cta-box'
    );

    gsap.fromTo(
      elements,
      { y: 40, opacity: 0, filter: 'blur(15px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.4,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // 🌌 Pure Luxury: Soft GSAP Scrubber for Subdued Background Motion
    const bgAsset = sectionRef.current.querySelector('.financing-bg-asset');
    if (bgAsset) {
      gsap.fromTo(
        bgAsset,
        { yPercent: -8 }, // 🔭 Starts slightly raised
        {
          yPercent: 8, // 🔭 Gently lowers down
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6, // 🧘‍♂️ Buttery slow deceleration tracker
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [data]);

  if (!data) return null;

  const { cards = [], mainDescription, cta } = data;

  const card1 = cards[0];
  const card2 = cards[1];
  const card3 = cards[2];
  const card4 = cards[3];

  const bgUrl = data.backgroundImage?.asset?.url || '/images/financing-bg.png';

  return (
    <section className="financing-cards-section" ref={sectionRef}>
      {/* Static luxury interior asset backdrop */}
      <div 
        className="financing-bg-asset" 
        style={{ backgroundImage: `url('${bgUrl}')` }} 
      />
      {/* Linear gradient darkener overlay */}
      <div className="financing-dark-overlay" />

      <div className="financing-container">
        {/* 🏆 Staggered 4-Column Asymmetric Grid Matrix */}
        <div className="financing-grid">

          {/* ── COL 1 (Left Anchor) ── */}
          <div className="financing-col col-1">
            {/* Row 1: Card 1 */}
            {card1 && (
              <div className="glass-card-item card-1">
                {/* 📐 Precision Top Notch Architectural Arc */}
                <svg className="glass-notch-svg notch-top" viewBox="0 0 36 18">
                  <path d="M0,0 A18,18 0 0,0 36,0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.25" />
                </svg>
                
                <div className="glass-card-inner">
                  <span className="glass-card-number">(1)</span>
                  <h3 className="glass-card-title">{card1.heading}</h3>
                  <p className="glass-card-copy">{card1.copy}</p>
                </div>

                {/* 📐 Precision Bottom Notch Architectural Arc */}
                <svg className="glass-notch-svg notch-bottom" viewBox="0 0 36 18">
                  <path d="M0,18 A18,18 0 0,1 36,18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.25" />
                </svg>
              </div>
            )}

            {/* Row 2: The Master CTA Block (Replaces Bottom-Left Card) */}
            <div className="financing-cta-box">
              {cta?.link ? (
                <Link href={cta.link} className="financing-cta-pill">
                  <span className="cta-pill-text">{cta.label || 'REQUEST A MORTGAGE STUDY'}</span>
                  <div className="cta-pill-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              ) : (
                <button 
                  className="financing-cta-pill"
                  onClick={() => {
                    const contactBtn = document.getElementById('nav-contact-btn');
                    if (contactBtn) {
                      (contactBtn as HTMLElement).click();
                    } else {
                      window.location.href = '#contact';
                    }
                  }}
                >
                  <span className="cta-pill-text">{cta?.label || 'REQUEST A MORTGAGE STUDY'}</span>
                  <div className="cta-pill-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* ── COL 2 (Mid-Left Anchor) ── */}
          <div className="financing-col col-2">
            {/* Row 1: Card 2 */}
            {card2 && (
              <div className="glass-card-item card-2">
                <svg className="glass-notch-svg notch-top" viewBox="0 0 36 18">
                  <path d="M0,0 A18,18 0 0,0 36,0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.25" />
                </svg>

                <div className="glass-card-inner">
                  <span className="glass-card-number">(2)</span>
                  <h3 className="glass-card-title">{card2.heading}</h3>
                  <p className="glass-card-copy">{card2.copy}</p>
                </div>

                <svg className="glass-notch-svg notch-bottom" viewBox="0 0 36 18">
                  <path d="M0,18 A18,18 0 0,1 36,18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.25" />
                </svg>
              </div>
            )}
            {/* Row 2: Empty Voids to Reveal Dark Luxury Space */}
          </div>

          {/* ── COL 3 (Mid-Right Anchor) ── */}
          <div className="financing-col col-3">
            {/* Row 1: Empty Space */}
            {/* Row 2: Card 3 */}
            {card3 && (
              <div className="glass-card-item card-3 align-bottom">
                <svg className="glass-notch-svg notch-top" viewBox="0 0 36 18">
                  <path d="M0,0 A18,18 0 0,0 36,0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.25" />
                </svg>

                <div className="glass-card-inner">
                  <span className="glass-card-number">(3)</span>
                  <h3 className="glass-card-title">{card3.heading}</h3>
                  <p className="glass-card-copy">{card3.copy}</p>
                </div>

                <svg className="glass-notch-svg notch-bottom" viewBox="0 0 36 18">
                  <path d="M0,18 A18,18 0 0,1 36,18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.25" />
                </svg>
              </div>
            )}
          </div>

          {/* ── COL 4 (Right Anchor) ── */}
          <div className="financing-col col-4">
            {/* Row 1: Main Description Block */}
            <div className="financing-main-content">
              <p className="financing-main-desc">{mainDescription}</p>
            </div>

            {/* Row 2: Card 4 */}
            {card4 && (
              <div className="glass-card-item card-4 align-bottom">
                <svg className="glass-notch-svg notch-top" viewBox="0 0 36 18">
                  <path d="M0,0 A18,18 0 0,0 36,0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.25" />
                </svg>

                <div className="glass-card-inner">
                  <span className="glass-card-number">(4)</span>
                  <h3 className="glass-card-title">{card4.heading}</h3>
                  <p className="glass-card-copy">{card4.copy}</p>
                </div>

                <svg className="glass-notch-svg notch-bottom" viewBox="0 0 36 18">
                  <path d="M0,18 A18,18 0 0,1 36,18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.25" />
                </svg>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
