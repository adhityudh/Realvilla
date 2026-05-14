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

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 78%', // 📐 Perfect golden ratio to witness the luxury reveal!
        toggleActions: 'play none none reverse',
      }
    });

    const heading = gridRef.current.querySelector('.stats-heading');
    const copy = gridRef.current.querySelector('.stats-copy');
    const items = gridRef.current.querySelectorAll('.stats-item');

    if (heading) {
      tl.fromTo(
        heading,
        { opacity: 0, filter: 'blur(10px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
      );
    }

    if (copy) {
      tl.fromTo(
        copy,
        { opacity: 0, filter: 'blur(8px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' },
        heading ? '-=0.6' : '0' // ⚡ Animates immediately after heading!
      );
    }

    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, filter: 'blur(10px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'power3.out' },
        copy ? '-=0.5' : (heading ? '-=0.5' : '0') // 📊 Numbers roll in last!
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current) {
          st.kill();
        }
      });
    };
  }, []);

  if (!data) return null;

  return (
    <section className="stats-section" ref={sectionRef}>
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
