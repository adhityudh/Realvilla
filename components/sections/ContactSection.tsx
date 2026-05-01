'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ContactSection.css';

gsap.registerPlugin(ScrollTrigger);

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

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

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

    const elements = section.querySelectorAll('.contact-tagline, .contact-headline, .contact-market-item');
    const card = section.querySelector('.contact-card');

    gsap.set(elements, { opacity: 0, y: 40, filter: 'blur(10px)' });

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

    tl.fromTo(elements,
      { y: 40, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.15, ease: 'expo.out' }
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

  return (
    <section className="contact-section" id="contact" ref={sectionRef}>
      <div className="contact-bg"></div>
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-tagline">Contact Us</div>
          <h2 className="contact-headline">Your Best Window of Opportunity</h2>

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
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <h3 className="form-title">Send us a message</h3>
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
              <button type="submit" className="form-submit-btn">Submit Request</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
