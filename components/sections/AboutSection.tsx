'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutSection.css';

gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const objectLayerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1025px)",
      isMobile: "(max-width: 1024px)"
    }, (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      if (bgLayerRef.current && objectLayerRef.current) {
        tl.fromTo(
          [bgLayerRef.current, objectLayerRef.current],
          {
            x: isDesktop ? -50 : 0,
            y: isDesktop ? 0 : 30,
            opacity: 0,
            filter: 'blur(10px)'
          },
          { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.1, ease: 'expo.out' }
        );
      }

      if (taglineRef.current) {
        tl.fromTo(
          taglineRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
          '-=1.2'
        );
      }

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          {
            x: isDesktop ? 50 : 0,
            y: isDesktop ? 0 : 30,
            opacity: 0,
            filter: 'blur(20px)'
          },
          { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'expo.out' },
          '-=1'
        );
      }

      if (contentRef.current) {
        const paragraphs = contentRef.current.querySelectorAll('.about-paragraph');
        tl.fromTo(
          paragraphs,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' },
          '-=1.4'
        );
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="about-section" ref={sectionRef}>
      <div className="about-visual-container">
        {/* Layer 1: Background */}
        <div className="about-bg-layer" ref={bgLayerRef}>
          <img src="images/img-about-bg.webp" alt="" />
        </div>

        {/* Layer 2: Object (In front of text) */}
        <div className="about-object-layer" ref={objectLayerRef}>
          <img src="images/img-about-p.webp" alt="Luxury Real Estate Object" />
        </div>
      </div>

      {/* Layer 3: Tagline */}
      <div className="about-tagline" ref={taglineRef}>Local Expertise</div>

      {/* Layer 4: Headline (In-between) */}
      <h2 className="about-headline" ref={headlineRef}>
        Redefining Tenerife Real Estate
      </h2>

      {/* Layer 5: Content (Text blocks) */}
      <div className="about-content" ref={contentRef}>
        <div className="about-paragraph-wrapper">
          <p className="about-paragraph">
            With an unwavering commitment to discretion and precision, we guide our clients through Tenerife’s most exclusive property opportunities. Every transaction is a testament to our profound local insight and a global standard of excellence, ensuring your investment is handled with absolute care.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
