'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import './PropertiesSection.css';

gsap.registerPlugin(ScrollTrigger);

const properties = [
  { id: 1, address: 'Villa Del Mar, Costa Adeje', beds: 5, baths: 4, sqft: '5,150', price: '€4,250,000', image: '/images/img-dummy-1.jpg', secondaryImage: '/images/img-dummy-3.jpg' },
  { id: 2, address: 'Modern Penthouse, Playa de Las Américas', beds: 3, baths: 2, sqft: '2,100', price: '€1,850,000', image: '/images/img-dummy-3.jpg', secondaryImage: '/images/img-dummy-2.jpg' },
  { id: 3, address: 'Cliffs Edge Estate, Los Gigantes', beds: 4, baths: 3, sqft: '3,800', price: '€3,100,000', image: '/images/img-dummy-2.jpg', secondaryImage: '/images/img-dummy-4.jpg' },
  { id: 4, address: 'Luxury Mansion, Abama Resort', beds: 7, baths: 8, sqft: '12,500', price: '€7,500,000', image: '/images/img-dummy-4.jpg', secondaryImage: '/images/img-dummy-1.jpg' },
  { id: 5, address: 'Oceanfront Villa, El Duque', beds: 6, baths: 5, sqft: '6,200', price: '€5,900,000', image: '/images/img-dummy-1.jpg', secondaryImage: '/images/img-dummy-3.jpg' },
  { id: 6, address: 'Boutique Residence, La Caleta', beds: 4, baths: 4, sqft: '3,200', price: '€2,400,000', image: '/images/img-dummy-3.jpg', secondaryImage: '/images/img-dummy-2.jpg' },
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
        (target.style as any).WebkitMaskImage = mask;
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
        (target.style as any).WebkitMaskImage = mask;
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
        <Image 
          src={prop.image} 
          alt={prop.address} 
          className="property-image primary" 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
        <Image
          ref={secondaryImgRef}
          src={prop.secondaryImage}
          alt={prop.address}
          className="property-image secondary"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ 
            objectFit: 'cover',
            WebkitMaskImage: 'linear-gradient(transparent, transparent)', 
            maskImage: 'linear-gradient(transparent, transparent)' 
          }}
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

    // 1. Header Animation (Triggered by the center where text is)
    const headerElements = containerRef.current.children;
    gsap.fromTo(
      headerElements,
      { y: 100, opacity: 0, filter: 'blur(20px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        stagger: 0.3,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'center 95%',
          toggleActions: 'play none none reverse',
        }
      }
    );

    // 2. Grid Animation (Triggers when grid enters)
    const cards = gridRef.current.querySelectorAll('.property-card');
    gsap.fromTo(
      cards,
      { y: 60, opacity: 0, filter: 'blur(15px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      }
    );

    // 3. CTA Animation (Triggers after grid)
    gsap.fromTo(
      ctaRef.current,
      { y: 30, opacity: 0, filter: 'blur(5px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        }
      }
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
      const triggers = [containerRef.current, gridRef.current, ctaRef.current, sectionRef.current];
      ScrollTrigger.getAll().forEach(st => {
        if (triggers.includes(st.trigger as any)) {
          st.kill();
        }
      });
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
