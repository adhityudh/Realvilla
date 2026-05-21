'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortableText } from 'next-sanity';
import { urlForImage } from '@/sanity/lib/image';
import './BuyingProcessSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Step {
  number?: string;
  title?: string;
  description?: any;
  image?: any;
  quickFacts?: { label: string; value: string }[];
}

interface BuyingProcessSectionProps {
  data?: {
    disableEntranceAnimation?: boolean;
    disableHeaderEntranceAnimation?: boolean;
    id?: string;
    tagline?: string;
    headline?: string;
    intro?: any;
    imageOrder?: 'left-first' | 'right-first';
    steps?: Step[];
  };
}

export default function BuyingProcessSection({ data }: BuyingProcessSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) return;

    // Animate Section Header
    if (!data?.disableHeaderEntranceAnimation) {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.process-tagline, .process-headline, .process-intro'),
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current.querySelector('.process-header'),
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    const imageOrder = data?.imageOrder || 'right-first';

    // Animate individual steps as they come into view
    if (!data?.disableEntranceAnimation) {
      stepRefs.current.forEach((stepEl, idx) => {
        if (!stepEl) return;
        const content = stepEl.querySelector('.step-content-col');
        const media = stepEl.querySelector('.step-media-col');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stepEl,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        });

        tl.fromTo(
          media,
          { y: 40, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
          0
        ).fromTo(
          content,
          { y: 40, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
          0.2
        );
      });
    }

    // Important: Refresh triggers after setup to account for initial layout
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [data]);

  if (!data) return null;

  const { tagline, headline, intro, steps, imageOrder = 'right-first' } = data;

  return (
    <section className={`buying-process-section order-${imageOrder}`} id={data?.id || 'buying-process'} ref={sectionRef}>
      <div className="process-container">
        {/* Header */}
        {(tagline || headline || intro) && (
          <header className="process-header">
            {tagline && <span className="process-tagline">{tagline}</span>}
            {headline && <h2 className="process-headline">{headline}</h2>}
            {intro && (
              <div className="process-intro">
                <PortableText value={intro} />
              </div>
            )}
          </header>
        )}

        {/* Steps */}
        <div className="process-steps-list">
          {steps?.map((step, index) => (
            <div
              key={index}
              className="process-step-item"
              ref={(el) => { stepRefs.current[index] = el; }}
            >
              {/* Media Side */}
              <div className="step-media-col">
                {step.image ? (
                  <Image
                    src={urlForImage(step.image).width(800).height(600).url()}
                    alt={step.title || 'Step Image'}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    placeholder={step.image?.asset?.metadata?.lqip ? 'blur' : 'empty'}
                    blurDataURL={step.image?.asset?.metadata?.lqip}
                  />
                ) : (
                  <div className="step-placeholder" style={{ width: '100%', height: '100%', background: '#f0f0f0' }} />
                )}
                {step.number && <div className="step-watermark-number is-mobile">{step.number}</div>}
              </div>

              {/* Content Side */}
              <div className="step-content-col">
                {step.number && <div className="step-watermark-number is-desktop">{step.number}</div>}
                
                <div className="step-title-wrapper">
                  <h3 className="step-title">{step.title}</h3>
                </div>

                {step.description && (
                  <div className="step-body">
                    <PortableText value={step.description} />
                  </div>
                )}

                {/* Fact Cards */}
                {step.quickFacts && step.quickFacts.length > 0 && (
                  <div className="step-facts">
                    {step.quickFacts.map((fact, fIdx) => (
                      <div key={fIdx} className="fact-card">
                        <span className="fact-label">{fact.label}</span>
                        <span className="fact-value">{fact.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
