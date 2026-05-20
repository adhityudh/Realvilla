'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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

  const pathname = usePathname() || '';
  const isEs = pathname.startsWith('/es');

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  if (!data) return null;

  const tagline = data.tagline;
  const headline = data.headline;
  
  const limitCount = isMobile && data.limitMobile ? data.limitMobile : (data.limit || 3);
  const propertiesList = (data.properties || []).slice(0, limitCount);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current || !gridRef.current || !ctaRef.current) return;

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) return;

    if (!data?.disableHeaderEntranceAnimation) {
      const headerElements = containerRef.current.children;
      gsap.fromTo(
        headerElements,
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    if (!data?.disableEntranceAnimation) {
      const cards = gridRef.current.querySelectorAll('.property-card');
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.0,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      gsap.fromTo(
        ctaRef.current,
        { y: 40, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    // Header color mode override removed for light theme

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current || st.trigger === containerRef.current || st.trigger === gridRef.current || st.trigger === ctaRef.current) {
          st.kill();
        }
      });
    };
  }, [data]);

  return (
    <section className={`properties-intro-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} ref={sectionRef} id={data?.id || 'properties'}>
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
          <div className="properties-cta-outer" ref={ctaRef}>
            <div className="properties-cta-container">
              <Button 
                label={data.ctaLabel} 
                href={data.ctaLink} 
                variant="dark"
              />
            </div>
            <div className="properties-mortgage-cta">
              <span className="cta-question">
                {isEs 
                  ? '¿Busca financiar su inversión?' 
                  : 'Looking to finance your investment?'}
              </span>{' '}
              <Button
                label={isEs 
                  ? 'Explore nuestras soluciones hipotecarias a medida.' 
                  : 'Explore our tailored mortgage solutions.'}
                href={isEs ? '/es/hipoteca' : '/en/mortgage'}
                variant="link"
                showArrow={false}
                className="properties-mortgage-link"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesSection;
