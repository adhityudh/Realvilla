'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortableText } from 'next-sanity';
import { urlForImage } from '@/sanity/lib/image';
import './MortgageProcessSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Step {
  number?: string;
  title?: string;
  description?: any;
  image?: any;
  icon?: { asset: { _id: string; url: string } };
}

interface MortgageProcessSectionProps {
  data?: {
    tagline?: string;
    headline?: string;
    intro?: any;
    steps?: Step[];
  };
}

export default function MortgageProcessSection({ data }: MortgageProcessSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 📏 Synchronize Column Component Heights Dynamically for Perfect Baseline Symmetry
  useEffect(() => {
    const syncLayoutHeights = () => {
      const steps = stepRefs.current.filter(Boolean);
      if (steps.length === 0) return;

      // 📐 Grab direct element pools for Header Columns and Text Bodies
      const headers = steps.map(s => s?.querySelector('.mortgage-content-col') as HTMLElement).filter(Boolean);
      const bodies = steps.map(s => s?.querySelector('.mortgage-step-body') as HTMLElement).filter(Boolean);

      // 🧼 Reset to auto for fresh calculation on redraw/resize
      headers.forEach(el => { el.style.height = 'auto'; });
      bodies.forEach(el => { el.style.height = 'auto'; });

      // Only enforce synchronization on Viewports that aren't simple vertical stacks.
      // Since we use 4-cols (Desktop) and 2x2 Grid (Mobile/Tablet), syncing heights across
      // ALL items ensures absolute geometric rhythm on all devices!
      let maxHeaderH = 0;
      let maxBodyH = 0;

      headers.forEach(el => {
        const h = el.getBoundingClientRect().height;
        if (h > maxHeaderH) maxHeaderH = h;
      });

      bodies.forEach(el => {
        const h = el.getBoundingClientRect().height;
        if (h > maxBodyH) maxBodyH = h;
      });

      // Apply locked heights
      if (maxHeaderH > 0) {
        headers.forEach(el => { el.style.height = `${maxHeaderH}px`; });
      }
      if (maxBodyH > 0) {
        bodies.forEach(el => { el.style.height = `${maxBodyH}px`; });
      }
    };

    // Run immediately on mount/data-sync
    // Use requestAnimationFrame to wait for final layout rendering cycles!
    const handleSync = () => requestAnimationFrame(syncLayoutHeights);
    
    handleSync();

    // Register resize listener for dynamic window adjustment
    window.addEventListener('resize', handleSync);
    return () => window.removeEventListener('resize', handleSync);
  }, [data]);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Animate Section Header
    gsap.fromTo(
      sectionRef.current.querySelectorAll('.mortgage-tagline, .mortgage-headline, .mortgage-intro'),
      { y: 30, opacity: 0, filter: 'blur(10px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current.querySelector('.mortgage-header'),
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Animate steps in a unified, elegant staggered cascade as the horizontal row enters
    const stepsList = sectionRef.current.querySelector('.mortgage-steps-list');
    const steps = stepRefs.current.filter(Boolean);

    if (stepsList && steps.length > 0) {
      gsap.fromTo(
        steps,
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.4,
          ease: 'power3.out',
          stagger: 0.15, // 🪄 Highly responsive elegant sequential reveal
          scrollTrigger: {
            trigger: stepsList,
            start: 'top 85%', // ⚡ Fires reliably as the row grid crests the viewport
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    // Refresh triggers for correct spatial offsets
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [data]);

  if (!data) return null;

  const { tagline, headline, intro, steps } = data;

  return (
    <section className="mortgage-process-section" id="mortgage-process" ref={sectionRef}>
      <div className="mortgage-container">
        {/* Header */}
        {(tagline || headline || intro) && (
          <header className="mortgage-header">
            {tagline && <span className="mortgage-tagline">{tagline}</span>}
            {headline && <h2 className="mortgage-headline">{headline}</h2>}
            {intro && (
              <div className="mortgage-intro">
                {typeof intro === 'string' ? (
                  <p>{intro}</p>
                ) : (
                  <PortableText value={intro} />
                )}
              </div>
            )}
          </header>
        )}

        {/* Steps */}
        <div className="mortgage-steps-list">
          {steps?.map((step, index) => (
            <div
              key={index}
              className="mortgage-step-item"
              ref={(el) => { stepRefs.current[index] = el; }}
            >
              {/* 1. Content Side (Number & Title) */}
              <div className="mortgage-content-col">
                <div className="mortgage-header-row">
                  {step.number && <span className="mortgage-inline-number">{step.number}</span>}
                  <h3 className="mortgage-step-title">{step.title}</h3>
                </div>
              </div>

              {/* 2. Media Side (Photo with Centered Icon) */}
              <div className="mortgage-media-col">
                <div className="mortgage-image-inner">
                  {step.image ? (
                    <Image
                      src={urlForImage(step.image).width(400).height(400).url()}
                      alt={step.title || 'Step Background Image'}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      placeholder={step.image?.asset?.metadata?.lqip ? 'blur' : 'empty'}
                      blurDataURL={step.image?.asset?.metadata?.lqip}
                    />
                  ) : (
                    <div className="mortgage-placeholder" />
                  )}

                  {/* Icon Overlay in Center of Photo */}
                  {step.icon?.asset?.url && (
                    <div className="mortgage-overlay-icon-wrapper">
                      <div className="mortgage-overlay-icon">
                        <Image
                          src={step.icon.asset.url}
                          alt="Icon Overlay"
                          width={32}
                          height={32}
                          className="mortgage-center-icon"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Text Description */}
              {step.description && (
                <div className="mortgage-step-body">
                  {typeof step.description === 'string' ? (
                    <p>{step.description}</p>
                  ) : (
                    <PortableText value={step.description} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
