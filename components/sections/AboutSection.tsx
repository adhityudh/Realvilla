'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';
import './AboutSection.css';

gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const objectLayerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [imageSizes, setImageSizes] = useState<Record<number, { w: number; h: number }>>({});

  useEffect(() => {
    if (!sectionRef.current) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1025px)",
      isMobile: "(max-width: 1024px)"
    }, (context) => {
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
            y: 40,
            opacity: 0,
            filter: 'blur(10px)'
          },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.1, ease: 'expo.out' }
        );
      }

      if (profileRef.current) {
        tl.fromTo(
          profileRef.current,
          { y: 30, opacity: 0, xPercent: -50 },
          { y: 0, opacity: 1, xPercent: -50, duration: 1, ease: 'power3.out' },
          '-=0.8'
        );
      }

      if (taglineRef.current) {
        tl.fromTo(
          taglineRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
          '-=1'
        );
      }

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          {
            y: 40,
            opacity: 0,
            filter: 'blur(10px)'
          },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
          '-=0.8'
        );
      }

      if (contentRef.current) {
        const paragraphs = contentRef.current.querySelectorAll('.about-paragraph');
        tl.fromTo(
          paragraphs,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' },
          '-=0.8'
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

        {/* Floating Profile Element */}
        <div className="about-profile-card" ref={profileRef}>
          <div className="profile-info">
            <h3 className="profile-name">LUIS VILLARREAL</h3>
          </div>
          <div className="profile-socials">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img src="icons/logo-fb-light.svg" alt="Facebook" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img src="icons/logo-ig-light.svg" alt="Instagram" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img src="icons/logo-linkedin-light.svg" alt="LinkedIn" />
            </a>
          </div>
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
            Certified real estate advisor in Commercial Management and Sales from the prestigious EAE Business School, and accredited as a Real Estate Agent (API), with the required qualifications to operate in Spain, including Catalonia, the Balearic Islands, and Valencia, within the corresponding real estate registries.
          </p>
        </div>

        {/* Certificates Gallery */}
        <div className="about-certificates">
          <Gallery>
            <div>
              {[1, 2, 3].map((num) => (
                <Item
                  key={num}
                  original={`/images/img-dummy-default.webp`}
                  thumbnail={`/images/img-dummy-default.webp`}
                  width={imageSizes[num]?.w || 800}
                  height={imageSizes[num]?.h || 600}
                >
                  {({ ref, open }) => (
                    <div
                      className="about-cert-item"
                      ref={ref as any}
                      onClick={open}
                    >
                      <div className="cert-thumb-wrapper">
                        <img
                          src={`/images/img-dummy-default.webp`}
                          alt={`Certificate ${num}`}
                          ref={(node) => {
                            if (node && node.complete && node.naturalWidth) {
                              setImageSizes(prev => {
                                if (!prev[num] || prev[num].w !== node.naturalWidth) {
                                  return { ...prev, [num]: { w: node.naturalWidth, h: node.naturalHeight } };
                                }
                                return prev;
                              });
                            }
                          }}
                          onLoad={(e) => {
                            const img = e.target as HTMLImageElement;
                            setImageSizes(prev => {
                              if (!prev[num] || prev[num].w !== img.naturalWidth) {
                                return { ...prev, [num]: { w: img.naturalWidth, h: img.naturalHeight } };
                              }
                              return prev;
                            });
                          }}
                        />
                        <div className="cert-hover-overlay">
                          <span>View Certificate</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Item>
              ))}
            </div>
          </Gallery>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
