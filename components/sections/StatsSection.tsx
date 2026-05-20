'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StatsSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatItem {
  _key?: string;
  prefix?: string;
  value: string;
  suffix?: string;
  label?: string;
}

interface StatsSectionProps {
  data: {
    disableEntranceAnimation?: boolean;
    disableHeaderEntranceAnimation?: boolean;
    id?: string;
    heading?: string;
    body?: string;
    stats?: StatItem[];
  };
}

export default function StatsSection({ data }: StatsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });

    const heading = gridRef.current.querySelector('.stats-heading');
    const copy = gridRef.current.querySelector('.stats-copy');
    const items = gridRef.current.querySelectorAll('.stats-item');

    if (!data?.disableHeaderEntranceAnimation) {
      if (heading) {
        tl.fromTo(
          heading,
          { y: 35, opacity: 0, filter: 'blur(10px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }
        );
      }

      if (copy) {
        const position = heading ? '-=0.9' : '0';
        tl.fromTo(
          copy,
          { y: 35, opacity: 0, filter: 'blur(10px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
          position // ⚡ Animates immediately after heading!
        );
      }
    }

    if (!data?.disableEntranceAnimation && items.length > 0) {
      const position = !data?.disableHeaderEntranceAnimation
        ? (copy ? '-=0.8' : (heading ? '-=0.8' : '0'))
        : '0';
      tl.fromTo(
        items,
        { y: 40, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.1, ease: 'power3.out' },
        position // 📊 Numbers roll in last!
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current) {
          st.kill();
        }
      });
    };
  }, [data]);

  if (!data) return null;

  return (
    <section className={`stats-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} ref={sectionRef} id={data?.id || 'stats'}>
      <div className="stats-container">
        <div className="stats-grid" ref={gridRef}>
          {/* Structural Layout Dividers */}
          <div className="stats-divider stats-divider-h stats-divider-h-1" aria-hidden="true" />

          {/* Heading - integrated at the absolute top of the grid tree */}
          {data.heading && <h2 className="stats-heading">{data.heading}</h2>}

          {/* Stat Items */}
          {data.stats?.map((item, idx) => (
            <div key={item._key || idx} className="stats-item">
              <div className="stats-value-wrapper">
                {item.prefix && <span className="stats-prefix">{item.prefix}</span>}
                <span className="stats-value">{item.value}</span>
                {item.suffix && <span className="stats-suffix">{item.suffix}</span>}
              </div>
              {item.label && <p className="stats-label">{item.label}</p>}
            </div>
          ))}

          {/* Copy Text - now placed as the final element in the grid tree */}
          {data.body && <p className="stats-copy">{data.body}</p>}
        </div>
      </div>
    </section>
  );
}
