'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PartnerSection.css';

gsap.registerPlugin(ScrollTrigger);

const PartnerSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);

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
          <h2 className="partner-title">Collaborating with Excellence</h2>
        </div>
        <div className="partner-logos" ref={logosRef}>
          {[1, 2, 3, 4, 5].map((num) => (
            <div className="partner-logo-item" key={num}>
              <Image 
                src={`/images/logo-dummy-${num}.png`} 
                alt={`Partner ${num}`} 
                fill 
                sizes="120px" 
                style={{ objectFit: 'contain' }} 
                loading="lazy" 
                className="img-reveal"
                onLoad={(e) => e.currentTarget.classList.add('loaded')}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
