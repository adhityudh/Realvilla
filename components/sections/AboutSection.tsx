'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';
import './AboutSection.css';
import { urlForImage } from '@/sanity/lib/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AboutSection = ({ data }: { data?: any }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const objectLayerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [imageSizes, setImageSizes] = useState<Record<number, { w: number; h: number }>>({});

  if (!data) return null;

  const tagline = data.tagline;
  const headline = data.headline;
  const bodyText = data.body || '';
  const content = bodyText.split('\n').filter((p: string) => p.trim() !== '');
  const bgImage = data.bgImage ? urlForImage(data.bgImage).url() : null;
  const objectImage = data.objectImage ? urlForImage(data.objectImage).url() : null;
  const profileName = data.profileName;
  const certificates = data.certificates;

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
          { y: 40, opacity: 0, filter: 'blur(10px)' },
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
          { y: 40, opacity: 0, filter: 'blur(10px)' },
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
        <div className="about-bg-layer" ref={bgLayerRef}>
          {bgImage && (
            <Image
              src={bgImage}
              alt=""
              fill
              sizes="50vw"
              style={{ objectFit: 'cover' }}
              className="img-reveal"
              onLoad={(e) => e.currentTarget.classList.add('loaded')}
            />
          )}
        </div>

        <div className="about-object-layer" ref={objectLayerRef}>
          {objectImage && (
            <Image
              src={objectImage}
              alt="Luxury Real Estate Object"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: 'contain', objectPosition: 'bottom' }}
              className="img-reveal"
              onLoad={(e) => e.currentTarget.classList.add('loaded')}
            />
          )}
        </div>

        <div className="about-profile-card" ref={profileRef}>
          <div className="profile-info">
            <h3 className="profile-name">{profileName}</h3>
          </div>
          <div className="profile-socials">
            {data.socialLinks?.map((social: any, i: number) => (
              <a key={i} href={social.link || '#'} target="_blank" rel="noopener noreferrer">
                {social.icon && <Image src={social.icon} alt={social.label || 'Social'} width={20} height={20} />}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="about-tagline" ref={taglineRef}>{tagline}</div>

      <h2 className="about-headline" ref={headlineRef}>
        {headline}
      </h2>

      <div className="about-content" ref={contentRef}>
        <div className="about-paragraph-wrapper">
          {content?.map((p: string, i: number) => (
            <p key={i} className="about-paragraph">{p}</p>
          ))}
        </div>

        <div className="about-certificates">
          <Gallery>
            <div>
              {certificates?.map((cert: any, index: number) => {
                const certUrl = urlForImage(cert).url();
                const num = index + 1;
                return (
                  <Item
                    key={index}
                    original={certUrl}
                    thumbnail={certUrl}
                    width={imageSizes[num]?.w || 800}
                    height={imageSizes[num]?.h || 600}
                  >
                    {({ ref, open }) => (
                      <div className="about-cert-item" ref={ref as any} onClick={open}>
                        <div className="cert-thumb-wrapper">
                          <Image
                            src={certUrl}
                            alt={`Certificate ${num}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 200px"
                            style={{ objectFit: 'cover' }}
                            className="img-reveal"
                            onLoad={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.classList.add('loaded');
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
                );
              })}
            </div>
          </Gallery>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
