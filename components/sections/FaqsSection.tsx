'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FaqsSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  title: string;
  items: FaqItem[];
}

interface FaqsSectionData {
  anchor?: string;
  tocLabel?: string;
  groups?: FaqGroup[];
  disableEntranceAnimation?: boolean;
}

// ─── Single FAQ Accordion ────────────────────────────────────────────────────
function FaqAccordion({ item, groupIndex, itemIndex, isDefaultOpen }: { item: FaqItem; groupIndex: number; itemIndex: number; isDefaultOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const answerRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const el = answerRef.current;
    if (!el) return;

    if (isOpen) {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut' });
    } else {
      gsap.to(el, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.inOut' });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`faq-sf-item ${isOpen ? 'is-active' : ''}`}
      onClick={toggle}
      role="button"
      aria-expanded={isOpen}
      id={`faq-sf-item-${groupIndex}-${itemIndex}`}
    >
      <div className="faq-sf-trigger">
        <div className="faq-sf-question-row">
          <div className="faq-sf-question">{item.question}</div>
          <div className="faq-sf-icon"><span /><span /></div>
        </div>
        <div 
          className="faq-sf-answer-container" 
          ref={answerRef}
          style={isDefaultOpen ? { height: 'auto', opacity: 1 } : undefined}
        >
          <p className="faq-sf-answer">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FaqsSection({ data }: { data?: FaqsSectionData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeTocIndex, setActiveTocIndex] = useState(0);

  if (!data || !data.groups?.length) return null;

  const { groups, anchor, tocLabel, disableEntranceAnimation } = data;

  // ── Entrance animations ──────────────────────────────────────────────────
  useEffect(() => {
    if (disableEntranceAnimation) return;

    groupRefs.current.forEach((groupEl) => {
      if (!groupEl) return;
      gsap.fromTo(
        groupEl.querySelectorAll('.faqs-group-title, .faq-sf-item'),
        { y: 30, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0, opacity: 1, filter: 'blur(0px)',
          duration: 0.9, stagger: 0.06, ease: 'power3.out',
          scrollTrigger: {
            trigger: groupEl,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        groupRefs.current.forEach((el) => {
          if (el && st.trigger === el) st.kill();
        });
      });
    };
  }, [disableEntranceAnimation]);

  // ── Active TOC tracking via IntersectionObserver ─────────────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const thresholds = [0, 0.25, 0.5, 0.75, 1];

    groupRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveTocIndex(idx);
          });
        },
        { threshold: thresholds, rootMargin: '-20% 0px -60% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // ── TOC scroll click ─────────────────────────────────────────────────────
  const scrollToGroup = useCallback((idx: number) => {
    const el = groupRefs.current[idx];
    if (!el) return;
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: -130, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <section className="faqs-section" id={anchor || 'faqs'} ref={sectionRef}>
      <div className="faqs-container">
        <div className="faqs-content-layout">

          {/* ── TOC Sidebar ─────────────────────────────────────────── */}
          <aside className="faqs-toc-sidebar">
            {tocLabel && <p className="faqs-toc-label">{tocLabel}</p>}
            <nav className="faqs-toc-nav" aria-label="FAQ navigation">
              <ul className="faqs-toc-list">
                {groups.map((group, idx) => (
                  <li
                    key={idx}
                    className={`faqs-toc-item ${activeTocIndex === idx ? 'is-active' : ''}`}
                  >
                    <button
                      className="faqs-toc-link"
                      onClick={() => scrollToGroup(idx)}
                      aria-current={activeTocIndex === idx ? 'true' : undefined}
                    >
                      {group.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* ── FAQ Body ────────────────────────────────────────────── */}
          <div className="faqs-body">
            {groups.map((group, gIdx) => (
              <div
                key={gIdx}
                className="faqs-group"
                ref={(el) => { groupRefs.current[gIdx] = el; }}
              >
                <h2 className="faqs-group-title">{group.title}</h2>
                <div className="faqs-list">
                  {group.items?.map((item, iIdx) => (
                    <FaqAccordion
                      key={iIdx}
                      item={item}
                      groupIndex={gIdx}
                      itemIndex={iIdx}
                      isDefaultOpen={iIdx === 0}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
