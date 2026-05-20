'use client';

import { useRef, useEffect } from 'react';
import Button from '../ui/Button';
import { PortableText } from '@portabletext/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { smoothScrollToAnchor } from '@/lib/scroll';
import './DocumentLedgerSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface LedgerItem {
  number?: string;
  title: string;
  hint?: string;
}

interface DocumentLedgerSectionProps {
  data?: {
    disableEntranceAnimation?: boolean;
    disableHeaderEntranceAnimation?: boolean;
    id?: string;
    tagline?: string;
    headline?: string;
    intro?: any;
    cta?: {
      label?: string;
      link?: string;
      externalLink?: string;
    };
    items?: LedgerItem[];
  };
}

export default function DocumentLedgerSection({ data }: DocumentLedgerSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) return;

    // 1. Left Column Content Entrance
    if (!data?.disableHeaderEntranceAnimation) {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.ledger-tagline, .ledger-headline, .ledger-intro, .ledger-cta-box'),
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // 2. Right Column Ledger Items Entrance
    if (!data?.disableEntranceAnimation) {
      const activeItems = itemRefs.current.filter(Boolean);
      const ledgerListEl = sectionRef.current.querySelector('.ledger-list');
      if (activeItems.length > 0 && ledgerListEl) {
        gsap.fromTo(
          activeItems,
          { y: 40, opacity: 0, filter: 'blur(8px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.0,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ledgerListEl,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [data]);

  if (!data) return null;

  const { tagline, headline, intro, items, cta } = data;

  return (
    <section className={`document-ledger-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} ref={sectionRef} id={data?.id || 'document-ledger'}>
      <div className="ledger-container">
        {/* 🏛️ Two-Column Split Grid */}
        <div className="ledger-grid">
          
          {/* 👈 Left Side: Context & Title Block */}
          <div className="ledger-content-col">
            <div className="ledger-header-sticky">
              {tagline && <div className="ledger-tagline">{tagline}</div>}
              {headline && <h2 className="ledger-headline">{headline}</h2>}
              {intro && (
                <div className="ledger-intro">
                  {typeof intro === 'string' ? (
                    <p>{intro}</p>
                  ) : (
                    <PortableText value={intro} />
                  )}
                </div>
              )}
            </div>

            {/* 🎯 Positioned at base of flex column, pushed away from top content */}
            <div className="ledger-cta-box">
              <Button 
                label={cta?.label || 'REQUEST A MORTGAGE STUDY'} 
                href={cta?.externalLink || cta?.link || '#contact'} 
                variant="dark"
                onClick={(e) => smoothScrollToAnchor(e, cta?.externalLink || cta?.link || '#contact')}
              />
            </div>
          </div>

          {/* 👉 Right Side: The Manifesto Ledger Stack */}
          <div className="ledger-items-col">
            {items && items.length > 0 ? (
              <div className="ledger-list">
                {items.map((item, index) => (
                  <div 
                    key={index} 
                    className="ledger-row-item"
                    ref={(el) => { itemRefs.current[index] = el; }}
                  >
                    {/* Inner Content Row */}
                    <div className="ledger-row-inner">
                      <div className="ledger-left-identifier">
                        {item.number ? (
                          <span className="ledger-num">{item.number}</span>
                        ) : (
                          <span className="ledger-num">{(index + 1).toString().padStart(2, '0')}</span>
                        )}
                      </div>
                      <div className="ledger-mid-content">
                        <h4 className="ledger-item-title">{item.title}</h4>
                        {item.hint && <p className="ledger-item-hint">{item.hint}</p>}
                      </div>
                      </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ledger-placeholder">No ledger items found in query.</div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
