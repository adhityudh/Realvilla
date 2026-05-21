'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SearchModal from './SearchModal';
import Button from '../ui/Button';
import { smoothScrollToAnchor } from '@/lib/scroll';
import './BuyHeroSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BuyHeroSectionProps {
  data: {
    disableEntranceAnimation?: boolean;
    disableHeaderEntranceAnimation?: boolean;
    id?: string;
    title?: string;
    backgroundImage?: string;
    searchPlaceholder?: string;
    jumpLinks?: Array<{ label: string; link: string }>;
  };
  dict?: any;
}

export default function BuyHeroSection({ data, dict }: BuyHeroSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [placeholderText, setPlaceholderText] = useState('');
  const fullPlaceholder = data.searchPlaceholder || dict?.hero?.search_placeholder;

  const handleJumpLinkClick = (e: React.MouseEvent<any>, url: string) => {
    smoothScrollToAnchor(e, url);
  };

  useEffect(() => {
    if (!contentRef.current || !sectionRef.current) return;

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
      // Ensure it checks state immediately on creation
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
      setPlaceholderText(fullPlaceholder);
      return () => {
        st.kill();
        document.body.classList.remove('header-light-mode');
        document.body.classList.remove('header-black-bg');
      };
    }

    const tl = gsap.timeline();

    if (!data?.disableEntranceAnimation) {
      // Set initial states for elements to avoid flash
      gsap.set(['.buy-search-trigger', '.buy-filter-btn'], { 
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderColor: 'rgba(255, 255, 255, 0)',
        y: 20,
        opacity: 0,
        filter: 'blur(5px)'
      });
      gsap.set(['.buy-search-trigger > *', '.buy-filter-btn > *'], { opacity: 0 });
    }

    // 1. Animate title first
    if (!data?.disableHeaderEntranceAnimation) {
      tl.fromTo(
        '.buy-hero-title',
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'expo.out'
        }
      );
    }

    if (!data?.disableEntranceAnimation) {
      const positionOffset = !data?.disableHeaderEntranceAnimation ? 0.4 : 0;
      // 2. Animate search trigger container (y, opacity, blur)
      tl.to(
        ['.buy-search-trigger', '.buy-filter-btn'],
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.0,
          ease: 'expo.out',
        },
        positionOffset
      );

      // 3. Animate the 'Glass' appearance (bg/border)
      tl.to(
        ['.buy-search-trigger', '.buy-filter-btn'],
        {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          duration: 1.5,
          ease: 'power2.out'
        },
        positionOffset + 0.2
      );

      // 4. Animate trigger content (icon and text)
      tl.to(
        ['.buy-search-trigger > *', '.buy-filter-btn > *'],
        {
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out'
        },
        positionOffset + 0.4
      );

      // 5. Animate jump links
      tl.fromTo(
        '.buy-jump-links',
        { y: 20, opacity: 0, filter: 'blur(5px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.0,
          ease: 'expo.out'
        },
        positionOffset + 0.6
      );
    }

    // Typing animation for placeholder
    let typingTimer: any;
    let typingTimeout: any;
    if (!data?.disableEntranceAnimation) {
      const startTyping = () => {
        let i = 0;
        const timer = setInterval(() => {
          setPlaceholderText(fullPlaceholder.slice(0, i));
          i++;
          if (i > fullPlaceholder.length) clearInterval(timer);
        }, 30);
        return timer;
      };
      typingTimeout = setTimeout(() => {
        typingTimer = startTyping();
      }, 600); // Start sooner
    } else {
      setPlaceholderText(fullPlaceholder);
    }

    return () => {
      st.kill();
      tl.kill();
      if (typingTimeout) clearTimeout(typingTimeout);
      if (typingTimer) clearInterval(typingTimer);
      document.body.classList.remove('header-light-mode');
      document.body.classList.remove('header-black-bg');
    };
  }, [fullPlaceholder, data]);

  return (
    <>
      <section className={`buy-hero ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''}`} ref={sectionRef} data-is-hero="true" id={data?.id || 'buy-hero'}>
        <div className="buy-hero-bg">
          {data.backgroundImage && (
            <Image
              src={data.backgroundImage}
              alt="Buy Background"
              fill
              priority
              className="buy-hero-img"
            />
          )}
          <div className="buy-hero-overlay" />
        </div>

        <div className="buy-hero-content" ref={contentRef}>
          <h1 className="buy-hero-title">{data.title || dict?.hero?.title}</h1>

          <div className="buy-search-trigger-container">
            <div
              className="buy-search-trigger"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="search-icon">
                <Image
                  src="/icons/search.svg"
                  alt="Search"
                  width={20}
                  height={20}
                />
              </span>
              <input
                type="text"
                readOnly
                placeholder={placeholderText}
                className="buy-search-input-mock"
              />
            </div>
            <div 
              className="buy-filter-btn"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('open-filter-sidebar'));
                }
              }}
              aria-label="Filter"
              role="button"
            >
              <Image
                src="/icons/tune.svg"
                alt="Filter"
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>

        {data.jumpLinks && data.jumpLinks.length > 0 && (
          <div className="buy-jump-links">
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

      <SearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dict={dict}
      />
    </>
  );
}
