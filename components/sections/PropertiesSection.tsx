'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import './PropertiesSection.css';
import { urlForImage } from '@/sanity/lib/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import PropertyCard from '../ui/PropertyCard';

const PropertiesSection = ({ data, dict }: { data?: any, dict?: any }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!data) return null;

  const tagline = data.tagline;
  const headline = data.headline;
  
  const limitCount = isMobile && data.limitMobile ? data.limitMobile : (data.limit || 3);
  const propertiesList = (data.properties || []).slice(0, limitCount);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current || !gridRef.current || !ctaRef.current) return;

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

    // Header color mode override removed for light theme

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current || st.trigger === containerRef.current || st.trigger === gridRef.current || st.trigger === ctaRef.current) {
          st.kill();
        }
      });
    };
  }, []);

  return (
    <section className="properties-intro-section" ref={sectionRef} id="properties">
      <div className="properties-main-wrapper">
        <div className="properties-intro-container" ref={containerRef}>
          <div className="properties-tagline">{tagline}</div>
          <h2 className="properties-headline">{headline}</h2>
        </div>

        <div className="properties-grid" ref={gridRef}>
          {propertiesList?.map((prop: any, idx: number) => (
            <PropertyCard key={prop._key || idx} prop={prop} dict={dict} />
          ))}
        </div>

        {data.ctaLabel && data.ctaLink && (
          <div className="properties-cta-container" ref={ctaRef}>
            <Button 
              label={data.ctaLabel} 
              href={data.ctaLink} 
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesSection;
