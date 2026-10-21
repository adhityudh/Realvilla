'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import './RealAdvisorWidget.css';

const RealAdvisorWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (container.querySelector('reviews-widget')) return;

    const widget = document.createElement('reviews-widget');
    widget.setAttribute('data-team-id', 'cc5fad1c-e0cd-11f0-9d5b-6f2fe46d9670');
    widget.setAttribute('data-layout', 'widget4');
    widget.setAttribute('data-lang', 'es');
    container.appendChild(widget);
  }, []);

  return (
    <>
      <Script
        id="realadvisor-reviews-widget"
        src="https://cdn.realadvisor.com/reviews-widget-build/bundle.js"
        strategy="lazyOnload"
      />
      <section className="realadvisor-widget-section" aria-label="RealAdvisor reviews">
        <div className="realadvisor-widget-container">
          <div ref={containerRef} className="realadvisor-widget-mount" />
        </div>
      </section>
    </>
  );
};

export default RealAdvisorWidget;