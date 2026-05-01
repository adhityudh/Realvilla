'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/ui/Button';
import './ContactSection.css';

gsap.registerPlugin(ScrollTrigger);

type FormStep = 'intent' | 'general' | 'sell';

const marketData = [
  {
    id: 1,
    value: "2,850",
    prefix: "€",
    unit: "per m²",
    label: "average market valuation in tenerife."
  },
  {
    id: 2,
    value: "8.4",
    prefix: "+",
    unit: "%",
    label: "steady annual property appreciation."
  },
  {
    id: 3,
    value: "3.75",
    prefix: "",
    unit: "%",
    label: "current euribor rate for financing."
  }
];

const intentOptions = [
  { key: 'general' as const, label: 'General Inquiry' },
  { key: 'sell' as const, label: 'Sell a Property' },
  { key: 'buy' as const, label: 'Buy a Property' },
  { key: 'invest' as const, label: 'Invest' },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<FormStep>('intent');
  const router = useRouter();

  const handleIntentClick = (key: string) => {
    switch (key) {
      case 'buy':
        router.push('/buy');
        break;
      case 'invest':
        router.push('/invest');
        break;
      case 'general':
        setStep('general');
        break;
      case 'sell':
        setStep('sell');
        break;
    }
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const isMobile = window.innerWidth <= 1024;

    // Background parallax
    gsap.to(section.querySelector('.contact-bg'), {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    // Content parallax
    gsap.to(section.querySelector('.contact-content'), {
      y: -50,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    // Text splitting logic for hero-style animations
    const splitText = (selector: string) => {
      section.querySelectorAll(selector).forEach((el) => {
        const words = (el as HTMLElement).innerText.split(' ');
        el.innerHTML = words
          .map((w) => `<span class="word-mask"><span class="word-inner">${w}</span></span>`)
          .join(' ');
      });
    };
    splitText('.contact-headline');
    splitText('.contact-subtitle');
    gsap.set('.contact-headline, .contact-subtitle', { opacity: 1 });

    const card = section.querySelector('.contact-card');

    if (isMobile) {
      gsap.set(card, { opacity: 0, y: 40, filter: 'blur(10px)' });
    } else {
      gsap.set(card, { opacity: 1, y: 0, filter: 'blur(0px)' });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });

    // Headline animation (word by word)
    tl.fromTo(section.querySelectorAll('.contact-headline .word-inner'),
      { yPercent: 100, rotate: 5, filter: 'blur(10px)', opacity: 0 },
      { yPercent: 0, rotate: 0, filter: 'blur(0px)', opacity: 1, duration: 1.2, stagger: 0.08, ease: 'expo.out' },
      '-=0.6'
    );

    // Subtitle animation (word by word)
    tl.fromTo(section.querySelectorAll('.contact-subtitle .word-inner'),
      { yPercent: 50, opacity: 0, filter: 'blur(5px)' },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.02, ease: 'power3.out' },
      '-=1.0'
    );

    // Market items animation
    tl.fromTo(section.querySelectorAll('.contact-market-item'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out' },
      '-=0.8'
    );

    if (isMobile) {
      tl.fromTo(card,
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out' },
        '-=1.2'
      );
    } else {
      tl.set(card, { opacity: 1, y: 0, filter: 'blur(0px)' }, '-=1.2');
    }

    // Toggle header light mode when section overlaps header
    const header = document.querySelector<HTMLElement>('.header');
    if (header) {
      ScrollTrigger.create({
        trigger: section,
        start: () => `top ${header.offsetHeight}px`,
        end: () => `bottom ${header.offsetHeight}px`,
        onEnter: () => {
          document.body.classList.add('header-light-mode');
          document.body.classList.add('header-black-bg');
        },
        onLeave: () => {
          document.body.classList.remove('header-light-mode');
          document.body.classList.remove('header-black-bg');
        },
        onEnterBack: () => {
          document.body.classList.add('header-light-mode');
          document.body.classList.add('header-black-bg');
        },
        onLeaveBack: () => {
          document.body.classList.remove('header-light-mode');
          document.body.classList.remove('header-black-bg');
        }
      });
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(st => st.kill());
    };
  }, []);

  const renderIntentStep = () => (
    <div className="contact-form contact-intent">
      <h3 className="form-title">How can we assist you?</h3>
      <p className="form-subtitle">Select an option below to get started with your inquiry.</p>
      <div className="intent-options">
        {intentOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className="intent-option-btn"
            onClick={() => handleIntentClick(option.key)}
          >
            <span className="intent-option-label">{option.label}</span>
            <span className="intent-option-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGeneralForm = () => (
    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
      <button
        type="button"
        className="form-back-btn"
        onClick={() => setStep('intent')}
      >
        ← Go Back
      </button>
      <h3 className="form-title">Send us a message</h3>
      <p className="form-subtitle">We will contact you as soon as possible.</p>
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input type="text" id="name" placeholder="Enter your full name" />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input type="email" id="email" placeholder="Enter your email address" />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input type="tel" id="phone" placeholder="Enter your phone number" />
      </div>
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea id="message" rows={4} placeholder="How can we help you?"></textarea>
      </div>
      <Button 
        type="submit" 
        variant="dark" 
        label="SEND MESSAGE" 
        className="form-submit-btn" 
        showArrow={true} 
      />
    </form>
  );

  const renderSellForm = () => (
    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
      <button
        type="button"
        className="form-back-btn"
        onClick={() => setStep('intent')}
      >
        ← Go Back
      </button>
      <h3 className="form-title">Start selling your property</h3>
      <p className="form-subtitle">Fill in the details below and an expert will reach out to you.</p>
      <div className="form-group">
        <label htmlFor="sell-name">Full Name <span className="form-required">*</span></label>
        <input type="text" id="sell-name" placeholder="Enter your full name" required />
      </div>
      <div className="form-group">
        <label htmlFor="sell-phone">Phone Number <span className="form-required">*</span></label>
        <input type="tel" id="sell-phone" placeholder="Enter your phone number" required />
      </div>
      <div className="form-group">
        <label htmlFor="sell-email">Email Address <span className="form-optional">(Optional)</span></label>
        <input type="email" id="sell-email" placeholder="Enter your email address" />
      </div>
      <div className="form-group">
        <label htmlFor="sell-municipality">Municipality (Tenerife)</label>
        <input type="text" id="sell-municipality" placeholder="e.g. Adeje, Arona, Santa Cruz..." />
      </div>
      <div className="form-group">
        <label htmlFor="sell-property-type">Property Type</label>
        <select id="sell-property-type" className="form-select" defaultValue="">
          <option value="" disabled>Select property type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="townhouse">Townhouse</option>
          <option value="villa">Villa</option>
          <option value="land">Land</option>
        </select>
      </div>

      <div className="form-legal-checkboxes">
        <label className="form-checkbox-label">
          <input type="checkbox" className="form-checkbox" required />
          <span className="form-checkbox-text">
            I authorize a REALVILLA associate to contact me for informational purposes
          </span>
        </label>
        <label className="form-checkbox-label">
          <input type="checkbox" className="form-checkbox" required />
          <span className="form-checkbox-text">
            I have read, understand, and accept the Terms and Conditions and the Privacy Policy
          </span>
        </label>
      </div>

      <Button 
        type="submit" 
        variant="dark" 
        label="START SELLING" 
        className="form-submit-btn" 
        showArrow={true} 
      />
    </form>
  );

  return (
    <section className="contact-section" id="contact" ref={sectionRef}>
      <div className="contact-bg">
        <Image
          src="/images/img-cta-desktop.webp"
          alt=""
          fill
          sizes="100vw"
          className="desktop-only"
          style={{ objectFit: 'cover' }}
        />
        <Image
          src="/images/img-cta-mobile.webp"
          alt=""
          fill
          sizes="100vw"
          className="mobile-only"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="contact-grain"></div>
      <div className="contact-bottom-fade"></div>
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-description-area">
            <h2 className="contact-headline">Your Best Window of Opportunity</h2>
            <p className="contact-subtitle">
              Capitalize on favorable market trends. Whether you are seeking a lucrative investment or a bespoke island sanctuary, our experts are ready to guide your next move.
            </p>
          </div>

          <div className="contact-market-data">
            {marketData.map((item) => (
              <div key={item.id} className="contact-market-item">
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
