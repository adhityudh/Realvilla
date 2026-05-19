'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!sectionRef.current) return;
    const section = sectionRef.current;
    const isMobile = window.innerWidth <= 1024;

    if (!isMobile) {
      gsap.to(section.querySelector('.contact-content'), {
        y: -50, ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
      });
    }

    const splitText = (selector: string) => {
      section.querySelectorAll(selector).forEach((el) => {
        const words = (el as HTMLElement).innerText.split(' ');
        el.innerHTML = words.map((w) => `<span class="word-mask"><span class="word-inner">${w}</span></span>`).join(' ');
      });
    };
    splitText('.contact-headline');
    gsap.set('.contact-headline', { opacity: 1 });

    const card = section.querySelector('.contact-card');
    gsap.set(card, { opacity: 0, y: isMobile ? 120 : 200, filter: 'blur(10px)' });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 90%', toggleActions: 'play none none reverse' }
    });

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

    // ALWAYS animate the card safely
    if (card) {
      tl.fromTo(card,
        { y: isMobile ? 120 : 200, opacity: 0, filter: 'blur(10px)' },
        { y: isMobile ? 180 : 80, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out' },
        '-=1.2'
      );
    }

    if (!isMobile) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50px',
        end: 'bottom 50px',
        onEnter: () => document.body.classList.add('header-light-mode'),
        onLeave: () => document.body.classList.remove('header-light-mode'),
        onEnterBack: () => document.body.classList.add('header-light-mode'),
        onLeaveBack: () => document.body.classList.remove('header-light-mode'),
      });
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
  }, [headline, subtitle]);



  return (
    <section className="contact-section" id={data?.id || 'contact'} ref={sectionRef}>
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
          <div className="contact-market-data">
            {marketData?.map((item: any, idx: number) => (
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
