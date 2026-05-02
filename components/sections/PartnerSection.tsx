'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PartnerSection.css';
import { urlForImage } from '@/sanity/lib/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PartnerSection = ({ data }: { data?: any }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const title = data.title;
  const partners = data.partners;

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !logosRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });

    tl.fromTo(
      titleRef.current,
      { y: 30, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
    )
    .fromTo(
      logosRef.current.children,
      { y: 30, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      '-=0.6'
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current) {
          st.kill();
        }
      });
    };
  }, []);

  return (
    <section className="partner-section" ref={sectionRef}>
      <div className="partner-container">
        <div className="partner-title-wrapper" ref={titleRef}>
          <h2 className="partner-title">{title}</h2>
        </div>
        <div className="partner-logos" ref={logosRef}>
          {partners?.map((partner: any, idx: number) => {
            const logoSrc = partner.logo;
            const content = (
              <Image 
                src={logoSrc} 
                alt={partner.name || `Partner ${idx + 1}`} 
                fill 
                sizes="120px" 
                style={{ objectFit: 'contain' }} 
                loading="lazy" 
                className="img-reveal"
                onLoad={(e) => e.currentTarget.classList.add('loaded')}
              />
            );

            return (
              <div className="partner-logo-item" key={idx}>
                {partner.link ? (
                  <a href={partner.link} target="_blank" rel="noopener noreferrer" className="partner-link">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
