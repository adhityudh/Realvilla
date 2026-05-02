'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import './MortgageFAQSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const MortgageFAQSection = ({ data }: { data?: any }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!data) return null;

  const tagline = data.tagline;
  const title = data.title;
  const faqData = data.faqs;
  const ctaPrimaryLabel = data.ctaPrimaryLabel;
  const ctaPrimaryLink = data.ctaPrimaryLink;
  const ctaSecondaryLabel = data.ctaSecondaryLabel;
  const ctaSecondaryLink = data.ctaSecondaryLink;

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !listRef.current || !ctaRef.current) return;

    gsap.fromTo(
      headerRef.current.querySelectorAll('.mortgage-faq-tagline, .mortgage-faq-title'),
      { y: 60, opacity: 0, filter: 'blur(15px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: 0.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    const faqItems = listRef.current.querySelectorAll('.faq-item');
    gsap.fromTo(
      faqItems,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: listRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    const ctaButtons = ctaRef.current.children;
    gsap.fromTo(
      ctaButtons,
      { y: 30, opacity: 0, filter: 'blur(5px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    if (window.innerWidth <= 1024) {
      setActiveIndex(0);
      gsap.set(answerRefs.current[0], { height: 'auto', opacity: 1 });
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current || st.trigger === headerRef.current || st.trigger === listRef.current || st.trigger === ctaRef.current) {
          st.kill();
        }
      });
    };
  }, []);

  const toggleFAQ = (index: number) => {
    if (window.innerWidth > 1024) return;
    const isClosing = activeIndex === index;
    const newIndex = isClosing ? null : index;
    if (activeIndex !== null) {
      gsap.to(answerRefs.current[activeIndex], { height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut' });
    }
    if (!isClosing) {
      gsap.to(answerRefs.current[index], { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.inOut' });
    }
    setActiveIndex(newIndex);
  };

  return (
    <section className="mortgage-faq-section" id="mortgage" ref={sectionRef}>
      <div className="mortgage-faq-wrapper">
        <div className="mortgage-faq-header" ref={headerRef}>
          <div className="mortgage-faq-tagline">{tagline}</div>
          <h2 className="mortgage-faq-title">{title}</h2>
        </div>

        <div className="mortgage-faq-list" ref={listRef}>
          {faqData?.map((item: any, index: number) => (
            <div
              key={index}
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-trigger">
                <div className="faq-index">({index + 1})</div>
                <div className="faq-answer-container" ref={(el) => { answerRefs.current[index] = el; }}>
                  <p className="faq-answer">{item.answer}</p>
                </div>
                <div className="faq-question-container">
                  <div className="faq-question">{item.question}</div>
                  <div className="faq-icon"><span></span><span></span></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mortgage-faq-cta" ref={ctaRef}>
          {ctaPrimaryLabel && <Button label={ctaPrimaryLabel} href={ctaPrimaryLink || '#'} variant="dark" />}
          {(data.showSecondaryCta !== false && ctaSecondaryLabel) && (
            <Button label={ctaSecondaryLabel} href={ctaSecondaryLink || '#'} variant="pill" className="service-cta" />
          )}
        </div>
      </div>
    </section>
  );
};

export default MortgageFAQSection;
