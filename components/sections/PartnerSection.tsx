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

const PartnerSection = ({ data, dict }: { data?: any, dict?: any }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const title = data.title;
  const partners = data.partners;

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !logosRef.current) return;

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });

    if (!data?.disableHeaderEntranceAnimation) {
      tl.fromTo(
        titleRef.current,
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }
      );
    }

    if (!data?.disableEntranceAnimation) {
      const position = !data?.disableHeaderEntranceAnimation ? '-=0.8' : 0;
      tl.fromTo(
        logosRef.current.children,
        { y: 40, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.1, ease: 'power3.out' },
        position
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current) {
          st.kill();
        }
      });
    };
  }, [data]);

  return (
    <section className={`partner-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} ref={sectionRef} id={data?.id || 'partners'}>
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
