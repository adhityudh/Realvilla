'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import { BlogPost } from '../ui/BlogCard';
import { urlForImage } from '@/sanity/lib/image';
import './BlogFeaturedHero.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BlogFeaturedHeroProps {
  posts: BlogPost[];
  locale: string;
  dict?: any;
}

export default function BlogFeaturedHero({ posts, locale, dict }: BlogFeaturedHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION = 5000;
  const PROGRESS_INTERVAL = 50;

  const currentPost = posts[currentIndex];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  useEffect(() => {
    if (posts.length <= 1) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = (PROGRESS_INTERVAL / SLIDE_DURATION) * 100;
        return Math.min(prev + increment, 100);
      });
    }, PROGRESS_INTERVAL);

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, posts.length]);

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

    const tl = gsap.timeline();

    tl.fromTo(
      '.blog-featured-hero-title',
      { y: 35, opacity: 0, filter: 'blur(10px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'expo.out'
      }
    );

    tl.fromTo(
      '.blog-featured-hero .blog-card-meta',
      { y: 35, opacity: 0, filter: 'blur(10px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'expo.out',
      },
      0.2
    );

    gsap.set('.blog-featured-hero-cta-wrapper', { opacity: 1 });
    tl.fromTo(
      '.blog-featured-hero-cta',
      { y: 20, opacity: 0, filter: 'blur(5px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'expo.out',
      },
      0.3
    );

    return () => {
      st.kill();
      tl.kill();
      document.body.classList.remove('header-light-mode');
      document.body.classList.remove('header-black-bg');
    };
  }, [currentIndex]);

  const postUrl = `/${locale}/blog/${currentPost.slug}`;
  const formattedDate = currentPost.publishedAt
    ? new Date(currentPost.publishedAt).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <section 
      className="blog-featured-hero"
      ref={sectionRef}
      data-is-hero="true"
    >
      <div className="blog-featured-hero-bg">
        {currentPost.featuredImage?.asset?.url && (
          <Image
            key={currentIndex}
            src={urlForImage(currentPost.featuredImage).width(1920).url()}
            alt={currentPost.featuredImage?.alt || currentPost.title || 'Featured Blog Post'}
            fill
            priority
            className="blog-featured-hero-img"
          />
        )}
        <div className="blog-featured-hero-overlay" />
      </div>

      <div className="blog-featured-hero-content" ref={contentRef}>
        <div className="blog-card-meta">
          {currentPost.categories && currentPost.categories.length > 0 && (
            <span className="blog-card-category-badge">
              {currentPost.categories[0].title}
            </span>
          )}
          <div className="blog-card-date-author">
            {formattedDate && (
              <time className="blog-card-date" dateTime={currentPost.publishedAt}>
                {formattedDate}
              </time>
            )}
            {currentPost.author && currentPost.author.name && (
              <div className="blog-card-author">
                {currentPost.author.avatar?.asset?.url && (
                  <Image
                    src={urlForImage(currentPost.author.avatar).width(32).height(32).url()}
                    alt={currentPost.author.name}
                    width={24}
                    height={24}
                    className="blog-card-avatar"
                  />
                )}
                <span className="blog-card-author-name">{currentPost.author.name}</span>
              </div>
            )}
          </div>
        </div>

        {currentPost.title && <h1 className="blog-featured-hero-title">{currentPost.title}</h1>}

        {posts.length > 1 && (
          <div className="blog-featured-hero-dots">
            {posts.map((_, index) => (
              <button
                key={index}
                className={`blog-featured-hero-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentIndex && (
                  <div 
                    className="blog-featured-hero-dot-progress"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
        
        <div className="blog-featured-hero-body-col">
          <div className="blog-featured-hero-cta-wrapper">
            <Button
              href={postUrl}
              label={dict?.blog?.read_more || 'Read Article'}
              variant="pill"
              showArrow={true}
              className="blog-featured-hero-cta"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
