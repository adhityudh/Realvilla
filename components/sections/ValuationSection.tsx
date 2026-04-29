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
  const [isIframeReady, setIsIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const valuationSection = document.querySelector('.valuation-section');
    if (valuationSection) {
      gsap.set('.valuation-tagline, .valuation-headline, .valuation-body, .valuation-trust, .valuation-cta-desktop, .valuation-cta-mobile, .valuation-card', { opacity: 0, y: 40, filter: 'blur(10px)' });
      ScrollTrigger.create({
        trigger: valuationSection, start: 'top 50%',
        onEnter: () => {
          gsap.to('.valuation-tagline, .valuation-headline, .valuation-body, .valuation-trust, .valuation-cta-desktop, .valuation-cta-mobile', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2, ease: 'expo.out', clearProps: 'all' });
          gsap.to('.valuation-card', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, delay: 0.5, ease: 'expo.out', clearProps: 'all' });
        },
        once: true
      });
    }
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
        onInit: () => setIsIframeReady(true),
        onResized: () => setIsIframeReady(true),
      }, iframeRef.current);

      return () => {
        if (components && components[0] && components[0].iFrameResizer) {
          components[0].iFrameResizer.close();
        }
      };
    }
  }, [iframeSrc]);

  return (
    <section className="valuation-section" id="valuation">
      <div className="valuation-container">
        <div className="valuation-content">
          <div className="valuation-tagline">Property Valuation</div>
          <h2 className="valuation-headline">Get an Accurate Property Valuation in Minutes.</h2>
          <p className="valuation-body">Backed by real-time Tenerife market data. Enter your details below for a professional, no-obligation estimate.</p>
          <div className="valuation-trust">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/shield.svg" alt="Shield" />
            <span>Powered by Local Market Intelligence</span>
          </div>
          <Button label="Sell Your Property" href="#" className="service-cta valuation-cta-desktop" />
        </div>
        <div className="valuation-form-wrapper">
          <div className="valuation-card">
            <div className="valuation-iframe-container" style={{ position: 'relative', minHeight: '600px', background: '#fff' }}>
              {/* Loader - visible until isIframeReady is true */}
              <div
                className="valuation-loader"
                style={{
                  opacity: isIframeReady ? 0 : 1,
                  visibility: isIframeReady ? 'hidden' : 'visible',
                  transition: 'opacity 0.5s ease, visibility 0.5s ease',
                  backgroundColor: '#fff',
                  zIndex: 200
                }}
              >
                <div className="loader-shimmer"></div>
                <p style={{ marginTop: '1rem', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Loading Valuation Tool...</p>
              </div>

              {iframeSrc && (
                <iframe
                  ref={iframeRef}
                  style={{
                    width: '100%',
                    border: 'none',
                    opacity: isIframeReady ? 1 : 0,
                    transition: 'opacity 1s ease, height 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'block'
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
