'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import { smoothScrollToAnchor } from '@/lib/scroll';
import { useModalRegistry } from '@/components/providers/ModalRegistryContext';
import { usePathname } from 'next/navigation';
import './SellHeroSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import { ContactModalComponentInstance } from './PageComponentsRenderer';

interface SellHeroSectionProps {
  data: {
    disableEntranceAnimation?: boolean;
    disableHeaderEntranceAnimation?: boolean;
    id?: string;
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    searchPlaceholder?: string;
    modalTitle?: string;
    modalSubtitle?: string;
    hideWhatsApp?: boolean;
    jumpLinks?: Array<{ label: string; link: string }>;
  };
  dict?: any;
  contextData?: any;
}

export default function SellHeroSection({ data, dict, contextData }: SellHeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ place_id: string | number; display_name: string }>>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [isScrollAtEnd, setIsScrollAtEnd] = useState(false);
  const [isScrollAtStart, setIsScrollAtStart] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const checkScrollLimit = () => {
    const el = inputRef.current;
    if (!el) return;
    setIsScrollAtStart(el.scrollLeft <= 5);
    setIsScrollAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  useEffect(() => {
    const timer = setTimeout(checkScrollLimit, 100);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScrollLimit);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkScrollLimit);
      }
    };
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [placeholderText, setPlaceholderText] = useState('');

  const { openModal } = useModalRegistry();
  const pathname = usePathname();

  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  const isEs = useMemo(() => locale === 'es', [locale]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleSuccess = () => {
      setSearchQuery('');
      setSelectedAddress('');
    };

    window.addEventListener('sell-form-submitted', handleSuccess);
    return () => {
      window.removeEventListener('sell-form-submitted', handleSuccess);
    };
  }, []);

  // Google Places Address Autocomplete Search logic
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const val = searchQuery.trim();
    if (searchQuery === selectedAddress) {
      setIsDropdownOpen(false);
      return;
    }
    if (!val || val.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/autocomplete/?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.predictions || []);
          setIsDropdownOpen((data.predictions || []).length > 0);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, selectedAddress]);

  const handleSelectAddress = (display_name: string, place_id?: string) => {
    setSearchQuery(display_name);
    setSelectedAddress(display_name);
    if (place_id) {
      setSelectedPlaceId(String(place_id));
    } else {
      setSelectedPlaceId('');
    }
    setIsDropdownOpen(false);
  };

  const handleContinue = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!selectedAddress) return;

    if (typeof window !== 'undefined') {
      const win = window as any;
      win.__sellPresetAddress = selectedAddress;
      if (selectedPlaceId) {
        win.__sellPresetPlaceId = selectedPlaceId;
      }
      window.dispatchEvent(
        new CustomEvent('set-sell-address', {
          detail: selectedPlaceId ? { address: selectedAddress, placeId: selectedPlaceId } : selectedAddress
        })
      );
    }

    openModal('sell-modal');
  };

  // Use user-provided settings or default writing
  const finalTitle = data?.title || dict?.contact?.sell?.hero_title;
  const finalSubtitle = data?.subtitle || dict?.contact?.sell?.hero_subtitle;
  const fullPlaceholder = data?.searchPlaceholder || dict?.contact?.sell?.fields?.municipality_placeholder;

  // Use Sell page background image as default fallback if none provided
  const bgImage = data?.backgroundImage;

  const jumpLinks = data?.jumpLinks;

  const handleJumpLinkClick = (e: React.MouseEvent<any>, url: string) => {
    smoothScrollToAnchor(e, url);
  };

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
            // We are at the top or overscrolling at the top (progress === 0)
            document.body.classList.remove('header-dark-mode');
            document.body.classList.add('header-light-mode');
            document.body.classList.add('header-black-bg');
          }
        }
      },
      // Ensure it checks state immediately on creation
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

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) {
      setPlaceholderText(fullPlaceholder);
      return () => {
        st.kill();
        document.body.classList.remove('header-light-mode');
        document.body.classList.remove('header-black-bg');
      };
    }

    const tl = gsap.timeline();

    if (!data?.disableEntranceAnimation) {
      // Set initial states for elements to avoid flash
      gsap.set('.sell-search-trigger', {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderColor: 'rgba(255, 255, 255, 0)',
        y: 20,
        opacity: 0,
        filter: 'blur(5px)'
      });
      gsap.set('.sell-search-trigger > *', { opacity: 0 });
    }

    // 1. Animate title first
    if (!data?.disableHeaderEntranceAnimation) {
      tl.fromTo(
        '.sell-hero-title',
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          clearProps: 'transform,filter',
          duration: 1.2,
          ease: 'expo.out'
        }
      );

      // 1.5. Animate subtitle (Start at 0.3s)
      tl.fromTo(
        '.sell-hero-subtitle',
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          clearProps: 'transform,filter',
          duration: 1.2,
          ease: 'expo.out',
        },
        0.3
      );
    }

    if (!data?.disableEntranceAnimation) {
      const positionOffset = !data?.disableHeaderEntranceAnimation ? 0.5 : 0;
      // 2. Animate search trigger container (y, opacity, blur)
      tl.to(
        '.sell-search-trigger',
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          clearProps: 'transform,filter',
          duration: 1.0,
          ease: 'expo.out',
        },
        positionOffset
      );

      // 3. Animate the 'Glass' appearance (bg/border)
      tl.to(
        '.sell-search-trigger',
        {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          duration: 1.5,
          ease: 'power2.out'
        },
        positionOffset + 0.2
      );

      // 4. Animate trigger content (icon and text)
      tl.to(
        '.sell-search-trigger > *',
        {
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out'
        },
        positionOffset + 0.4
      );

      // 5. Animate jump links
      tl.fromTo(
        '.sell-jump-links',
        { y: 20, opacity: 0, filter: 'blur(5px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          clearProps: 'transform,filter',
          duration: 1.0,
          ease: 'expo.out'
        },
        positionOffset + 0.6
      );
    }

    // Typing animation for placeholder
    let typingTimer: any;
    let typingTimeout: any;
    if (!data?.disableEntranceAnimation) {
      const startTyping = () => {
        let i = 0;
        const timer = setInterval(() => {
          setPlaceholderText(fullPlaceholder.slice(0, i));
          i++;
          if (i > fullPlaceholder.length) clearInterval(timer);
        }, 30);
        return timer;
      };
      typingTimeout = setTimeout(() => {
        typingTimer = startTyping();
      }, 600); // Start sooner
    } else {
      setPlaceholderText(fullPlaceholder);
    }

    return () => {
      st.kill();
      tl.kill();
      if (typingTimeout) clearTimeout(typingTimeout);
      if (typingTimer) clearInterval(typingTimer);
      document.body.classList.remove('header-light-mode');
      document.body.classList.remove('header-black-bg');
    };
  }, [fullPlaceholder, data]);

  return (
    <section className={`sell-hero ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} ref={sectionRef} data-is-hero="true" id={data?.id || 'sell-hero'}>
      <div className="sell-hero-bg">
        {bgImage && (
          <Image
            src={bgImage}
            alt="Sell Background"
            fill
            priority
            className="sell-hero-img"
          />
        )}
        <div className="sell-hero-overlay" />
      </div>

      <div className="sell-hero-content" ref={contentRef}>
        <h1 className="sell-hero-title">{finalTitle}</h1>
        {finalSubtitle && <p className="sell-hero-subtitle">{finalSubtitle}</p>}

        <div className="sell-search-trigger-container" style={{ maxWidth: '624px' }} ref={dropdownRef}>
          <div
            className="sell-search-trigger"
            style={{ width: '100%' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedAddress('');
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (selectedAddress) return;
                if (suggestions.length > 0) {
                  setIsDropdownOpen(true);
                }
              }}
              onScroll={checkScrollLimit}
              onKeyUp={checkScrollLimit}
              placeholder={placeholderText}
              className={`sell-search-input-real ${selectedAddress
                ? `${!isScrollAtStart ? 'has-fade-left' : ''} ${!isScrollAtEnd ? 'has-fade-right' : ''}`.trim()
                : ''
                }`}
              style={{ paddingRight: '112px' }}
            />
            {isLoading && (
              <div className="sell-search-spinner" />
            )}
            <Button
              label={dict?.contact?.sell?.continue || 'Continue'}
              variant="pill"
              showArrow={true}
              onClick={handleContinue}
              className="sell-continue-btn"
              disabled={!selectedAddress}
            />
          </div>

          {isDropdownOpen && suggestions.length > 0 && (
            <div className="sell-suggestions-dropdown" data-lenis-prevent="true">
              {suggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  className="sell-suggestion-item"
                  onClick={() => handleSelectAddress(item.display_name, String(item.place_id))}
                >
                  {item.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {jumpLinks && jumpLinks.length > 0 && (
        <div className="sell-jump-links">
          {jumpLinks.map((link, idx) => (
            <Button
              key={idx}
              label={link.label}
              href={link.link || '#'}
              onClick={(e) => handleJumpLinkClick(e, link.link)}
              variant="link"
              size="md"
              className="jump-link"
              priority={true}
            />
          ))}
        </div>
      )}

      <ContactModalComponentInstance
        componentId="sell-modal"
        formType="sell"
        title={data?.modalTitle}
        subtitle={data?.modalSubtitle}
        hideWhatsApp={data?.hideWhatsApp}
        dict={dict}
        whatsappNumber={contextData?.whatsappNumber}
      />
    </section>
  );
}
