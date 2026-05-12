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
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [searchableMeta, setSearchableMeta] = useState<any[]>([]);

  const language = pathname.startsWith('/es') ? 'es' : 'en';

  const router = useRouter();
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  // Fetch dynamic GeoNames municipalities on mount
  useEffect(() => {
    getMunicipalities().then((data) => {
      setAllMunicipalities(data || []);
    });
  }, []);

  // Fetch dynamic trending searches from Sanity component data
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const query = `*[_type == "page" && (language == $language || (!defined(language) && $language == "en")) && count(sections[_type == "buyHeroSection"]) > 0][0].sections[_type == "buyHeroSection"][0].trendingSearches`;
        const data = await client.fetch(query, { language });
        if (data && Array.isArray(data)) {
          setTrendingSearches(data);
        }
      } catch (err) {
        console.error('Failed to fetch trending searches:', err);
      }
    };
    
    fetchTrendingSearches();
  }, [language]);

  // Fetch metadata keys marked for search modal inclusion
  useEffect(() => {
    const fetchSearchableMeta = async () => {
      try {
        const metaQuery = `*[_type == "propertyMeta" && showOnSearchModal == true] {
          _id,
          "label": coalesce(longLabel[$language], longLabel.en),
          "options": selectOptions[] {
            "value": en,
            "label": coalesce(@[$language], en),
            "icon": icon.asset->url
          }
        }`;
        const categoryQuery = `*[_type == "propertyCategory"] {
          _id,
          "label": coalesce(title[$language], title.en),
          "icon": icon.asset->url
        }`;

        const [metas, cats] = await Promise.all([
          client.fetch(metaQuery, { language: locale }, { stega: false }),
          client.fetch(categoryQuery, { language: locale }, { stega: false })
        ]);

        // Wrap the categories as a simulated meta block for simple consumption
        const combined = [...(metas || [])];
        if (cats && cats.length > 0) {
          combined.unshift({
            _id: 'SPECIAL_CATEGORY_BLOCK',
            label: locale === 'es' ? 'Tipo de propiedad' : 'Property Type',
            options: cats.map((c: any) => ({
              value: c._id, // Use ID directly for categories
              label: c.label,
              icon: c.icon
            }))
          });
        }
        
        setSearchableMeta(combined);
      } catch (e) {
        console.error('Failed to fetch searchable meta:', e);
      }
    };
    fetchSearchableMeta();
  }, [locale]);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);



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
        // Compute normalized search string matching client-side memory list
        const searchNorm = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        
        // Split into two buckets
        const matchedMetaValues = searchableMeta
          .filter(m => m._id !== 'SPECIAL_CATEGORY_BLOCK')
          .flatMap(meta => 
            (meta.options || [])
              .filter((opt: any) => (opt.label || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchNorm))
              .map((opt: any) => opt.value)
          );

        const matchedCategoryIds = searchableMeta
          .filter(m => m._id === 'SPECIAL_CATEGORY_BLOCK')
          .flatMap(meta => 
            (meta.options || [])
              .filter((opt: any) => (opt.label || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchNorm))
              .map((opt: any) => opt.value) // Stores the real category _id
          );

        const query = `*[_type == "property" && !(_id in path('drafts.**')) && (language == $language || (!defined(language) && $language == "en")) && (
          title match $search || 
          title[$language] match $search ||
          location.streetAddress match $search || 
          location.complexName match $search || 
          location.municipality match $search ||
          category->title match $search ||
          category->title[$language] match $search ||
          category._ref in $matchedCategoryIds ||
          count(meta[
            selectValue in $matchedMetaValues || 
            count(selectArrayValue[@ in $matchedMetaValues]) > 0
          ]) > 0
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
          language: locale,
          matchedMetaValues: matchedMetaValues,
          matchedCategoryIds: matchedCategoryIds
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
  }, [searchQuery, locale, searchableMeta]);

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
      
      // Use normalized title as the unique key to eliminate identical-looking properties
      const key = (item.title || '').trim().toLowerCase();
      if (key && !uniqueProps.has(key)) {
        uniqueProps.set(key, {
          ...item,
          address: dynamicAddress
        });
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

  const metaGroups = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const normalizedSearch = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ' ')
      .trim();

    return searchableMeta.map((meta) => {
      const matchingOptions = (meta.options || []).filter((opt: any) => {
        const normLabel = (opt.label || '')
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, ' ')
          .trim();
        return normLabel.includes(normalizedSearch);
      });

      if (matchingOptions.length === 0) return null;

      return {
        id: meta._id,
        label: meta.label,
        options: matchingOptions
      };
    }).filter(Boolean) as any[];
  }, [searchableMeta, searchQuery]);

  const handlePropertyClick = (slug: string) => {
    const targetPrefix = locale === 'es' ? 'propiedades' : 'properties';
    router.push(`/${locale}/${targetPrefix}/${slug}`);
    onClose();
  };

  const handleMunicipalityClick = (mun: string) => {
    // Navigate to properties list with municipality search filter
    const targetPath = locale === 'es' ? 'propiedades' : 'properties';
    router.push(`/${locale}/${targetPath}?search=${encodeURIComponent(mun)}`);
    onClose();
  };

  const handleMetaOptionClick = (metaId: string, value: string, label?: string) => {
    const targetPath = locale === 'es' ? 'propiedades' : 'properties';
    
    const cleanedValue = typeof value === 'string' ? value.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : value;
    const cleanedLabel = typeof label === 'string' ? label.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : label;
    
    if (metaId === 'SPECIAL_CATEGORY_BLOCK') {
      router.push(`/${locale}/${targetPath}?search=${encodeURIComponent(cleanedLabel || cleanedValue)}`);
    } else {
      const metaObj = JSON.stringify({ [metaId]: [cleanedValue] });
      router.push(`/${locale}/${targetPath}?meta=${encodeURIComponent(metaObj)}`);
    }
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
              ) : propertiesGroup.length === 0 && municipalitiesGroup.length === 0 && metaGroups.length === 0 ? (
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
                            <img 
                              src="/icons/location_pin.svg" 
                              alt="" 
                              width="16" 
                              height="16" 
                              className="result-item-icon" 
                              style={{ opacity: 0.7 }} 
                            />
                            <span className="result-title">{mun}</span>
                            <span className="result-meta-tag">{dict?.search?.view_all}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* Group 1.5: Dynamic Meta Options (Matching Municipalities Style) */}
                  {metaGroups.map((group: any) => (
                    <div className="result-group" key={group.id}>
                      <p className="group-label">{group.label}</p>
                      <div className="result-items">
                        {group.options.map((opt: any) => (
                          <div 
                            key={`${group.id}-${opt.value}`} 
                            className="result-item clickable"
                            onClick={() => handleMetaOptionClick(group.id, opt.value, opt.label)}
                          >
                            <img 
                              src={opt.icon || "/icons/search.svg"} 
                              alt="Icon" 
                              width="16" 
                              height="16" 
                              className="result-item-icon" 
                              style={{ opacity: 0.7, filter: opt.icon ? 'none' : 'grayscale(1)' }} 
                            />
                            <span className="result-title">{opt.label}</span>
                            <span className="result-meta-tag">{dict?.search?.view_all}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

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
