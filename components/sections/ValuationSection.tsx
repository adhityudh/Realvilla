'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/ui/Button';
import iFrameResize from 'iframe-resizer/js/iframeResizer';
import './ValuationSection.css';

gsap.registerPlugin(ScrollTrigger);

export default function ValuationSection() {
  const [iframeSrc, setIframeSrc] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const elements = section.querySelectorAll('.valuation-tagline, .valuation-headline, .valuation-body, .valuation-trust, .valuation-cta-desktop, .valuation-cta-mobile, .valuation-card');

    // Initial state to prevent flash
    gsap.set(elements, { opacity: 0, y: 40, filter: 'blur(10px)' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'restart none none reverse'
      }
    });

    tl.fromTo(section.querySelectorAll('.valuation-tagline, .valuation-headline, .valuation-body, .valuation-trust, .valuation-cta-desktop, .valuation-cta-mobile'),
      { y: 40, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2, ease: 'expo.out' }
    );

    tl.fromTo(section.querySelector('.valuation-card'),
      { y: 40, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out' },
      '-=1.2'
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(st => st.kill());
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeSrc('https://realvilla.valuation.realadvisor.es/appraise?language=es');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
          <div className="valuation-tagline">Property Valuation</div>
          <h2 className="valuation-headline">Get an Accurate Property Valuation in Minutes.</h2>
          <p className="valuation-body">Backed by real-time Tenerife market data. Enter your details below for a professional, no-obligation estimate.</p>
          <div className="valuation-trust">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/shield.svg" alt="Shield" />
            <span>Your data is secure. <br />Valuations are powered by advanced analytics and Spain's leading experts.</span>
          </div>
          <Button label="Sell Your Property" href="#" className="service-cta valuation-cta-desktop" />
        </div>
        <div className="valuation-form-wrapper">
          <div className="valuation-card">
            <div className="valuation-iframe-container" style={{ position: 'relative', minHeight: '600px', background: '#fff' }}>
              {/* Loader - Always in the background (zIndex 1) */}
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
                    zIndex: 2, // Higher z-index to cover the loader once painted
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
        <Button label="Sell Your Property" href="#" className="service-cta valuation-cta-mobile" />
      </div>
    </section>
  );
}
