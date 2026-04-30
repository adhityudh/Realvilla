'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './MarketDataSection.css';

gsap.registerPlugin(ScrollTrigger);

const marketData = [
  {
    id: 1,
    value: "2,850",
    prefix: "€",
    unit: "per m²",
    label: "average market valuation in tenerife."
  },
  {
    id: 2,
    value: "8.4",
    prefix: "+",
    unit: "%",
    label: "steady annual property appreciation."
  },
  {
    id: 3,
    value: "3.75",
    prefix: "",
    unit: "%",
    label: "current euribor rate for financing."
  }
];

const MarketDataSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.fromTo(
      itemsRef.current.filter(Boolean),
      { y: 80, opacity: 0, filter: 'blur(15px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        stagger: 0.2,
        ease: 'expo.out'
      }
    );
  }, []);

  return (
    <section className="market-data-section" ref={sectionRef}>
      <div className="market-data-container">
        {marketData.map((item, index) => (
          <div 
            key={item.id} 
            className={`market-data-item item-${index + 1}`}
            ref={(el) => { itemsRef.current[index] = el; }}
          >
            <div className="market-data-number-row">
              {item.prefix && <span className="market-data-prefix">{item.prefix}</span>}
              <span className="market-data-value">{item.value}</span>
              <span className="market-data-unit">{item.unit}</span>
            </div>
            <p className="market-data-label">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MarketDataSection;
