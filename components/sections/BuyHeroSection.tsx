'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SearchModal from './SearchModal';
import Button from '../ui/Button';
import './BuyHeroSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BuyHeroSectionProps {
  data: {
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

  useEffect(() => {
    if (!contentRef.current || !sectionRef.current) return;

    const tl = gsap.timeline();

    // Set initial states for elements to avoid flash
    gsap.set(['.buy-search-trigger', '.buy-filter-btn'], { 
      backgroundColor: 'rgba(255, 255, 255, 0)',
      borderColor: 'rgba(255, 255, 255, 0)',
      y: 20,
      opacity: 0
    });
    gsap.set(['.buy-search-trigger > *', '.buy-filter-btn > *'], { opacity: 0 });

    // 1. Animate title first
    tl.fromTo(
      '.buy-hero-title',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out'
      }
    );

    // 2. Animate search trigger container (y and opacity) - Start at 0.4s
    tl.to(
      ['.buy-search-trigger', '.buy-filter-btn'],
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'expo.out',
      },
      0.4
    );

    // 3. Animate the 'Glass' appearance (bg/border) - Start at 0.6s
    tl.to(
      ['.buy-search-trigger', '.buy-filter-btn'],
      {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        duration: 1.5,
        ease: 'power2.out'
      },
      0.6
    );

    // 4. Animate trigger content (icon and text) - Start at 0.8s
    tl.to(
      ['.buy-search-trigger > *', '.buy-filter-btn > *'],
      {
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      },
      0.8
    );

    // 5. Animate jump links - Start at 1.0s
    tl.fromTo(
      '.buy-jump-links',
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'expo.out'
      },
      1.0
    );

    // Typing animation for placeholder
    const startTyping = () => {
      let i = 0;
      const timer = setInterval(() => {
        setPlaceholderText(fullPlaceholder.slice(0, i));
        i++;
        if (i > fullPlaceholder.length) clearInterval(timer);
      }, 30);
      return timer;
    };

    const typingTimeout = setTimeout(startTyping, 600); // Start sooner

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
          document.body.classList.remove('header-light-mode');
          document.body.classList.remove('header-black-bg');
          // Only add dark mode if we've scrolled past the hero (self.progress === 1)
          if (self.progress === 1) {
            document.body.classList.add('header-dark-mode');
          }
        }
      },
      // Ensure it checks state immediately on creation
      onRefresh: (self) => {
        if (self.isActive) {
          document.body.classList.remove('header-dark-mode');
          document.body.classList.add('header-light-mode');
          document.body.classList.add('header-black-bg');
        }
      }
    });

    return () => {
      st.kill();
      clearTimeout(typingTimeout);
      document.body.classList.remove('header-light-mode');
      document.body.classList.remove('header-black-bg');
    };
  }, [fullPlaceholder]);

  return (
    <>
      <section className="buy-hero" ref={sectionRef}>
        <div className="buy-hero-bg">
          <Image
            src={data.backgroundImage || '/images/img-hero-buy.png'}
            alt="Buy Background"
            fill
            priority
            className="buy-hero-img"
          />
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
                variant="link"
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
