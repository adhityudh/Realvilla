'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortableText } from 'next-sanity';
import { urlForImage } from '@/sanity/lib/image';
import './GeneralProcessSection.css';

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

interface GeneralProcessSectionProps {
  data?: {
    disableEntranceAnimation?: boolean;
    disableHeaderEntranceAnimation?: boolean;
    id?: string;
    tagline?: string;
    headline?: string;
    intro?: any;
    timelineMode?: boolean;
    steps?: Step[];
  };
}

export default function GeneralProcessSection({ data }: GeneralProcessSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [colsCount, setColsCount] = useState(4);

  // 📐 Sync Column Heights Dynamically for Perfect Baseline Symmetry (Per Row)
  useEffect(() => {
    const syncLayoutHeights = () => {
      const steps = stepRefs.current.filter(Boolean) as HTMLDivElement[];
      if (steps.length === 0) return;
 
      // 1. Reset heights to auto first to calculate original scroll heights correctly
      steps.forEach(step => {
        const header = step.querySelector('.general-content-col') as HTMLElement;
        const body = step.querySelector('.general-step-body') as HTMLElement;
        if (header) header.style.height = 'auto';
        if (body) body.style.height = 'auto';
      });
 
      // 2. Synchronize heights PER ROW
      const totalRows = Math.ceil(steps.length / colsCount);
      for (let r = 0; r < totalRows; r++) {
        const startIndex = r * colsCount;
        const endIndex = Math.min(startIndex + colsCount, steps.length);
        const rowSteps = steps.slice(startIndex, endIndex);
 
        let maxHeaderH = 0;
        let maxBodyH = 0;
 
        // Find max heights inside this row
        rowSteps.forEach(step => {
          const header = step.querySelector('.general-content-col') as HTMLElement;
          const body = step.querySelector('.general-step-body') as HTMLElement;
          
          if (header) {
            const h = header.getBoundingClientRect().height;
            if (h > maxHeaderH) maxHeaderH = h;
          }
          if (body) {
            const h = body.getBoundingClientRect().height;
            if (h > maxBodyH) maxBodyH = h;
          }
        });
 
        // Apply max heights to all items in this specific row
        rowSteps.forEach(step => {
          const header = step.querySelector('.general-content-col') as HTMLElement;
          const body = step.querySelector('.general-step-body') as HTMLElement;
          
          if (header && maxHeaderH > 0) {
            header.style.height = `${maxHeaderH}px`;
          }
          if (body && maxBodyH > 0) {
            body.style.height = `${maxBodyH}px`;
          }
        });
      }
    };
 
    const handleSync = () => requestAnimationFrame(syncLayoutHeights);
    handleSync();
 
    window.addEventListener('resize', handleSync);
    return () => window.removeEventListener('resize', handleSync);
  }, [data, colsCount]);

  // 📱 Detect Active Grid Columns Responsively
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setColsCount(2); // Tablet & Mobile
      } else {
        setColsCount(4); // Desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  // ⚡ GSAP ScrollTrigger Sequence and Timelines
  useEffect(() => {
    if (!sectionRef.current || !data?.steps) return;

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) return;

    const ctx = gsap.context(() => {
      // 1. Animate Section Header
      if (!data?.disableHeaderEntranceAnimation) {
        gsap.fromTo(
          '.general-tagline, .general-headline, .general-intro',
          { y: 35, opacity: 0, filter: 'blur(10px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            stagger: 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: '.general-header',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 2. Animate step items entry
      if (!data?.disableEntranceAnimation) {
        const steps = stepRefs.current.filter(Boolean) as HTMLDivElement[];
        if (steps.length > 0) {
          gsap.fromTo(
            steps,
            { y: 40, opacity: 0, filter: 'blur(8px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.0,
              ease: 'power3.out',
              stagger: 0.1,
              scrollTrigger: {
                trigger: '.general-steps-list',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              }
            }
          );

          // 3. Ultra-Snappy, Row-Based Sequential Scroll-Driven Serpentine Timeline Animation
          if (data.timelineMode) {
            const totalRows = Math.ceil(steps.length / colsCount);

            for (let r = 0; r < totalRows; r++) {
              const startIndex = r * colsCount;
              const endIndex = Math.min(startIndex + colsCount, steps.length);
              const triggerEl = steps[startIndex];

              if (!triggerEl) continue;

              // Create a dedicated timeline for this specific horizontal row!
              const rowTl = gsap.timeline({
                scrollTrigger: {
                  trigger: triggerEl,
                  start: 'top 80%', // Starts flowing as soon as the row enters the lower viewport
                  end: 'top 30%',   // Completes 100% of row flow when row reaches upper viewport (extremely snappy!)
                  scrub: 1,
                }
              });

              // Animate steps sequentially inside this specific row
              for (let i = startIndex; i < endIndex; i++) {
                const isFirstInRow = i % colsCount === 0 && i > 0;
                const isLastStep = i === steps.length - 1;

                // A. If first in row, fill the left off-screen entering line first
                if (isFirstInRow) {
                  rowTl.fromTo(
                    `.step-left-progress-${i}`,
                    { scaleX: 0 },
                    { scaleX: 1, ease: 'none', duration: 0.2 }
                  );
                }

                // B. Spotlight highlight for the timeline dot node
                rowTl.to(
                  `.step-dot-${i}`,
                  {
                    backgroundColor: 'var(--color-gold-dark)',
                    borderColor: 'var(--color-gold-dark)',
                    boxShadow: '0 0 12px rgba(197, 160, 89, 0.8)',
                    scale: 1.3,
                    duration: 0.15,
                    ease: 'power2.out',
                  },
                  isFirstInRow ? '+=0' : '-=0.05'
                );

                // C. Spotlight highlight for the step number prefix (leaving title untouched)
                rowTl.to(
                  `.step-item-${i} .general-inline-number`,
                  {
                    color: 'var(--color-gold-dark)',
                    duration: 0.15,
                    ease: 'power2.out',
                  },
                  '-=0.15'
                );

                // D. Main horizontal segment connecting line to the next step
                if (!isLastStep && i < endIndex - 1) {
                  rowTl.fromTo(
                    `.step-main-progress-${i}`,
                    { scaleX: 0 },
                    { scaleX: 1, ease: 'none', duration: 0.4 }
                  );
                }

                // E. If last item of the row and NOT the last step overall, animate the stretch-right line
                if (i === endIndex - 1 && i % colsCount === colsCount - 1 && i < steps.length - 1) {
                  rowTl.fromTo(
                    `.step-main-progress-${i}`,
                    { scaleX: 0 },
                    { scaleX: 1, ease: 'none', duration: 0.3 }
                  );
                }
              }
            }
          }
        }
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [data, colsCount]);

  if (!data) return null;

  const { tagline, headline, intro, timelineMode, steps } = data;

  const pathname = usePathname() || '';
  const isMortgagePage = pathname.includes('/mortgage') || pathname.includes('/hipoteca');

  return (
    <section
      className={`general-process-section ${timelineMode ? 'general-timeline-mode' : ''}`}
      id={data?.id || 'process'}
      ref={sectionRef}
    >
      <div className="general-container">
        {/* Header */}
        {(tagline || headline || intro) && (
          <header className="general-header">
            {tagline && <span className="general-tagline">{tagline}</span>}
            {headline && <h2 className="general-headline">{headline}</h2>}
            {intro && (
              <div className="general-intro">
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
        <div className="general-steps-list">
          {steps?.map((step, index) => {
            const isLastInRow = index % colsCount === colsCount - 1;
            const isFirstInRow = index % colsCount === 0 && index > 0;
            const hasRowBelow = Math.floor(index / colsCount) < Math.floor((steps.length - 1) / colsCount);

            const isRightEdge = isLastInRow && hasRowBelow;
            const isLeftEdge = isFirstInRow;

            return (
              <div
                key={index}
                className={`general-step-item step-item-${index}`}
                ref={(el) => { stepRefs.current[index] = el; }}
              >
                {/* 🌟 Dynamic Serpentine Timeline Lines & Dots */}
                {timelineMode && (
                  <>
                    {/* Left entering off-screen line (First item of subsequent rows) */}
                    {isLeftEdge && (
                      <div className="general-timeline-left-line">
                        <div className={`general-timeline-progress step-left-progress-${index}`} />
                      </div>
                    )}

                    {/* Main connecting line segment */}
                    {(index < steps.length - 1) && (
                      <div className={`general-timeline-line ${isRightEdge ? 'stretch-right' : ''}`}>
                        <div className={`general-timeline-progress step-main-progress-${index}`} />
                      </div>
                    )}

                    {/* Dynamic Timeline Dot Node Node */}
                    <div className={`general-timeline-dot step-dot-${index}`} />
                  </>
                )}

                {/* 1. Content Side (Number & Title) */}
                <div className="general-content-col">
                  <div className="general-header-row">
                    {step.number && (
                      <span className="general-inline-number">
                        {isMortgagePage
                          ? (step.number.toUpperCase().startsWith('STEP') ? step.number : `STEP ${step.number}`)
                          : step.number}
                      </span>
                    )}
                    <h3 className="general-step-title">{step.title}</h3>
                  </div>
                </div>

                {/* 2. Media Side (Photo with Centered Icon) */}
                <div className="general-media-col">
                  <div className="general-image-inner">
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
                      <div className="general-placeholder" />
                    )}

                    {/* Icon Overlay in Center of Photo */}
                    {step.icon?.asset?.url && (
                      <div className="general-overlay-icon-wrapper">
                        <div className="general-overlay-icon">
                          <Image
                            src={step.icon.asset.url}
                            alt="Icon Overlay"
                            width={32}
                            height={32}
                            className="general-center-icon"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Text Description */}
                {step.description && (
                  <div className="general-step-body">
                    {typeof step.description === 'string' ? (
                      <p>{step.description}</p>
                    ) : (
                      <PortableText value={step.description} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
