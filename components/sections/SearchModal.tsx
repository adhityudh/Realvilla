'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { client } from '@/sanity/lib/client';
import { getMunicipalities } from '@/lib/municipalities';
import { useLenis } from '@/lib/LenisContext';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict?: any;
}

interface SearchResultItem {
  _id: string;
  title: string;
  address?: string;
  streetAddress?: string;
  complexName?: string;
  municipality?: string;
  postalCode?: string;
  slug?: string;
  imageUrl?: string;
  price?: number;
}

export default function SearchModal({ isOpen, onClose, dict }: SearchModalProps) {
  const lenis = useLenis();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [allMunicipalities, setAllMunicipalities] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>(['Villa', 'Adeje', 'Costa Adeje', 'Arona', 'Santa Cruz']);

  const language = pathname.startsWith('/es') ? 'es' : 'en';

  // Fetch dynamic GeoNames municipalities on mount
  useEffect(() => {
    getMunicipalities().then((data) => {
      setAllMunicipalities(data || []);
    });
  }, []);

  // Fetch dynamic trending searches from Sanity
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const query = `*[_type == "settings" && (language == $language || (!defined(language) && $language == "en"))][0].trendingSearches`;
        const data = await client.fetch(query, { language });
        if (data && Array.isArray(data) && data.length > 0) {
          setTrendingSearches(data);
        }
      } catch (err) {
        console.error('Failed to fetch trending searches:', err);
      }
    };
    
    fetchTrendingSearches();
  }, [language]);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  const isSearching = searchQuery.trim().length > 0;

  // Real-time debounced search from Sanity with race condition protection
  useEffect(() => {
    let active = true;

    if (searchQuery.trim().length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const query = `*[_type == "property" && !(_id in path('drafts.**')) && (language == $language || (!defined(language) && $language == "en")) && (
          title match $search || 
          title[$language] match $search ||
          location.streetAddress match $search || 
          location.complexName match $search || 
          location.municipality match $search
        )] {
          _id,
          "title": coalesce(title[$language], title.en, title),
          "streetAddress": location.streetAddress,
          "complexName": location.complexName,
          "municipality": location.municipality,
          "postalCode": location.postalCode,
          "slug": slug.current,
          "imageUrl": image.asset->url,
          price
        }`;

        const data = await client.fetch(query, { 
          search: `*${searchQuery}*`,
          language: locale
        });
        
        if (active) {
          setResults(data || []);
        }
      } catch (err) {
        console.error('Error searching properties:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, locale]);

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
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' },
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
          setResults([]);
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

  // Dynamically compute grouping results with zero duplicates guaranteed
  const propertiesGroup = useMemo(() => {
    const uniqueProps = new Map<string, SearchResultItem>();
    results.forEach((item) => {
      const dynamicAddress = [item.streetAddress, item.complexName, item.municipality, item.postalCode]
        .filter(Boolean)
        .join(', ');
      
      const matchText = (item.title || '') + ' ' + dynamicAddress;
      
      // Normalize any non-breaking spaces (\u00a0) or duplicate whitespaces to single normal spaces
      const cleanSearch = searchQuery.replace(/\s+/g, ' ').trim().toLowerCase();
      const cleanMatch = matchText.replace(/\s+/g, ' ').trim().toLowerCase();
      const isMatch = cleanMatch.includes(cleanSearch);
      
      if (isMatch) {
        // Use normalized title as the unique key to completely eliminate identical-looking properties
        const key = (item.title || '').trim().toLowerCase();
        if (key && !uniqueProps.has(key)) {
          uniqueProps.set(key, {
            ...item,
            address: dynamicAddress
          });
        }
      }
    });
    return Array.from(uniqueProps.values());
  }, [results, searchQuery]);

  const municipalitiesGroup = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const normalizedSearch = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ' ')
      .trim();

    const finalMuns = allMunicipalities.filter((mun) => {
      const normalizedMun = mun
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ')
        .trim();
      return normalizedMun.includes(normalizedSearch);
    });
    return finalMuns;
  }, [allMunicipalities, searchQuery]);

  const handlePropertyClick = (slug: string) => {
    router.push(`/${locale}/${slug}`);
    onClose();
  };

  const handleMunicipalityClick = (mun: string) => {
    // Navigate to buy list with municipality search filter
    router.push(`/${locale}/buy?municipality=${encodeURIComponent(mun)}`);
    onClose();
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
                placeholder={dict?.search?.placeholder}
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
            {!isSearching ? (
            /* Mode 1: Initial Suggestions */
            <div className="search-suggestions-container">
              <p className="section-title">{dict?.search?.trending}</p>
              <div className="suggestions-list">
                {trendingSearches.map((item) => (
                  <button 
                    key={item} 
                    type="button"
                    className="suggestion-item" 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(item.replace(/[\u200b-\u200d\uFEFF]/g, '').replace(/"/g, '').trim());
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 50);
                    }}
                  >
                    <img src="/icons/show_chart.svg" alt="Chart" width="14" height="14" style={{marginRight: '8px', opacity: 0.5}} />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Mode 2: Search Results grouped by Properties and Areas */
            <div className="search-results-container">
              {isLoading ? (
                /* Loading State */
                <div className="search-loading-state">
                  <div className="loading-shimmer" style={{ width: '100%', height: '24px', borderRadius: '4px' }} />
                  <div className="loading-shimmer" style={{ width: '80%', height: '20px', marginTop: '1.2rem', borderRadius: '4px' }} />
                  <div className="loading-shimmer" style={{ width: '60%', height: '20px', marginTop: '1.2rem', borderRadius: '4px' }} />
                </div>
              ) : propertiesGroup.length === 0 && municipalitiesGroup.length === 0 ? (
                /* Empty State */
                <div className="search-empty-state">
                  <p className="empty-message">
                    {dict?.search?.no_results}
                  </p>
                </div>
              ) : (
                /* Loaded State */
                <div className="search-results-list">
                  {/* Group 1: Areas & Municipalities */}
                  {municipalitiesGroup.length > 0 && (
                    <div className="result-group">
                      <p className="group-label">{dict?.search?.areas_locations}</p>
                      <div className="result-items">
                        {municipalitiesGroup.map((mun) => (
                          <div 
                            key={mun} 
                            className="result-item clickable"
                            onClick={() => handleMunicipalityClick(mun)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="result-item-icon">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span className="result-title">{mun}</span>
                            <span className="result-meta-tag">{dict?.search?.view_all}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Group 2: Properties */}
                  {propertiesGroup.length > 0 && (
                    <div className="result-group">
                      <p className="group-label">{dict?.search?.matching_properties}</p>
                      <div className="result-items">
                        {propertiesGroup.map((prop) => (
                          <div 
                            key={prop._id} 
                            className="result-item clickable property-item"
                            onClick={() => prop.slug && handlePropertyClick(prop.slug)}
                          >
                            <div className="result-item-image-wrapper">
                              {prop.imageUrl ? (
                                <Image
                                  src={prop.imageUrl}
                                  alt={prop.title}
                                  fill
                                  sizes="80px"
                                  className="result-item-img"
                                />
                              ) : (
                                <div className="result-item-image-placeholder">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="result-text-block">
                              <span className="result-title">{prop.title}</span>
                              <span className="result-subtitle">{prop.address}</span>
                            </div>
                            {prop.price && (
                              <span className="result-price">
                                €{prop.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
