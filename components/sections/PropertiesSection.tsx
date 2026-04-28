'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import './PropertiesSection.css';

gsap.registerPlugin(ScrollTrigger);

const properties = [
  { id: 1, address: 'Villa Del Mar, Costa Adeje', beds: 5, baths: 4, sqft: '5,150', price: '€4,250,000', image: '/images/buy.jpg', secondaryImage: '/images/sell.jpg' },
  { id: 2, address: 'Modern Penthouse, Playa de Las Américas', beds: 3, baths: 2, sqft: '2,100', price: '€1,850,000', image: '/images/sell.jpg', secondaryImage: '/images/invest.jpg' },
  { id: 3, address: 'Cliffs Edge Estate, Los Gigantes', beds: 4, baths: 3, sqft: '3,800', price: '€3,100,000', image: '/images/invest.jpg', secondaryImage: '/images/valuation-bg.jpg' },
  { id: 4, address: 'Luxury Mansion, Abama Resort', beds: 7, baths: 8, sqft: '12,500', price: '€7,500,000', image: '/images/valuation-bg.jpg', secondaryImage: '/images/buy.jpg' },
  { id: 5, address: 'Oceanfront Villa, El Duque', beds: 6, baths: 5, sqft: '6,200', price: '€5,900,000', image: '/images/buy.jpg', secondaryImage: '/images/sell.jpg' },
  { id: 6, address: 'Boutique Residence, La Caleta', beds: 4, baths: 4, sqft: '3,200', price: '€2,400,000', image: '/images/sell.jpg', secondaryImage: '/images/invest.jpg' },
];

const PropertyCard = ({ prop }: { prop: typeof properties[0] }) => {
  const secondaryImgRef = useRef<HTMLImageElement>(null);
  const hoverTl = useRef<gsap.core.Timeline | null>(null);

  const handleMouseEnter = () => {
    if (!secondaryImgRef.current) return;
    
    if (hoverTl.current) hoverTl.current.kill();
    
    const target = secondaryImgRef.current;
    const obj = { p: 0 };
    
    hoverTl.current = gsap.timeline();
    hoverTl.current.to(obj, {
      p: 1,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        const numStrips = 12;
        const stagger = 0.3;
        const stops = [];
        for (let j = 0; j < numStrips; j++) {
          const stripStart = ((numStrips - 1 - j) / numStrips) * (1 - stagger);
          const stripEnd = stripStart + stagger;
          let sP = (obj.p - stripStart) / (stripEnd - stripStart);
          sP = Math.max(0, Math.min(1, sP));

          const y1 = (j / numStrips) * 100;
          const y2 = ((j + 1) / numStrips) * 100;
          const cut = y2 - (y2 - y1) * sP;

          stops.push(`transparent ${y1}%`);
          stops.push(`transparent ${cut}%`);
          stops.push(`#000 ${cut}%`);
          stops.push(`#000 ${y2}%`);
        }
        const mask = `linear-gradient(to bottom, ${stops.join(', ')})`;
        target.style.webkitMaskImage = mask;
        target.style.maskImage = mask;
      }
    });
  };

  const handleMouseLeave = () => {
    if (!secondaryImgRef.current) return;
    
    if (hoverTl.current) hoverTl.current.kill();
    
    const target = secondaryImgRef.current;
    const obj = { p: 1 };
    
    hoverTl.current = gsap.timeline();
    hoverTl.current.to(obj, {
      p: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const numStrips = 12;
        const stagger = 0.3;
        const stops = [];
        for (let j = 0; j < numStrips; j++) {
          const stripStart = ((numStrips - 1 - j) / numStrips) * (1 - stagger);
          const stripEnd = stripStart + stagger;
          let sP = (obj.p - stripStart) / (stripEnd - stripStart);
          sP = Math.max(0, Math.min(1, sP));

          const y1 = (j / numStrips) * 100;
          const y2 = ((j + 1) / numStrips) * 100;
          const cut = y2 - (y2 - y1) * sP;

          stops.push(`transparent ${y1}%`);
          stops.push(`transparent ${cut}%`);
          stops.push(`#000 ${cut}%`);
          stops.push(`#000 ${y2}%`);
        }
        const mask = `linear-gradient(to bottom, ${stops.join(', ')})`;
        target.style.webkitMaskImage = mask;
        target.style.maskImage = mask;
      }
    });
  };

  return (
    <div 
      className="property-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="property-image-wrapper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={prop.image} alt={prop.address} className="property-image primary" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          ref={secondaryImgRef}
          src={prop.secondaryImage} 
          alt={prop.address} 
          className="property-image secondary" 
          style={{ webkitMaskImage: 'linear-gradient(transparent, transparent)', maskImage: 'linear-gradient(transparent, transparent)' }}
        />
      </div>
      <div className="property-info">
        <div className="property-price">{prop.price}</div>
        <h3 className="property-address">{prop.address}</h3>
        <div className="property-details">
          <span className="detail-item">{prop.beds} BEDS</span>
          <div className="detail-dot"></div>
          <span className="detail-item">{prop.baths} BATHS</span>
          <div className="detail-dot"></div>
          <span className="detail-item">{prop.sqft} SQ.FT.</span>
        </div>
      </div>
    </div>
  );
};

const PropertiesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current || !gridRef.current || !ctaRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 20%',
        end: 'top -90%',
        scrub: true,
      },
    });

    // Animate Header Content
    tl.fromTo(
      containerRef.current,
      { y: 50, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' },
      0
    );

    // Animate Grid Items with Stagger
    const cards = gridRef.current.querySelectorAll('.property-card');
    tl.fromTo(
      cards,
      { y: 100, opacity: 0, filter: 'blur(15px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      },
      0.8 // Pushed back further to avoid premature reveal
    );

    // Animate CTA Button
    tl.fromTo(
      ctaRef.current,
      { y: 30, opacity: 0, filter: 'blur(5px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power2.out'
      },
      1.1 // Show after cards start appearing
    );

    // Handle header mode toggle (remains same)
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 50px',
      end: 'bottom 50px',
      onEnter: () => document.body.classList.add('header-light-mode'),
      onLeave: () => document.body.classList.remove('header-light-mode'),
      onEnterBack: () => document.body.classList.add('header-light-mode'),
      onLeaveBack: () => document.body.classList.remove('header-light-mode'),
    });

    return () => {
      ScrollTrigger.getAll().filter(st => st.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, []);

  return (
    <section className="properties-intro-section" ref={sectionRef} id="properties">
      <div className="properties-main-wrapper">
        <div className="properties-intro-container" ref={containerRef}>
          <div className="properties-tagline">PROPERTIES</div>
          <h2 className="properties-headline">
            CURATED COLLECTIONS OF FINEST ESTATES IN TENERIFE
          </h2>
        </div>

        <div className="properties-grid" ref={gridRef}>
          {properties.map((prop) => (
            <PropertyCard key={prop.id} prop={prop} />
          ))}
        </div>

        <div className="properties-cta-container" ref={ctaRef}>
          <Button label="VIEW ALL PROPERTIES" href="/properties" />
        </div>
      </div>
    </section>
  );
};

export default PropertiesSection;
