'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './TestimonialsSection.css';
import { urlForImage } from '@/sanity/lib/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const TestimonialsSection = ({ data, dict }: { data?: any, dict?: any }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tickerWrapperRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const overlapImgRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const title = data.title;
  const testimonials = data.testimonials;
  const overlapImg = data.overlapImage?.asset ? urlForImage(data.overlapImage).url() : null;

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !tickerWrapperRef.current || !overlapImgRef.current) return;

    if (!data?.disableEntranceAnimation || !data?.disableHeaderEntranceAnimation) {
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      const headerEls = [titleRef.current].filter(Boolean);
      const contentEls = [tickerWrapperRef.current, overlapImgRef.current].filter(Boolean);

      if (!data?.disableHeaderEntranceAnimation) {
        gsap.set(headerEls, { opacity: 0, y: 35, filter: 'blur(10px)' });
      }
      if (!data?.disableEntranceAnimation) {
        gsap.set(contentEls, { opacity: 0, y: 40, filter: 'blur(8px)' });
      }

      if (!data?.disableHeaderEntranceAnimation) {
        entranceTl.to(
          headerEls,
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
        const position = !data?.disableHeaderEntranceAnimation ? '-=0.8' : 0;
        entranceTl.to(
          contentEls,
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.0,
            stagger: 0.1,
            ease: 'power3.out'
          },
          position
        );
      }
    }

    if (!tickerRef.current) return;
    const ticker = tickerRef.current;
    const scrollWidth = ticker.scrollWidth;
    const tickerTl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    tickerTl.to(ticker, { x: `-${scrollWidth / 2}px`, duration: 35 });

    const handleEnter = () => gsap.to(tickerTl, { timeScale: 0.2, duration: 1.0, ease: 'power2.out' });
    const handleLeave = () => gsap.to(tickerTl, { timeScale: 1.0, duration: 1.0, ease: 'power2.out' });
    ticker.addEventListener('mouseenter', handleEnter);
    ticker.addEventListener('mouseleave', handleLeave);

    return () => {
      tickerTl.kill();
      ticker.removeEventListener('mouseenter', handleEnter);
      ticker.removeEventListener('mouseleave', handleLeave);
      ScrollTrigger.getAll().filter(st => st.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, [data]);

  if (!testimonials) return null;
  const displayItems = [...testimonials, ...testimonials];

  return (
    <section className={`testimonials-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} ref={sectionRef} id={data?.id || 'testimonials'}>
      <div className="testimonials-title-wrapper">
        <h2 className="testimonials-title" ref={titleRef}>{title}</h2>
      </div>
      <div className="testimonials-ticker-wrapper" ref={tickerWrapperRef}>
        <div className="testimonials-ticker" ref={tickerRef}>
          {displayItems.map((item: any, index: number) => (
            <div key={index} className="testimonial-item">
              <div className="testimonial-header">
                <div className="stars">
                  {[...Array(item.stars || 5)].map((_, i) => (
                    <svg key={i} className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <Image
                  src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                  alt="Google"
                  className="google-g-icon"
                  width={24}
                  height={24}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="testimonial-text">"{item.text}"</p>
              <div className="testimonial-footer">
                <div className="reviewer-info">
                  <div className="reviewer-name">{item.name}</div>
                  <div className="reviewer-title">{item.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonials-overlap-img" ref={overlapImgRef}>
        <div className="img-aspect-box">
          {overlapImg && (
            <Image 
              src={overlapImg} 
              alt="Review" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw" 
              style={{ objectFit: 'cover' }} 
              loading="lazy" 
              className="img-reveal"
              onLoad={(e) => e.currentTarget.classList.add('loaded')}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
