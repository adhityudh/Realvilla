'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortableText } from 'next-sanity';
import { urlForImage } from '@/sanity/lib/image';
import './SellProcessSection.css';

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

interface SellProcessSectionProps {
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

export default function SellProcessSection({ data }: SellProcessSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [colsCount, setColsCount] = useState(2);

  // 📐 Sync Column Heights Dynamically for Perfect Baseline Symmetry (Per Row)
  useEffect(() => {
    const syncLayoutHeights = () => {
      const steps = stepRefs.current.filter(Boolean) as HTMLDivElement[];
      if (steps.length === 0) return;

      // 1. Reset heights to auto first to calculate original scroll heights correctly
      steps.forEach(step => {
        const header = step.querySelector('.sell-content-col') as HTMLElement;
        const body = step.querySelector('.sell-step-body') as HTMLElement;
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
          const header = step.querySelector('.sell-content-col') as HTMLElement;
          const body = step.querySelector('.sell-step-body') as HTMLElement;

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
          const header = step.querySelector('.sell-content-col') as HTMLElement;
          const body = step.querySelector('.sell-step-body') as HTMLElement;

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

  // 📱 Detect Active Grid Columns Responsively (2 Cols on Desktop/Tablet, 1 Col on Mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setColsCount(1); // Mobile
      } else {
        setColsCount(2); // Desktop & Tablet (User requested 2 columns on desktop)
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
          '.sell-tagline, .sell-headline, .sell-body-text',
          { y: 35, opacity: 0, filter: 'blur(10px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            stagger: 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: '.sell-header-row',
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
                trigger: '.sell-steps-list',
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
                end: 'top 30%',   // Completes 100% of row flow when row reaches upper viewport (snappy!)
                scrub: 1,
              }
            });

            // Animate steps sequentially inside this specific row
            for (let i = startIndex; i < endIndex; i++) {
              const isFirstInRow = i % colsCount === 0 && i > 0;
              const isLastStep = i === steps.length - 1;

              // A. If first in row, fill the left off-screen entering line first (only if colsCount > 1)
              if (isFirstInRow && colsCount > 1) {
                rowTl.fromTo(
                  `.sell-left-progress-${i}`,
                  { scaleX: 0 },
                  { scaleX: 1, ease: 'none', duration: 0.2 }
                );
              }

              // B. Spotlight highlight for the timeline dot node
              rowTl.to(
                `.sell-dot-${i}`,
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

              // C. Spotlight highlight for the step number prefix
              rowTl.to(
                `.sell-step-item-${i} .sell-inline-number`,
                {
                  color: 'var(--color-gold-dark)',
                  duration: 0.15,
                  ease: 'power2.out',
                },
                '-=0.15'
              );

              // D. Main horizontal segment connecting line to the next step
              if (!isLastStep && i < endIndex - 1 && colsCount > 1) {
                rowTl.fromTo(
                  `.sell-main-progress-${i}`,
                  { scaleX: 0 },
                  { scaleX: 1, ease: 'none', duration: 0.4 }
                );
              }

              // E. If last item of the row and NOT the last step overall, animate the stretch-right line
              if (i === endIndex - 1 && i % colsCount === colsCount - 1 && i < steps.length - 1 && colsCount > 1) {
                rowTl.fromTo(
                  `.sell-main-progress-${i}`,
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

  return (
    <section
      className={`sell-process-section ${timelineMode ? 'sell-timeline-mode' : ''}`}
      id={data?.id || 'sell-process'}
      ref={sectionRef}
    >
      <div className="sell-container">
        {/* Header */}
        <div className="sell-header-row">
          <div className="sell-header-left">
            {tagline && <span className="sell-tagline">{tagline}</span>}
            {headline && <h2 className="sell-headline">{headline}</h2>}
          </div>
          {intro && (
            <div className="sell-header-right">
              <div className="sell-body-text">
                {typeof intro === 'string' ? (
                  <p>{intro}</p>
                ) : (
                  <PortableText value={intro} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="sell-steps-list">
          {steps?.map((step, index) => {
            const isLastInRow = index % colsCount === colsCount - 1;
            const isFirstInRow = index % colsCount === 0 && index > 0;
            const hasRowBelow = Math.floor(index / colsCount) < Math.floor((steps.length - 1) / colsCount);

            const isRightEdge = isLastInRow && hasRowBelow;
            const isLeftEdge = isFirstInRow;

            return (
              <div
                key={index}
                className={`sell-step-item sell-step-item-${index}`}
                ref={(el) => { stepRefs.current[index] = el; }}
              >
                {/* 🌟 Dynamic Serpentine Timeline Lines & Dots */}
                {timelineMode && colsCount > 1 && (
                  <>
                    {/* Left entering off-screen line (First item of subsequent rows) */}
                    {isLeftEdge && (
                      <div className="sell-timeline-left-line">
                        <div className={`sell-timeline-progress sell-left-progress-${index}`} />
                      </div>
                    )}

                    {/* Main connecting line segment */}
                    {(index < steps.length - 1) && (
                      <div className={`sell-timeline-line ${isRightEdge ? 'stretch-right' : ''}`}>
                        <div className={`sell-timeline-progress sell-main-progress-${index}`} />
                      </div>
                    )}

                    {/* Dynamic Timeline Dot Node */}
                    <div className={`sell-timeline-dot sell-dot-${index}`} />
                  </>
                )}

                {/* 1. Content Side (Number & Title) */}
                <div className="sell-content-col">
                  <div className="sell-header-row-step">
                    {step.number && (
                      <span className="sell-inline-number">
                        {step.number}
                      </span>
                    )}
                    <h3 className="sell-step-title">{step.title}</h3>
                  </div>
                </div>

                {/* 2. Media Side (Placeholder/Empty as requested) */}
                <div className="sell-media-col">
                  <div className="sell-image-inner">
                    {step.image ? (
                      <Image
                        src={urlForImage(step.image).width(600).height(400).url()}
                        alt={step.title || 'Step Background Image'}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder={step.image?.asset?.metadata?.lqip ? 'blur' : 'empty'}
                        blurDataURL={step.image?.asset?.metadata?.lqip}
                      />
                    ) : (
                      <div className="sell-placeholder" />
                    )}

                    {/* Icon Overlay (Optional) */}
                    {step.icon?.asset?.url && (
                      <div className="sell-overlay-icon-wrapper">
                        <div className="sell-overlay-icon">
                          <Image
                            src={step.icon.asset.url}
                            alt="Icon Overlay"
                            width={32}
                            height={32}
                            className="sell-center-icon"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Text Description */}
                {step.description && (
                  <div className="sell-step-body">
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
