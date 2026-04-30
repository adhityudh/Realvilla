'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './TestimonialsSection.css';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    name: "James Robertson",
    text: "The team at Real Villa made our move to Tenerife effortless. Their knowledge of the local mortgage landscape was invaluable.",
    stars: 5,
    title: "Property Owner"
  },
  {
    id: 2,
    name: "Elena Sanchez",
    text: "Professional, transparent, and incredibly efficient. They found us the perfect villa in Costa Adeje within weeks.",
    stars: 5,
    title: "Investor"
  },
  {
    id: 3,
    name: "Marcus Weber",
    text: "Superior service and attention to detail. The virtual tour feature was a game-changer for us buying from abroad.",
    stars: 5,
    title: "International Buyer"
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    text: "Highly recommend for anyone looking for premium real estate in Spain. They truly understand luxury and privacy.",
    stars: 5,
    title: "Client"
  },
  {
    id: 5,
    name: "David Chen",
    text: "From the first call to the final signature, the experience was seamless. A truly world-class real estate partner.",
    stars: 5,
    title: "Homeowner"
  }
];

const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tickerWrapperRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const overlapImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !tickerWrapperRef.current || !overlapImgRef.current) return;

    // Entrance Animation
    const entranceTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });

    entranceTl.fromTo(
      [titleRef.current, tickerWrapperRef.current, overlapImgRef.current],
      { y: 60, opacity: 0, filter: 'blur(15px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        stagger: 0.2,
        ease: 'expo.out'
      }
    );

    // Ticker Animation
    if (!tickerRef.current) return;

    const ticker = tickerRef.current;
    const scrollWidth = ticker.scrollWidth;

    const tickerTl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "none" }
    });

    tickerTl.to(ticker, {
      x: `-${scrollWidth / 2}px`,
      duration: 35,
    });

    ticker.addEventListener('mouseenter', () => {
      gsap.to(tickerTl, { timeScale: 0.2, duration: 1.0, ease: 'power2.out' });
    });
    ticker.addEventListener('mouseleave', () => {
      gsap.to(tickerTl, { timeScale: 1.0, duration: 1.0, ease: 'power2.out' });
    });

    return () => {
      tickerTl.kill();
      ScrollTrigger.getAll().filter(st => st.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, []);

  // Duplicate items for seamless loop
  const displayItems = [...testimonials, ...testimonials];

  return (
    <section className="testimonials-section" ref={sectionRef}>
      <div className="testimonials-title-wrapper">
        <h2 className="testimonials-title" ref={titleRef}>100+ Success Stories in Tenerife</h2>
      </div>
      <div className="testimonials-ticker-wrapper" ref={tickerWrapperRef}>
        <div className="testimonials-ticker" ref={tickerRef}>
          {displayItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="testimonial-item">
              <div className="testimonial-header">
                <div className="stars">
                  {[...Array(item.stars)].map((_, i) => (
                    <svg key={i} className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <img
                  src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                  alt="Google"
                  className="google-g-icon"
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
          <img src="images/img-review.jpg" alt="Sell Property" />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
