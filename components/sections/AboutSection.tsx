'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import './AboutSection.css';
import { urlForImage } from '@/sanity/lib/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AboutSection = ({ data, dict }: { data?: any, dict?: any }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const objectLayerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) return;

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

      if (!data?.disableEntranceAnimation) {
        if (bgLayerRef.current && objectLayerRef.current) {
          tl.fromTo(
            [bgLayerRef.current, objectLayerRef.current],
            { y: 40, opacity: 0, filter: 'blur(8px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.1, ease: 'power3.out' }
          );
        }

        if (profileRef.current) {
          const position = bgLayerRef.current && objectLayerRef.current ? '-=0.8' : 0;
          tl.fromTo(
            profileRef.current,
            { y: 40, opacity: 0, xPercent: -50, filter: 'blur(8px)' },
            { y: 0, opacity: 1, xPercent: -50, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
            position
          );
        }
      }

      if (!data?.disableHeaderEntranceAnimation) {
        if (taglineRef.current) {
          const position = !data?.disableEntranceAnimation ? '-=1' : 0;
          tl.fromTo(
            taglineRef.current,
            { y: 35, opacity: 0, filter: 'blur(10px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
            position
          );
        }

        if (headlineRef.current) {
          const position = !data?.disableEntranceAnimation || taglineRef.current ? '-=0.8' : 0;
          tl.fromTo(
            headlineRef.current,
            { y: 35, opacity: 0, filter: 'blur(10px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
            position
          );
        }
      }

      if (!data?.disableEntranceAnimation && contentRef.current) {
        const paragraphs = contentRef.current.querySelectorAll('.about-paragraph');
        const position = !data?.disableHeaderEntranceAnimation || !data?.disableEntranceAnimation ? '-=0.8' : 0;
        tl.fromTo(
          paragraphs,
          { y: 40, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.1, ease: 'power3.out' },
          position
        );
      }
    });

    return () => mm.revert();
  }, [data]);

  return (
    <section className={`about-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} ref={sectionRef} id={data?.id || 'about'}>
      <div className="about-visual-container">
        <div className="about-bg-layer" ref={bgLayerRef}>
          {bgImage && (
            <Image
              src={bgImage}
              alt=""
              fill
              sizes="50vw"
              placeholder={data.bgImage?.asset?.metadata?.lqip ? "blur" : "empty"}
              blurDataURL={data.bgImage?.asset?.metadata?.lqip}
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
              placeholder={data.objectImage?.asset?.metadata?.lqip ? "blur" : "empty"}
              blurDataURL={data.objectImage?.asset?.metadata?.lqip}
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
          <LightGallery
            speed={500}
            plugins={[lgThumbnail, lgZoom]}
            elementClassNames="about-certificates-gallery"
          >
            {certificates?.map((cert: any, index: number) => {
              const certUrl = urlForImage(cert).url();
              const num = index + 1;
              return (
                <a
                  key={index}
                  href={certUrl}
                  className="about-cert-item"
                >
                  <div className="cert-thumb-wrapper">
                    <Image
                      src={certUrl}
                      alt={`Certificate ${num}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 200px"
                      placeholder={cert.asset?.metadata?.lqip ? "blur" : "empty"}
                      blurDataURL={cert.asset?.metadata?.lqip}
                      style={{ objectFit: 'cover' }}
                      className="img-reveal"
                      onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.classList.add('loaded');
                      }}
                    />
                    <div className="cert-hover-overlay">
                      <span>{dict?.about?.view_certificate || 'View Certificate'}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </LightGallery>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
