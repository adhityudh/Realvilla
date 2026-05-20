'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useLenis } from '@/lib/LenisContext';
import { useModalRegistry } from '@/components/providers/ModalRegistryContext';
import './SearchModal.css'; // Reuse the beautiful search modal CSS styles!

interface SellSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict?: any;
}

interface AddressSuggestion {
  place_id: string | number;
  display_name: string;
}

export default function SellSearchModal({ isOpen, onClose, dict }: SellSearchModalProps) {
  const lenis = useLenis();
  const pathname = usePathname();
  const { openModal } = useModalRegistry();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isTypingPrefix, setIsTypingPrefix] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSearching = searchQuery.trim().length > 0;
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  const placeholderText = dict?.contact?.sell?.fields?.municipality_placeholder || 'Enter your property address...';

  // Google Places Address Autocomplete Search logic
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const val = searchQuery.trim();
    if (!val || val.length < 3) {
      setSuggestions([]);
      setIsTypingPrefix(false);
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
  }, [searchQuery]);

  // GSAP Animations
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
      
      const tl = gsap.timeline();
      tl.set(modalRef.current, { display: 'flex' });
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0);
      tl.fromTo(
        contentRef.current,
        { y: 50, opacity: 0, scale: 0.95, filter: 'blur(10px)' },
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', clearProps: 'transform,filter', duration: 0.6, ease: 'expo.out' },
        0.1
      );

      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      document.body.style.overflow = '';
      lenis?.start();
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (modalRef.current) modalRef.current.style.display = 'none';
          setSearchQuery('');
          setSuggestions([]);
        }
      });
      tl.to(contentRef.current, { y: 30, opacity: 0, scale: 0.98, filter: 'blur(5px)', duration: 0.4, ease: 'power2.in' });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.1);
    }

    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [isOpen, lenis]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleSelectAddress = (display_name: string, place_id?: string | number) => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      win.__sellPresetAddress = display_name;
      if (place_id) {
        win.__sellPresetPlaceId = String(place_id);
      }
      window.dispatchEvent(
        new CustomEvent('set-sell-address', {
          detail: place_id ? { address: display_name, placeId: String(place_id) } : display_name
        })
      );
    }
    onClose();
    setTimeout(() => {
      openModal('sell-modal');
    }, 150);
  };

  return (
    <div className="search-modal-container" ref={modalRef} style={{ display: 'none' }}>
      <div className="search-modal-overlay global-overlay" ref={overlayRef} onClick={handleOverlayClick} style={{ backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }} />
      
      <div className="search-modal-content" ref={contentRef} data-lenis-prevent="true">
        {/* Header Row: Input + Close Button */}
        <div className="search-modal-header-row">
          <div className="search-input-wrapper">
            <span className="search-input-icon">
              <Image
                src="/icons/search.svg"
                alt="Search"
                width={22}
                height={22}
              />
            </span>
            <input 
              ref={inputRef}
              type="text" 
              className="search-input-real"
              placeholder={placeholderText}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
 
          <button className="search-modal-close-new" onClick={onClose} aria-label="Close">
            <img src="/icons/close.svg" alt="Close" width="22" height="22" />
          </button>
          <div className="search-scroll-gradient" />
        </div>
 
        <div className="search-modal-body" data-lenis-prevent="true">
          {!isSearching ? null : (
            /* Mode 2: Geocoder Results */
            <div className="search-results-container">
              {isLoading ? (
                /* Loading State */
                <div className="search-loading-state">
                  <div className="loading-shimmer" style={{ width: '100%', height: '24px', borderRadius: '4px' }} />
                  <div className="loading-shimmer" style={{ width: '80%', height: '20px', marginTop: '1.2rem', borderRadius: '4px' }} />
                  <div className="loading-shimmer" style={{ width: '60%', height: '20px', marginTop: '1.2rem', borderRadius: '4px' }} />
                </div>
              ) : suggestions.length === 0 ? (
                /* Empty State */
                <div className="search-empty-state">
                  <p className="empty-message">
                    {locale === 'es' ? 'No se encontraron ubicaciones' : 'No locations found'}
                  </p>
                </div>
              ) : (
                /* Loaded State */
                <div className="search-results-list">
                  <div className="result-group">
                    <div className="result-items">
                       {suggestions.map((sug) => (
                        <div 
                          key={sug.place_id} 
                          className="result-item clickable"
                          onClick={() => handleSelectAddress(sug.display_name, sug.place_id)}
                        >
                          <span className="result-title">{sug.display_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
