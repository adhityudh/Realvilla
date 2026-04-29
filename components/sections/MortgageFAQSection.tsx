'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import './MortgageFAQSection.css';

gsap.registerPlugin(ScrollTrigger);

const faqData = [
  {
    id: 1,
    question: "Can non-residents get a mortgage in Spain?",
    answer: "Yes. Non-residents can typically finance up to 60-70% of the property's valuation or purchase price, while Spanish residents can access up to 80%."
  },
  {
    id: 2,
    question: "How long does the mortgage process usually take?",
    answer: "On average, the formal approval and processing take between 4 to 6 weeks once all required documentation is submitted to the bank."
  },
  {
    id: 3,
    question: "Fixed vs. Variable rates: Which is better?",
    answer: "It depends on your financial goals. Fixed rates offer stability against Euribor fluctuations, while variable rates often start lower. Our experts can help you compare options from top local banks."
  },
  {
    id: 4,
    question: "Do I need a Spanish bank account?",
    answer: "Yes. To finalize a mortgage and property purchase in Tenerife, you will need a Spanish bank account and an NIE (Foreigner Identity Number). We guide you through this setup."
  }
];

const MortgageFAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !listRef.current || !ctaRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.fromTo(
      headerRef.current.querySelectorAll('.mortgage-faq-tagline, .mortgage-faq-title'),
      { y: 60, opacity: 0, filter: 'blur(15px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.2, ease: 'expo.out' }
    );

    tl.fromTo(
      listRef.current.querySelectorAll('.faq-item'),
      { y: 40, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.1, ease: 'expo.out' },
      '-=1'
    );

    tl.fromTo(
      ctaRef.current,
      { y: 30, opacity: 0, filter: 'blur(5px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out' },
      '-=0.8'
    );

    // Default expand first item on mobile
    if (window.innerWidth <= 1024) {
      setActiveIndex(0);
      gsap.set(answerRefs.current[0], { height: 'auto', opacity: 1 });
    }
  }, []);

  const toggleFAQ = (index: number) => {
    if (window.innerWidth > 1024) return; // Only accordion on mobile

    const isClosing = activeIndex === index;
    const newIndex = isClosing ? null : index;

    // Animate closing of current
    if (activeIndex !== null) {
      gsap.to(answerRefs.current[activeIndex], {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.inOut'
      });
    }

    // Animate opening of new
    if (!isClosing) {
      gsap.to(answerRefs.current[index], {
        height: 'auto',
        opacity: 1,
        duration: 0.5,
        ease: 'power3.inOut'
      });
    }

    setActiveIndex(newIndex);
  };

  return (
    <section className="mortgage-faq-section" id="mortgage" ref={sectionRef}>
      <div className="mortgage-faq-wrapper">
        <div className="mortgage-faq-header" ref={headerRef}>
          <div className="mortgage-faq-tagline">Mortgages</div>
          <h2 className="mortgage-faq-title">
            Simplified Property Financing
          </h2>
        </div>

        <div className="mortgage-faq-list" ref={listRef}>
          {faqData.map((item, index) => (
            <div
              key={item.id}
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
                  <div className="faq-icon">
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mortgage-faq-cta" ref={ctaRef}>
          <Button label="Speak to an Expert" href="#" variant="dark" />
          <Button label="Know More" href="#" variant="pill" className="service-cta" />
        </div>
      </div>
    </section>
  );
};

export default MortgageFAQSection;
