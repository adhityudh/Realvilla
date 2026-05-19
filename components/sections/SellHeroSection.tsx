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

interface SellHeroSectionProps {
  data: {
    id?: string;
    title?: string;
    backgroundImage?: string;
    searchPlaceholder?: string;
    jumpLinks?: Array<{ label: string; link: string }>;
  };
  dict?: any;
}

export default function SellHeroSection({ data, dict }: SellHeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ place_id: string | number; display_name: string }>>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
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

  // Photon Address Autocomplete Search logic
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

    const trimmed = val.toLowerCase();
    const commonPrefixes = ['calle', 'avenida', 'c/', 'av.', 'av', 'street', 'road', 'calle de', 'plaza', 'paseo', 'camino', 'glorieta', 'bulevar'];
    const isPrefix = commonPrefixes.includes(trimmed);

    if (isPrefix) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const allowedTypes = ['house', 'street', 'poi'];

        const fetchFeatures = async (queryStr: string) => {
          const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryStr)}&limit=30&lat=28.2916&lon=-16.6291&bbox=-16.95,27.98,-16.10,28.59`;
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
          });
          if (res.ok) {
            const data = await res.json();
            return data.features || [];
          }
          return [];
        };

        let features = await fetchFeatures(val);
        let filteredFeatures = features.filter((f: any) => allowedTypes.includes(f.properties?.type));

        const hasStreetKeyword = commonPrefixes.some(word => val.toLowerCase().includes(word));
        if (filteredFeatures.length < 5 && !hasStreetKeyword) {
          const fallbackFeatures = await fetchFeatures('calle ' + val);
          const filteredFallback = fallbackFeatures.filter((f: any) => allowedTypes.includes(f.properties?.type));

          const seenIds = new Set(filteredFeatures.map((f: any) => f.properties?.osm_id).filter(Boolean));
          filteredFallback.forEach((f: any) => {
            const osmId = f.properties?.osm_id;
            if (!osmId || !seenIds.has(osmId)) {
              filteredFeatures.push(f);
              if (osmId) seenIds.add(osmId);
            }
          });
        }

        const mapped = filteredFeatures.map((f: any, idx: number) => {
          const p = f.properties || {};
          const parts: string[] = [];

          let streetAddress = '';
          if (p.name) {
            streetAddress = p.name;
            if (p.street && p.street !== p.name) {
              streetAddress += ` (${p.street})`;
            }
          } else if (p.street) {
            streetAddress = p.street;
          }

          if (p.housenumber && streetAddress) {
            streetAddress += `, ${p.housenumber}`;
          }

          if (streetAddress) parts.push(streetAddress);
          if (p.district) parts.push(p.district);
          else if (p.locality) parts.push(p.locality);
          if (p.city) parts.push(p.city);
          if (p.postcode) parts.push(p.postcode);

          return {
            place_id: p.osm_id || idx,
            display_name: parts.join(', ')
          };
        });

        setSuggestions(mapped.slice(0, 10));
        setIsDropdownOpen(true);
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

  const handleSelectAddress = (display_name: string) => {
    setSearchQuery(display_name);
    setSelectedAddress(display_name);
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
      window.dispatchEvent(new CustomEvent('set-sell-address', { detail: selectedAddress }));
    }

    openModal('sell-modal');
  };

  // Use user-provided settings or default writing
  const finalTitle = data?.title || dict?.contact?.sell?.hero_title;
  const fullPlaceholder = data?.searchPlaceholder || dict?.contact?.sell?.fields?.municipality_placeholder;

  // Use Sell page background image as default fallback if none provided
  const bgImage = data?.backgroundImage;

  const jumpLinks = data?.jumpLinks;

  const handleJumpLinkClick = (e: React.MouseEvent<any>, url: string) => {
    smoothScrollToAnchor(e, url);
  };

  useEffect(() => {
    if (!contentRef.current || !sectionRef.current) return;

    const tl = gsap.timeline();

    // Set initial states for elements to avoid flash
    gsap.set('.sell-search-trigger', {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      borderColor: 'rgba(255, 255, 255, 0)',
      y: 20,
      opacity: 0
    });
    gsap.set('.sell-search-trigger > *', { opacity: 0 });

    // 1. Animate title first
    tl.fromTo(
      '.sell-hero-title',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out'
      }
    );

    // 2. Animate search trigger container (y and opacity) - Start at 0.4s
    tl.to(
      '.sell-search-trigger',
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'expo.out',
      },
      0.4
    );

    // 3. Animate the 'Glass' appearance (bg/border) - Start at 0.6s
    tl.to(
      '.sell-search-trigger',
      {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        duration: 1.5,
        ease: 'power2.out'
      },
      0.6
    );

    // 4. Animate trigger content (icon and text) - Start at 0.8s
    tl.to(
      '.sell-search-trigger > *',
      {
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      },
      0.8
    );

    // 5. Animate jump links - Start at 1.0s
    tl.fromTo(
      '.sell-jump-links',
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'expo.out'
      },
      1.0
    );

    // Typing animation for placeholder
    const startTyping = () => {
      let i = 0;
      const timer = setInterval(() => {
        setPlaceholderText(fullPlaceholder.slice(0, i));
        i++;
        if (i > fullPlaceholder.length) clearInterval(timer);
      }, 30);
      return timer;
    };

    const typingTimeout = setTimeout(startTyping, 600); // Start sooner

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

    return () => {
      st.kill();
      clearTimeout(typingTimeout);
      document.body.classList.remove('header-light-mode');
      document.body.classList.remove('header-black-bg');
    };
  }, [fullPlaceholder]);

  return (
    <section className="sell-hero" ref={sectionRef} data-is-hero="true" id={data?.id || 'sell-hero'}>
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
                if (suggestions.length > 0) {
                  setIsDropdownOpen(true);
                }
              }}
              onScroll={checkScrollLimit}
              onKeyUp={checkScrollLimit}
              placeholder={placeholderText}
              className={`sell-search-input-real ${
                selectedAddress
                  ? `${!isScrollAtStart ? 'has-fade-left' : ''} ${!isScrollAtEnd ? 'has-fade-right' : ''}`.trim()
                  : ''
              }`}
              style={{ paddingRight: '100px' }}
            />
            {isLoading && (
              <div className="sell-search-spinner" style={{ marginRight: '120px' }} />
            )}
            <Button
              label={dict?.contact?.sell?.continue || 'Continue'}
              variant="pill"
              showArrow={false}
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
                  onClick={() => handleSelectAddress(item.display_name)}
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
              className="jump-link"
              priority={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}
