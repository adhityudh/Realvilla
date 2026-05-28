'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortableText } from 'next-sanity';
import { urlForImage } from '@/sanity/lib/image';
import Button from '@/components/ui/Button';
import './SellProcessSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Step {
  number?: string;
  title?: string;
  description?: any;
  image?: any;
}

interface SellProcessSectionProps {
  data?: {
    disableEntranceAnimation?: boolean;
    disableHeaderEntranceAnimation?: boolean;
    id?: string;
    tagline?: string;
    headline?: string;
    intro?: any;
    steps?: Step[];
    ctaLabel?: string;
    ctaLink?: string;
    openInNewWindow?: boolean;
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
        const body = step.querySelector('.sell-step-body') as HTMLElement;
        if (body) body.style.height = 'auto';
      });

      // 2. Synchronize heights PER ROW
      const totalRows = Math.ceil(steps.length / colsCount);
      for (let r = 0; r < totalRows; r++) {
        const startIndex = r * colsCount;
        const endIndex = Math.min(startIndex + colsCount, steps.length);
        const rowSteps = steps.slice(startIndex, endIndex);

        let maxBodyH = 0;

        // Find max heights inside this row
        rowSteps.forEach(step => {
          const body = step.querySelector('.sell-step-body') as HTMLElement;

          if (body) {
            const h = body.getBoundingClientRect().height;
            if (h > maxBodyH) maxBodyH = h;
          }
        });

        // Apply max heights to all items in this specific row
        rowSteps.forEach(step => {
          const body = step.querySelector('.sell-step-body') as HTMLElement;

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

      // 2. Animate step items entry individually with a column-based stagger delay
      if (!data?.disableEntranceAnimation) {
        const steps = stepRefs.current.filter(Boolean) as HTMLDivElement[];
        steps.forEach((step, index) => {
          const colIndex = index % colsCount;
          const staggerDelay = colIndex * 0.15; // 0.15s stagger gap between columns in the same row

          gsap.fromTo(
            step,
            { y: 40, opacity: 0, filter: 'blur(8px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.0,
              delay: staggerDelay,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        });
      }
    }, sectionRef);

  return () => {
    ctx.revert();
  };
}, [data, colsCount]);

  if (!data) return null;

  const { tagline, headline, intro, steps } = data;

  return (
    <section
      className="sell-process-section"
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
            return (
              <div
                key={index}
                className={`sell-step-item sell-step-item-${index}`}
                ref={(el) => { stepRefs.current[index] = el; }}
              >
                {/* Media Side with Overlay Title */}
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

                    {/* Step Number Overlay */}
                    {step.number && (
                      <span className="sell-image-number-badge">
                        {step.number}
                      </span>
                    )}

                    {/* Step Title Overlay */}
                    <div className="sell-image-title-overlay">
                      <h3 className="sell-overlay-title">{step.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Text Description */}
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

        {/* CTA Button */}
        {data.ctaLabel && (
          <div className="sell-process-cta-container">
            <Button
              label={data.ctaLabel}
              href={data.ctaLink || '#'}
              variant="dark"
              size="lg"
              showArrow={true}
              target={data.openInNewWindow ? '_blank' : undefined}
              rel={data.openInNewWindow ? 'noopener noreferrer' : undefined}
            />
          </div>
        )}
      </div>
    </section>
  );
}
