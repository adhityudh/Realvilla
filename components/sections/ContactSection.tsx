'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ContactCard from '@/components/ui/ContactCard';
import './ContactSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactSection({ data, dict, contextData }: { data?: any, dict?: any, contextData?: any }) {
  const sectionRef = useRef<HTMLElement>(null);

  if (!data) return null;

  const headline = data.headline;
  const subtitle = data.subtitle;
  const marketData = data.marketData;
  const backgroundImage = data.backgroundImage;
  const backgroundImageMobile = data.backgroundImageMobile;
  const mode = data.mode || 'default';
  const contactList = data.contactList || [];
  const isShowcase = mode === 'showcase';

  useEffect(() => {
    if (!sectionRef.current) return;
    const section = sectionRef.current;
    const isMobile = window.innerWidth <= 1024;
    const hasBgOverride = !!(backgroundImage || backgroundImageMobile);

    let headerSt: ScrollTrigger | null = null;

    if (hasBgOverride) {
      // Same header behavior as GeneralHeroSection — applies on all screen sizes
      headerSt = ScrollTrigger.create({
        trigger: section,
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
    } else if (!isMobile) {
      headerSt = ScrollTrigger.create({
        trigger: section,
        start: 'top 50px',
        end: 'bottom 50px',
        onEnter: () => document.body.classList.add('header-light-mode'),
        onLeave: () => document.body.classList.remove('header-light-mode'),
        onEnterBack: () => document.body.classList.add('header-light-mode'),
        onLeaveBack: () => document.body.classList.remove('header-light-mode'),
      });
    }

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) {
      const card = section.querySelector('.contact-card');
      if (card) {
        gsap.set(card, { y: isMobile ? 180 : 80, opacity: 1, filter: 'none' });
      }
      gsap.set('.contact-headline', { opacity: 1 });
      const subtitle = section.querySelector('.contact-subtitle');
      if (subtitle) gsap.set(subtitle, { opacity: 0.7 });
      const marketItems = section.querySelectorAll('.contact-market-item');
      if (marketItems.length > 0) gsap.set(marketItems, { opacity: 1 });
      return () => {
        ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(st => st.kill());
      };
    }

    if (data?.disableEntranceAnimation) {
      const card = section.querySelector('.contact-card');
      if (card) {
        gsap.set(card, { y: isMobile ? 180 : 80, opacity: 1, filter: 'none' });
      }
    }

    if (data?.disableHeaderEntranceAnimation) {
      gsap.set('.contact-headline', { opacity: 1 });
      const subtitle = section.querySelector('.contact-subtitle');
      if (subtitle) gsap.set(subtitle, { opacity: 0.7 });
      const marketItems = section.querySelectorAll('.contact-market-item');
      if (marketItems.length > 0) gsap.set(marketItems, { opacity: 1 });
    } else {
      const splitText = (selector: string) => {
        section.querySelectorAll(selector).forEach((el) => {
          const words = (el as HTMLElement).innerText.split(' ');
          el.innerHTML = words.map((w) => `<span class="word-mask"><span class="word-inner">${w}</span></span>`).join(' ');
        });
      };
      splitText('.contact-headline');
      gsap.set('.contact-headline', { opacity: 1 });
    }

    const card = section.querySelector('.contact-card');
    if (!data?.disableEntranceAnimation && card) {
      gsap.set(card, { opacity: 0, y: isMobile ? 120 : 200, filter: 'blur(10px)' });
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    if (!data?.disableHeaderEntranceAnimation) {
      tl.fromTo(section.querySelectorAll('.contact-headline .word-inner'),
        { yPercent: 100, rotate: 5, filter: 'blur(10px)', opacity: 0 },
        { yPercent: 0, rotate: 0, filter: 'blur(0px)', opacity: 1, duration: 1.2, stagger: 0.08, ease: 'expo.out' },
        '-=0.6'
      );

      // Gracefully chain subtitle animation conditionally without triggering GSAP selector warnings
      const subtitleEl = section.querySelector('.contact-subtitle');
      if (subtitleEl) {
        tl.fromTo(subtitleEl,
          { y: 20, opacity: 0, filter: 'blur(4px)' },
          { y: 0, opacity: 0.7, filter: 'blur(0px)', duration: 1, ease: 'expo.out' },
          '-=0.8'
        );
      }

      // Gracefully chain market items animation conditionally
      const marketItems = section.querySelectorAll('.contact-market-item');
      if (marketItems.length > 0) {
        tl.fromTo(marketItems,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out' },
          '-=0.8'
        );
      }
    }

    // ALWAYS animate the card safely
    if (!data?.disableEntranceAnimation && card) {
      const position = !data?.disableHeaderEntranceAnimation ? '-=1.2' : 0;
      tl.fromTo(card,
        { y: isMobile ? 120 : 200, opacity: 0, filter: 'blur(10px)' },
        { y: isMobile ? 180 : 80, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out' },
        position
      );
    }

    // Recalculate trigger coordinates following potential sibling layout shifts
    ScrollTrigger.refresh();
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 500);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 1500);

    return () => {
      tl.kill();
      clearTimeout(t1);
      clearTimeout(t2);
      ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(st => st.kill());
    };
  }, [headline, subtitle, data]);



  return (
    <section className={`contact-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''} ${(backgroundImage || backgroundImageMobile) ? 'has-bg-override' : ''} ${isShowcase ? 'contact-showcase' : ''}`} id={data?.id || 'contact'} ref={sectionRef}>
      {(backgroundImage || backgroundImageMobile) && (
        <div className="contact-bg-override">
          <picture>
            {backgroundImageMobile && (
              <source
                media="(max-width: 1024px)"
                srcSet={backgroundImageMobile}
              />
            )}
            <Image
              src={backgroundImage || backgroundImageMobile}
              alt="Contact Background"
              fill
              priority
              className="contact-bg-img"
            />
          </picture>
          <div className="contact-bg-overlay" />
        </div>
      )}
      <div className="contact-big-logo-wrapper">
        <div className="contact-single-logo-container">
          <div className="contact-single-logo" />
        </div>
      </div>
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-description-area">
            <h2 className="contact-headline">{headline}</h2>
            {subtitle && <p className="contact-subtitle">{subtitle}</p>}
          </div>
          {marketData?.length > 0 && (
            <div className="contact-market-data">
              {marketData.map((item: any, idx: number) => (
                <div key={idx} className="contact-market-item">
                  <div className="market-data-number-row">
                    {item.prefix && <span className="market-data-prefix">{item.prefix}</span>}
                    <span className="market-data-value">{item.value}</span>
                    <span className="market-data-unit">{item.unit}</span>
                  </div>
                  <p className="market-data-label">{item.label}</p>
                </div>
              ))}
            </div>
          )}
          {isShowcase && contactList.length > 0 && (
            <div className="contact-showcase-list">
              {contactList.map((item: any, idx: number) => {
                const iconUrl = item.icon?.url;
                return (
                  <a
                    key={idx}
                    href={item.link}
                    className="btn-link-styled btn-link-md contact-showcase-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt={item.label}
                        className="btn-icon"
                      />
                    )}
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div className="contact-form-wrapper">
          <ContactCard 
            dict={dict}
            initialStep={data.initialStep || 'intent'}
            nextStepAsModal={data.nextStepAsModal === true}
            intentTitle={data.formTitle}
            intentSubtitle={data.formSubtitle}
            showIntentWhatsApp={data.showIntentWhatsApp}
            intentWhatsappMessageTemplate={data.intentWhatsappMessageTemplate}
            generalTitle={data.generalTitle}
            generalSubtitle={data.generalSubtitle}
            showGeneralWhatsApp={!data.hideGeneralWhatsApp}
            sellTitle={data.sellTitle}
            sellSubtitle={data.sellSubtitle}
            showSellWhatsApp={!data.hideSellWhatsApp}
            sellWhatsappMessageTemplate={data.sellWhatsappMessageTemplate}
            mortgageTitle={data.mortgageTitle}
            mortgageSubtitle={data.mortgageSubtitle}
            showMortgageWhatsApp={!data.hideMortgageWhatsApp}
            mortgageWhatsappMessageTemplate={data.mortgageWhatsappMessageTemplate}
            presetMessage={data.presetMessage}
            whatsappNumber={contextData?.whatsappNumber}
            whatsappMessageTemplate={data.whatsappMessageTemplate}
          />
        </div>
      </div>
    </section>
  );
}
