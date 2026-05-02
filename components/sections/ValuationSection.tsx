'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/ui/Button';
import iFrameResize from 'iframe-resizer/js/iframeResizer';
import './ValuationSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ValuationSection({ data }: { data?: any }) {
  const [iframeSrc, setIframeSrc] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!data) return null;

  const tagline = data.tagline;
  const headline = data.headline;
  const body = data.body;
  const trustText = data.trustText;
  const ctaLabel = data.ctaLabel;
  const ctaLink = data.ctaLink;
  const finalIframeUrl = data.iframeUrl;

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const isMobile = window.innerWidth <= 1024;
    const elements = section.querySelectorAll('.valuation-tagline, .valuation-headline, .valuation-body, .valuation-trust, .valuation-cta-desktop, .valuation-cta-mobile');
    const card = section.querySelector('.valuation-card');

    gsap.set(elements, { opacity: 0, y: 40, filter: 'blur(10px)' });
    
    if (isMobile) {
      gsap.set(card, { opacity: 0, y: 40, filter: 'blur(10px)' });
    } else {
      gsap.set(card, { opacity: 1, y: 0, filter: 'blur(0px)' });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'restart none none reverse'
      }
    });

    tl.fromTo(elements,
      { y: 40, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2, ease: 'expo.out' }
    );

    if (isMobile) {
      tl.fromTo(card,
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out' },
        '-=1.2'
      );
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(st => st.kill());
    };
  }, []);

  useEffect(() => {
    if (!finalIframeUrl) return;
    const timer = setTimeout(() => {
      setIframeSrc(finalIframeUrl);
    }, 2000);
    return () => clearTimeout(timer);
  }, [finalIframeUrl]);

  useEffect(() => {
    if (iframeSrc && iframeRef.current) {
      const components = iFrameResize({
        heightCalculationMethod: 'lowestElement',
        checkOrigin: false,
      }, iframeRef.current);

      return () => {
        if (components && components[0] && components[0].iFrameResizer) {
          components[0].iFrameResizer.close();
        }
      };
    }
  }, [iframeSrc]);

  return (
    <section className="valuation-section" id="valuation" ref={sectionRef}>
      <div className="valuation-container">
        <div className="valuation-content">
          <div className="valuation-tagline">{tagline}</div>
          <h2 className="valuation-headline">{headline}</h2>
          <p className="valuation-body">{body}</p>
          <div className="valuation-trust">
            <Image src="/icons/shield.svg" alt="Shield" width={24} height={24} loading="lazy" unoptimized />
            <span>{trustText}</span>
          </div>
          {ctaLabel && <Button label={ctaLabel} href={ctaLink || '#'} className="service-cta valuation-cta-desktop" />}
        </div>
        <div className="valuation-form-wrapper">
          <div className="valuation-card">
            <div className="valuation-iframe-container" style={{ position: 'relative', minHeight: '600px', background: '#fff' }}>
              <div
                className="valuation-loader"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#fff',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              >
                <div className="loader-shimmer"></div>
                <p style={{ marginTop: '1rem', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Loading Valuation Tool...</p>
              </div>

              {iframeSrc && (
                <iframe
                  ref={iframeRef}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    width: '100%',
                    border: 'none',
                    opacity: 1,
                    display: 'block',
                    background: 'transparent'
                  }}
                  title="valuation"
                  src={iframeSrc}
                  id="valuationFrame"
                />
              )}
            </div>
          </div>
        </div>
        {ctaLabel && <Button label={ctaLabel} href={ctaLink || '#'} className="service-cta valuation-cta-mobile" />}
      </div>
    </section>
  );
}
