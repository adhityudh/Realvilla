'use client';

import { useEffect, useState } from 'react';
import StretchArrow from '@/components/ui/StretchArrow';
import { iframeResizer } from 'iframe-resizer';

export default function ValuationSection() {
  const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    // Delay loading the iframe src to prevent it from stealing focus/scrolling on page load
    const timer = setTimeout(() => {
      setIframeSrc('https://realvilla.valuation.realadvisor.es/appraise?language=es');
    }, 2500); // Wait for intro animation to settle

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (iframeSrc) {
      iframeResizer({
        heightCalculationMethod: 'documentElementOffset',
        log: false,
        checkOrigin: false,
      }, '#valuationFrame');
    }
  }, [iframeSrc]);

  return (
    <section className="valuation-section" id="valuation">
      <div className="valuation-container">
        <div className="valuation-content">
          <div className="valuation-tagline">Know Your Worth</div>
          <h2 className="valuation-headline">Get an Accurate Property Valuation in Minutes.</h2>
          <p className="valuation-body">Backed by real-time Tenerife market data. Enter your details below for a professional, no-obligation estimate.</p>
          <div className="valuation-trust">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/shield.svg" alt="Shield" />
            <span>Powered by Local Market Intelligence</span>
          </div>
          <a href="#" className="service-cta valuation-cta-desktop">
            <span>Sell Your Property</span>
            <StretchArrow />
          </a>
        </div>
        <div className="valuation-form-wrapper">
          <div className="valuation-card">
            <div className="valuation-iframe-container" style={{ display: 'flex', flexDirection: 'column' }}>
              {iframeSrc && (
                <iframe
                  style={{ width: '100%', border: 'none' }}
                  title="valuation"
                  src={iframeSrc}
                  id="valuationFrame"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
        <a href="#" className="service-cta valuation-cta-mobile">
          <span>Sell Your Property</span>
          <StretchArrow />
        </a>
      </div>
    </section>
  );
}
