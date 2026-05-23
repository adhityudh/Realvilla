'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import { smoothScrollToAnchor } from '@/lib/scroll';
import './GeneralHeroSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GeneralHeroSectionProps {
  data: {
    disableEntranceAnimation?: boolean;
    disableHeaderEntranceAnimation?: boolean;
    id?: string;
    title?: string;
    subtitle?: string;
    desktopLayout?: 'vertical' | 'horizontal';
    primaryButton?: {
      label: string;
      link: string;
    };
    secondaryButton?: {
      label: string;
      link: string;
    };
    backgroundImage?: string;
    backgroundImageMobile?: string;
    jumpLinks?: Array<{ label: string; link: string }>;
  };
  dict?: any;
}

export default function GeneralHeroSection({ data, dict }: GeneralHeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleJumpLinkClick = (e: React.MouseEvent<any>, url: string) => {
    smoothScrollToAnchor(e, url);
  };

  useEffect(() => {
    if (!contentRef.current || !sectionRef.current) return;

    // Smart ScrollTrigger behavior to manage light/dark system header transitions
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) {
          document.body.classList.remove('header-dark-mode');
          document.body.classList.add('header-light-mode');
          document.body.classList.add('header-black-bg');
        } else {
          if (self.progress === 1) {
            document.body.classList.remove('header-light-mode');
            document.body.classList.remove('header-black-bg');
            document.body.classList.add('header-dark-mode');
          } else {
            // We are at the top or overscrolling at the top (progress === 0)
            document.body.classList.remove('header-dark-mode');
            document.body.classList.add('header-light-mode');
            document.body.classList.add('header-black-bg');
          }
        }
      },
      onRefresh: (self) => {
        if (self.isActive) {
          document.body.classList.remove('header-dark-mode');
          document.body.classList.add('header-light-mode');
          document.body.classList.add('header-black-bg');
        } else {
          if (self.progress === 1) {
            document.body.classList.remove('header-light-mode');
            document.body.classList.remove('header-black-bg');
            document.body.classList.add('header-dark-mode');
          } else {
            document.body.classList.remove('header-dark-mode');
            document.body.classList.add('header-light-mode');
            document.body.classList.add('header-black-bg');
          }
        }
      }
    });

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) {
      return () => {
        st.kill();
        document.body.classList.remove('header-light-mode');
        document.body.classList.remove('header-black-bg');
      };
    }

    const tl = gsap.timeline();

    // 1. Animate title first
    if (!data?.disableHeaderEntranceAnimation) {
      tl.fromTo(
        '.general-hero-title',
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'expo.out'
        }
      );

      // 2. Animate subtitle next (Start at 0.3s)
      tl.fromTo(
        '.general-hero-subtitle',
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'expo.out',
        },
        0.3
      );
    }

    if (!data?.disableEntranceAnimation) {
      const positionOffset = !data?.disableHeaderEntranceAnimation ? 0.5 : 0;
      // 3. Animate CTAs
      // Ghost Blur pattern: keep wrapper opacity at 1 to preserve backdrop-filter in Chrome
      gsap.set('.general-hero-cta-wrapper', { opacity: 1 });
      tl.fromTo(
        '.general-hero-cta-primary, .general-hero-cta-secondary',
        { y: 20, opacity: 0, filter: 'blur(5px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.0,
          stagger: 0.1,
          ease: 'expo.out',
        },
        positionOffset
      );

      // 4. Animate jump links last
      tl.fromTo(
        '.general-jump-links',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out'
        },
        positionOffset + 0.3
      );
    }

    return () => {
      st.kill();
      tl.kill();
      document.body.classList.remove('header-light-mode');
      document.body.classList.remove('header-black-bg');
    };
  }, [data]);

  return (
    <section 
      className={`general-hero layout-${data.desktopLayout || 'vertical'} ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''}`} 
      ref={sectionRef}
      data-is-hero="true"
      id={data?.id || 'general-hero'}
    >
      <div className="general-hero-bg">
        {(data.backgroundImage || data.backgroundImageMobile) && (
          <picture>
            {data.backgroundImageMobile && (
              <source
                media="(max-width: 1024px)"
                srcSet={data.backgroundImageMobile}
              />
            )}
            <Image
              src={data.backgroundImage || data.backgroundImageMobile}
              alt="Hero Background"
              fill
              priority
              className="general-hero-img"
            />
          </picture>
        )}
        <div className="general-hero-overlay" />
      </div>

      <div className="general-hero-content" ref={contentRef}>
        {data.title && <h1 className="general-hero-title">{data.title}</h1>}
        
        <div className="general-hero-body-col">
          {data.subtitle && <p className="general-hero-subtitle">{data.subtitle}</p>}
          {(data.primaryButton?.label || data.secondaryButton?.label) && (
            <div className="general-hero-cta-wrapper">
              {data.primaryButton?.label && (
                <Button
                  href={data.primaryButton.link || '#'}
                  label={data.primaryButton.label}
                  variant="pill"
                  onClick={(e) => handleJumpLinkClick(e, data.primaryButton?.link || '#')}
                  showArrow={true}
                  className="general-hero-cta-primary"
                />
              )}
              {data.secondaryButton?.label && (
                <Button
                  href={data.secondaryButton.link || '#'}
                  label={data.secondaryButton.label}
                  variant="pill"
                  onClick={(e) => handleJumpLinkClick(e, data.secondaryButton?.link || '#')}
                  showArrow={true}
                  className="general-hero-cta-secondary"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {data.jumpLinks && data.jumpLinks.length > 0 && (
        <div className="general-jump-links">
          {data.jumpLinks.map((link, idx) => (
            <Button
              key={idx}
              label={link.label}
              href={link.link || '#'}
              onClick={(e) => handleJumpLinkClick(e, link.link)}
              variant="link"
              size="md"
              className="jump-link"
              priority={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}
