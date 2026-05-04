'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/ui/Button';
import './ContactSection.css';
import { urlForImage } from '@/sanity/lib/image';

import { HEADER_LETTERS } from '@/lib/letters';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type FormStep = 'intent' | 'general' | 'sell';

const intentOptions = [
  { key: 'general' as const, label: 'General Inquiry' },
  { key: 'sell' as const, label: 'Sell a Property' },
  { key: 'buy' as const, label: 'Buy a Property' },
  { key: 'invest' as const, label: 'Invest' },
];

export default function ContactSection({ data, dict }: { data?: any, dict?: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<FormStep>('intent');
  const router = useRouter();

  if (!data) return null;

  // Dictionary helpers for easier access
  const c = dict?.contact || {};
  const intentDict = c.intent || {
    title: "How can we assist you?",
    subtitle: "Select an option below to get started with your inquiry.",
    options: { general: "General Inquiry", sell: "Sell a Property", buy: "Buy a Property", invest: "Invest" }
  };
  const generalDict = c.general || {
    back: "Go Back",
    title: "Send us a message",
    subtitle: "We will contact you as soon as possible.",
    fields: { 
      name: "Full Name", name_placeholder: "Enter your full name",
      email: "Email Address", email_placeholder: "Enter your email address",
      phone: "Phone Number", phone_placeholder: "Enter your phone number",
      message: "Message", message_placeholder: "How can we help you?"
    },
    submit: "SEND MESSAGE"
  };
  const sellDict = c.sell || {
    back: "Go Back",
    title: "Start selling your property",
    subtitle: "Fill in the details below and an expert will reach out to you.",
    fields: {
      name: "Full Name", name_placeholder: "Enter your full name",
      phone: "Phone Number", phone_placeholder: "Enter your phone number",
      email: "Email Address", email_placeholder: "Enter your email address",
      optional: "(Optional)", required: "*",
      municipality: "Municipality (Tenerife)", municipality_placeholder: "e.g. Adeje, Arona, Santa Cruz...",
      property_type: "Property Type", select_type: "Select property type",
      types: { apartment: "Apartment", house: "House", townhouse: "Townhouse", villa: "Villa", land: "Land" }
    },
    legal: {
      authorize: "I authorize a REALVILLA associate to contact me for informational purposes",
      terms: "I have read, understand, and accept the Terms and Conditions and the Privacy Policy"
    },
    submit: "START SELLING"
  };

  const headline = data.headline;
  const subtitle = data.subtitle;
  const marketData = data.marketData;
  const totalWidth = HEADER_LETTERS.reduce((acc, l) => acc + l.width, 0);

  const handleIntentClick = (key: string) => {
    switch (key) {
      case 'buy': router.push('/buy'); break;
      case 'invest': router.push('/invest'); break;
      case 'general': setStep('general'); break;
      case 'sell': setStep('sell'); break;
    }
  };

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
    splitText('.contact-subtitle');
    gsap.set('.contact-headline, .contact-subtitle', { opacity: 1 });

    const card = section.querySelector('.contact-card');
    gsap.set(card, { opacity: 0, y: isMobile ? 120 : 200, filter: 'blur(10px)' });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    tl.fromTo(section.querySelectorAll('.contact-headline .word-inner'),
      { yPercent: 100, rotate: 5, filter: 'blur(10px)', opacity: 0 },
      { yPercent: 0, rotate: 0, filter: 'blur(0px)', opacity: 1, duration: 1.2, stagger: 0.08, ease: 'expo.out' },
      '-=0.6'
    ).fromTo(section.querySelectorAll('.contact-subtitle .word-inner'),
      { yPercent: 50, opacity: 0, filter: 'blur(5px)' },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.02, ease: 'power3.out' },
      '-=1.0'
    ).fromTo(section.querySelectorAll('.contact-market-item'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out' },
      '-=0.8'
    ).fromTo(card,
      { y: isMobile ? 120 : 200, opacity: 0, filter: 'blur(10px)' },
      { y: isMobile ? 120 : 144, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out' },
      '-=1.2'
    );

    ScrollTrigger.create({
      trigger: section,
      start: 'top 50px',
      end: 'bottom 50px',
      onEnter: () => document.body.classList.add('header-light-mode'),
      onLeave: () => document.body.classList.remove('header-light-mode'),
      onEnterBack: () => document.body.classList.add('header-light-mode'),
      onLeaveBack: () => document.body.classList.remove('header-light-mode'),
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(st => st.kill());
    };
  }, [headline, subtitle]);

  const renderIntentStep = () => (
    <div className="contact-form contact-intent">
      <h3 className="form-title">{intentDict.title}</h3>
      <p className="form-subtitle">{intentDict.subtitle}</p>
      <div className="intent-options">
        {intentOptions.map((option) => (
          <button key={option.key} type="button" className="intent-option-btn" onClick={() => handleIntentClick(option.key)}>
            <span className="intent-option-label">{intentDict.options[option.key] || option.label}</span>
            <span className="intent-option-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGeneralForm = () => (
    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
      <button type="button" className="form-back-btn" onClick={() => setStep('intent')}>← {generalDict.back}</button>
      <h3 className="form-title">{generalDict.title}</h3>
      <p className="form-subtitle">{generalDict.subtitle}</p>
      <div className="form-group"><label htmlFor="name">{generalDict.fields.name}</label><input type="text" id="name" placeholder={generalDict.fields.name_placeholder} /></div>
      <div className="form-group"><label htmlFor="email">{generalDict.fields.email}</label><input type="email" id="email" placeholder={generalDict.fields.email_placeholder} /></div>
      <div className="form-group"><label htmlFor="phone">{generalDict.fields.phone}</label><input type="tel" id="phone" placeholder={generalDict.fields.phone_placeholder} /></div>
      <div className="form-group"><label htmlFor="message">{generalDict.fields.message}</label><textarea id="message" rows={4} placeholder={generalDict.fields.message_placeholder}></textarea></div>
      <Button type="submit" variant="dark" label={generalDict.submit} className="form-submit-btn" showArrow={true} />
    </form>
  );

  const renderSellForm = () => (
    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
      <button type="button" className="form-back-btn" onClick={() => setStep('intent')}>← {sellDict.back}</button>
      <h3 className="form-title">{sellDict.title}</h3>
      <p className="form-subtitle">{sellDict.subtitle}</p>
      <div className="form-group"><label htmlFor="sell-name">{sellDict.fields.name} <span className="form-required">{sellDict.fields.required}</span></label><input type="text" id="sell-name" placeholder={sellDict.fields.name_placeholder} required /></div>
      <div className="form-group"><label htmlFor="sell-phone">{sellDict.fields.phone} <span className="form-required">{sellDict.fields.required}</span></label><input type="tel" id="sell-phone" placeholder={sellDict.fields.phone_placeholder} required /></div>
      <div className="form-group"><label htmlFor="sell-email">{sellDict.fields.email} <span className="form-optional">{sellDict.fields.optional}</span></label><input type="email" id="sell-email" placeholder={sellDict.fields.email_placeholder} /></div>
      <div className="form-group"><label htmlFor="sell-municipality">{sellDict.fields.municipality}</label><input type="text" id="sell-municipality" placeholder={sellDict.fields.municipality_placeholder} /></div>
      <div className="form-group">
        <label htmlFor="sell-property-type">{sellDict.fields.property_type}</label>
        <select id="sell-property-type" className="form-select" defaultValue="">
          <option value="" disabled>{sellDict.fields.select_type}</option>
          {Object.entries(sellDict.fields.types).map(([key, value]) => (
            <option key={key} value={key}>{value as string}</option>
          ))}
        </select>
      </div>
      <div className="form-legal-checkboxes">
        <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" required /><span className="form-checkbox-text">{sellDict.legal.authorize}</span></label>
        <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" required /><span className="form-checkbox-text">{sellDict.legal.terms}</span></label>
      </div>
      <Button type="submit" variant="dark" label={sellDict.submit} className="form-submit-btn" showArrow={true} />
    </form>
  );

  return (
    <section className="contact-section" id="contact" ref={sectionRef}>
      <div className="contact-big-logo-wrapper">
        <div className="contact-big-logo">
          {(() => {
            let currentPos = 0;
            const displayedLetters = HEADER_LETTERS.slice(0, 5);
            const totalWidth = displayedLetters.reduce((acc, l) => acc + l.width, 0);

            return displayedLetters.map((letter, i) => {
              const widthPercent = (letter.width / totalWidth) * 100;
              // background-position percentage is (offset / (imageWidth - containerWidth)) * 100
              const posPercent = totalWidth > letter.width
                ? (currentPos / (totalWidth - letter.width)) * 100
                : 0;

              const bgSize = (totalWidth / letter.width) * 100;

              const element = (
                <div
                  key={i}
                  className="contact-big-letter"
                  style={{
                    width: `${widthPercent}%`,
                    '--letter-svg': `url(${letter.svg})`,
                    '--bg-size': `${bgSize}%`,
                    '--bg-pos': `${posPercent}%`
                  } as any}
                />
              );

              currentPos += letter.width;
              return element;
            });
          })()}
        </div>
      </div>
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-description-area">
            <h2 className="contact-headline">{headline}</h2>
            <p className="contact-subtitle">{subtitle}</p>
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
          <div className="contact-card">
            {step === 'intent' && renderIntentStep()}
            {step === 'general' && renderGeneralForm()}
            {step === 'sell' && renderSellForm()}
          </div>
        </div>
      </div>
    </section>
  );
}
