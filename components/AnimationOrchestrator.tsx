'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function AnimationOrchestrator() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    function splitText(selector: string) {
      document.querySelectorAll(selector).forEach(el => {
        const words = (el as HTMLElement).innerText.split(' ');
        el.innerHTML = words.map(w => `<span class="word-mask"><span class="word-inner">${w}</span></span>`).join(' ');
      });
    }

    splitText('.hero-title');
    splitText('.hero-subtitle');
    gsap.set('.hero-title, .hero-subtitle', { opacity: 1 });

    // Valuation entrance
    const valuationSection = document.querySelector('.valuation-section');
    if (valuationSection) {
      gsap.set('.valuation-tagline, .valuation-headline, .valuation-body, .valuation-trust, .valuation-cta-desktop, .valuation-cta-mobile, .valuation-card', { opacity: 0, y: 40, filter: 'blur(10px)' });
      ScrollTrigger.create({
        trigger: valuationSection, start: 'top 50%',
        onEnter: () => {
          gsap.to('.valuation-tagline, .valuation-headline, .valuation-body, .valuation-trust, .valuation-cta-desktop, .valuation-cta-mobile', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2, ease: 'expo.out', clearProps: 'all' });
          gsap.to('.valuation-card', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, delay: 0.5, ease: 'expo.out', clearProps: 'all' });
        },
        once: true
      });
    }

    // Lenis
    const isMobile = window.innerWidth <= 1024;
    const lenis = new Lenis({
      duration: isMobile ? 0.8 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.6, direction: 'vertical', gestureDirection: 'vertical',
      smoothWheel: true, smoothTouch: true,
      touchMultiplier: isMobile ? 1.8 : 2, infinite: false,
    } as ConstructorParameters<typeof Lenis>[0]);

    (window as any).lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    // Extra force scroll to top
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (lenis) lenis.scrollTo(0, { immediate: true });
    }, 50);

    let morphTlInstance: gsap.core.Timeline | null = null;
    let morphSTInstance: ScrollTrigger | null = null;
    let navSTInstance: ScrollTrigger | null = null;
    let mobileHeroFadeST: ScrollTrigger | null = null;
    let headerColorST: ScrollTrigger | null = null;
    let headerPillST: ScrollTrigger | null = null;

    // Intro timeline
    const tl = gsap.timeline({
      delay: 0, paused: true,
      onComplete: () => {
        window.scrollTo(0, 0);
        lenis.scrollTo(0, { immediate: true });
        lenis.start();
        document.body.classList.remove('preloading');
        gsap.to('.hero-bg-video', { yPercent: 30, force3D: true, ease: 'none', scrollTrigger: { trigger: '.main-hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
        gsap.to('.hero-overlay', { scrollTrigger: { trigger: '.main-hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }, opacity: 0.85, ease: 'none' });
      }
    });

    const heroEl = document.querySelector('.main-hero') as HTMLElement;
    if (!heroEl) return;

    const heroRect = heroEl.getBoundingClientRect();
    const heroW = heroRect.width, heroH = heroRect.height;
    const boxW = isMobile ? Math.min(window.innerHeight * 0.30, window.innerWidth * 0.5) : Math.min(window.innerHeight * 0.35, window.innerWidth * 0.8);
    const boxH = isMobile ? window.innerHeight * 0.38 : window.innerHeight * 0.5;
    const viewportCenterY = window.innerHeight / 2;
    const heroLocalCenterY = viewportCenterY - heroRect.top;
    const insetTop = heroLocalCenterY - (boxH / 2);
    const insetBottom = heroH - (insetTop + boxH);
    const insetLR = (heroW - boxW) / 2;

    tl.to('.preloader-border-box', { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0);
    tl.fromTo('.main-hero',
      { clipPath: `inset(${insetTop}px ${insetLR}px ${insetBottom}px ${insetLR}px round ${isMobile ? 22 : 24}px)` },
      {
        clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 2.2, ease: 'expo.inOut',
        onStart: () => { const v = document.querySelector('.hero-bg-video') as HTMLVideoElement; if (v?.tagName?.toLowerCase() === 'video') { v.currentTime = 0; v.play().catch(() => { }); } }
      }, 0);

    tl.fromTo('.letter-wrapper', { opacity: 0, y: 40, filter: 'blur(10px)', scale: 0.95 }, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1.0, stagger: 0.05, ease: 'power3.out' }, 0.8);

    tl.to('.splash-bg', {
      yPercent: -100, ease: 'expo.inOut', duration: 1.5,
      onComplete: () => {
        document.body.style.overflowY = 'auto';
        lenis.start();
        setupLogoMorph();
        const skipOnScroll = () => { if (tl.progress() < 1) tl.progress(1); lenis.off('scroll', skipOnScroll); };
        lenis.on('scroll', skipOnScroll);
      }
    }, 2.3);

    tl.to('.text-white-reveal', { clipPath: 'inset(0% 0 0 0)', ease: 'expo.inOut', duration: 1.25 }, 2.3);
    tl.to('.hero-bg-video', { scale: 1, ease: 'power3.out', duration: 2 }, 2.3);
    tl.to('.hero-ctas .cta-link, .mobile-hero-ctas .cta-link', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'expo.out' }, 1);
    tl.fromTo('.hero-title .word-inner', { yPercent: 100, rotate: 5, filter: 'blur(10px)', opacity: 0 }, { yPercent: 0, rotate: 0, filter: 'blur(0px)', opacity: 1, duration: 1.0, stagger: 0.08, ease: 'expo.out' }, 1.8);
    tl.fromTo('.hero-subtitle .word-inner', { yPercent: 50, opacity: 0, filter: 'blur(5px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.03, ease: 'power3.out' }, 2.0);
    tl.to('.hero-scroll', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', onComplete: () => { const thumb = document.querySelector('.scroll-line-thumb') as HTMLElement; if (thumb) thumb.style.animationPlayState = 'running'; } }, 2.2);
    tl.set('.splash-intro', { pointerEvents: 'none' });
    tl.pause();

    // Logo morph
    function setupLogoMorph() {
      [morphTlInstance, morphSTInstance, navSTInstance, mobileHeroFadeST, headerColorST, headerPillST].forEach(inst => { if (inst && 'kill' in inst) (inst as { kill: () => void }).kill(); });

      if (window.innerWidth <= 1024) {
        mobileHeroFadeST = ScrollTrigger.create({ trigger: '.main-hero', start: 'top top', end: '25% top', scrub: true, animation: gsap.to('.hero-description-area', { opacity: 0, ease: 'none' }) });
        const header = document.querySelector('.header') as HTMLElement;
        if (header) {
          ScrollTrigger.create({ trigger: '.main-hero', start: () => `bottom ${header.offsetHeight}px`, end: 'bottom top', scrub: true, animation: gsap.to(header, { '--header-wipe': 1, ease: 'none' } as gsap.TweenVars) });
          headerColorST = ScrollTrigger.create({ trigger: '.main-hero', start: () => `bottom ${header.offsetHeight}px`, onEnter: () => document.body.classList.add('header-dark-mode'), onLeaveBack: () => document.body.classList.remove('header-dark-mode') });
        }
        return;
      }

      const splashIntro = document.querySelector('.splash-intro') as HTMLElement;
      const headerContent = document.querySelector('.header-content') as HTMLElement;
      const headerNav = document.querySelector('.header-nav') as HTMLElement;
      const logoArea = document.querySelector('.logo-content-area') as HTMLElement;
      if (!logoArea) return;

      const wordContainer = logoArea.querySelector('.word-container') as HTMLElement;
      const heroCtas = splashIntro.querySelector('.hero-ctas') as HTMLElement;
      const heroDesc = splashIntro.querySelector('.hero-description-area') as HTMLElement;
      const logoAreaRect = logoArea.getBoundingClientRect();
      const wordRect = wordContainer.getBoundingClientRect();
      const headerRectLocal = headerContent.getBoundingClientRect();

      const logoAnchor = document.createElement('div');
      logoAnchor.id = 'hero-logo-anchor';
      logoAnchor.style.cssText = `width:${logoAreaRect.width}px;height:${logoAreaRect.height}px;visibility:hidden;`;
      logoArea.parentNode!.insertBefore(logoAnchor, logoArea);
      document.body.appendChild(logoArea);
      logoArea.id = 'morph-breakout-logo';

      const topAtZero = logoAreaRect.top + window.scrollY;
      const leftAtZero = logoAreaRect.left + window.scrollX;
      Object.assign(logoArea.style, { position: 'fixed', left: leftAtZero + 'px', top: topAtZero + 'px', width: logoAreaRect.width + 'px', margin: '0', padding: '0', zIndex: '200001', pointerEvents: 'none', willChange: 'transform' });
      logoArea.style.visibility = '';

      const headerLogoHeight = window.innerWidth <= 480 ? 14 : 20;
      const targetScale = headerLogoHeight / wordRect.height;
      const targetLeftPx = 48;

      gsap.set(heroEl, { overflow: 'hidden', clipPath: 'inset(0px 0px 0px 0px round 0px)' });
      gsap.set(splashIntro, { overflow: 'visible' });

      const initialWordCenterY = wordRect.top + wordRect.height / 2;
      const targetHeaderCenterY = headerRectLocal.top + headerRectLocal.height / 2;
      const scrollEnd = heroEl.offsetHeight;
      const exitY = -scrollEnd;
      const wordLocalY = (targetHeaderCenterY - initialWordCenterY) + scrollEnd;
      const toX = targetLeftPx - wordRect.left;

      gsap.set(logoArea, { y: 0 });
      gsap.set(heroCtas, { opacity: 1, y: 0 });
      gsap.set(heroDesc, { opacity: 1 });
      gsap.set(wordContainer, { x: 0, y: 0, scale: 1, transformOrigin: 'left center' });

      morphTlInstance = gsap.timeline({ paused: true });
      morphTlInstance.to(logoArea, { y: exitY, duration: 1, ease: 'none' }, 0)
        .to(heroCtas, { opacity: 0, y: '250%', duration: 0.25, ease: 'none' }, 0)
        .to(heroDesc, { opacity: 0, duration: 0.5, ease: 'none' }, 0)
        .to(wordContainer, { x: toX, y: wordLocalY, scale: targetScale, duration: 1, ease: 'none', force3D: true }, 0);

      ScrollTrigger.refresh();

      if (window.innerWidth > 1024) {
        const navLinks = headerNav.querySelectorAll('.nav-link');
        navSTInstance = ScrollTrigger.create({
          trigger: '.main-hero', start: '30% top',
          onEnter: () => { gsap.to(headerNav, { opacity: 1, pointerEvents: 'auto', duration: 0.3 }); gsap.fromTo(navLinks, { opacity: 0, y: -15, filter: 'blur(5px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.08, ease: 'power2.out', overwrite: true }); },
          onLeaveBack: () => { gsap.to(headerNav, { opacity: 0, pointerEvents: 'none', duration: 0.3 }); gsap.to(navLinks, { opacity: 0, y: -15, filter: 'blur(5px)', duration: 0.3 }); }
        });
      }

      morphSTInstance = ScrollTrigger.create({ trigger: '.main-hero', start: 'top top', end: '50% top', scrub: true, animation: morphTlInstance, invalidateOnRefresh: true });

      const header = document.querySelector('.header') as HTMLElement;
      gsap.to(header, { '--header-wipe': 1, ease: 'none', scrollTrigger: { trigger: '.main-hero', start: () => `bottom ${header.offsetHeight}px`, end: 'bottom top', scrub: true, invalidateOnRefresh: true } } as gsap.TweenVars);
      headerColorST = ScrollTrigger.create({ trigger: '.main-hero', start: () => `bottom ${header.offsetHeight}px`, end: 'max', onEnter: () => document.body.classList.add('header-dark-mode'), onLeaveBack: () => document.body.classList.remove('header-dark-mode') });
      headerPillST = ScrollTrigger.create({ trigger: '.main-hero', start: 'bottom top', end: 'max', onEnter: () => document.body.classList.add('header-pill-mode'), onLeaveBack: () => document.body.classList.remove('header-pill-mode') });
    }

    // Preloader
    let revealStarted = false;
    function startReveal() { if (revealStarted) return; revealStarted = true; tl.play(); }

    const preloaderRectEl = document.querySelector('#preloader-rect') as SVGRectElement;
    const preloaderBox = document.querySelector('.preloader-border-box') as HTMLElement;
    const preloaderShine = document.getElementById('preloader-shine');

    if (preloaderRectEl && preloaderBox) {
      const finishPreloader = () => {
        const currentOffset = window.getComputedStyle(preloaderRectEl).strokeDashoffset;
        preloaderRectEl.style.animation = 'none';
        gsap.set(preloaderRectEl, { strokeDashoffset: currentOffset });
        if (preloaderShine) gsap.to(preloaderShine, { opacity: 0, duration: 0.4, ease: 'power2.out' });
        gsap.to(preloaderRectEl, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', onComplete: () => { gsap.to(preloaderBox, { opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => startReveal() }); } });
      };
      if (document.readyState === 'complete') finishPreloader();
      else window.addEventListener('load', finishPreloader);
    }

    // Hamburger
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    if (hamburgerBtn && mobileNavOverlay) {
      hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        mobileNavOverlay.classList.contains('active') ? lenis.stop() : lenis.start();
      });
      mobileNavOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => { hamburgerBtn.classList.remove('active'); mobileNavOverlay.classList.remove('active'); document.body.classList.remove('menu-open'); lenis.start(); });
      });
    }

    // Cursor
    const cursorFollower = document.querySelector('.cursor-follower') as HTMLElement;
    if (cursorFollower && window.innerWidth > 1024) {
      gsap.set(cursorFollower, { xPercent: -50, yPercent: -50 });
      window.addEventListener('mousemove', (e) => { gsap.to(cursorFollower, { x: e.clientX + 40, y: e.clientY + 40, duration: 3.0, ease: 'expo.out', overwrite: 'auto' }); });
    }

    // Collection entrance
    const collectionSection = document.querySelector('.collection-section');
    if (collectionSection) {
      const colTL = gsap.timeline({ scrollTrigger: { trigger: collectionSection, start: 'top 50%' } });
      colTL.from('.collection-label, .collection-headline, .collection-desc, .collection-info .service-cta', { y: 40, opacity: 0, filter: 'blur(10px)', duration: 1.5, stagger: 0.15, ease: 'power3.out' })
        .from('.property-card', { x: 100, opacity: 0, duration: 1.5, stagger: 0.15, ease: 'power3.out' }, '-=1.0');
    }

    return () => { ScrollTrigger.getAll().forEach(st => st.kill()); lenis.destroy(); };
  }, []);

  return null;
}
