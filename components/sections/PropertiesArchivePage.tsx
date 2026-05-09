'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { client } from '@/sanity/lib/client';
import { PROPERTY_META_QUERY, PROPERTY_CARD_FIELDS } from '@/sanity/lib/queries';
import PropertyCard from '../ui/PropertyCard';
import Button from '../ui/Button';
import FilterSidebar from './FilterSidebar';
import { fetchMunicipalities } from '@/lib/geonames';
import './SearchModal.css';
import './BuyPropertiesSection.css';
import './PropertiesSection.css';

const TENERIFE_MUNICIPALITIES = [
  'Adeje', 'Arafo', 'Arico', 'Arona', 'Buenavista del Norte',
  'Candelaria', 'El Rosario', 'El Sauzal', 'El Tanque', 'Fasnia',
  'Garachico', 'Granadilla de Abona', 'Guía de Isora', 'Güímar',
  'Icod de los Vinos', 'La Guancha', 'La Matanza de Acentejo',
  'La Orotava', 'La Victoria de Acentejo', 'Los Realejos',
  'Los Silos', 'Puerto de la Cruz', 'San Cristóbal de La Laguna',
  'San Juan de la Rambla', 'San Miguel de Abona',
  'Santa Cruz de Tenerife', 'Santa Úrsula', 'Santiago del Teide',
  'Tacoronte', 'Tegueste', 'Vilaflor'
];
import './PropertiesArchivePage.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PropertiesArchivePage({ dict }: { dict?: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [filterMeta, setFilterMeta] = useState<any>(null);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL searchParams
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(searchParams.get('search') || '');

  // Sort state
  const [orderBy, setOrderBy] = useState<string>(searchParams.get('orderBy') || '_createdAt desc');

  // Filter States
  const [activeFilters, setActiveFilters] = useState<{
    priceMin: number;
    priceMax: number;
    municipalities: string[];
    metaFilters: Record<string, any>;
  }>(() => {
    const municipalities = searchParams.get('municipalities')?.split(',').filter(Boolean) || [];
    const priceMin = Number(searchParams.get('priceMin')) || 0;
    const priceMax = Number(searchParams.get('priceMax')) || 5000000;
    
    // Parse meta filters from JSON string if present
    let metaFilters = {};
    const metaStr = searchParams.get('meta');
    if (metaStr) {
      try {
        metaFilters = JSON.parse(metaStr);
      } catch (e) {
        console.error('Failed to parse meta filters from URL', e);
      }
    }

    return {
      priceMin,
      priceMax,
      municipalities,
      metaFilters
    };
  });

  const [municipalitiesList, setMunicipalitiesList] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchMunicipalities();
        setMunicipalitiesList(list);
      } catch (err) {
        console.error('Error loading municipalities:', err);
      }
    }
    load();
  }, []);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    return TENERIFE_MUNICIPALITIES.filter(mun => 
      mun.toLowerCase().includes(query) && mun.toLowerCase() !== query
    ).slice(0, 5);
  }, [searchQuery]);
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  // Handle Header Dark Mode for this page
  useEffect(() => {
    document.body.classList.remove('header-light-mode');
    document.body.classList.remove('header-black-bg');
    document.body.classList.add('header-dark-mode');
    return () => {
      document.body.classList.remove('header-dark-mode');
    };
  }, []);

  // Sync URL changes back to local state (e.g. when clicking back/forward)
  useEffect(() => {
    const search = searchParams.get('search') || '';
    if (search !== debouncedSearchQuery) {
      setSearchQuery(search);
      setDebouncedSearchQuery(search);
    }

    const sort = searchParams.get('orderBy') || '_createdAt desc';
    if (sort !== orderBy) setOrderBy(sort);

    const priceMin = Number(searchParams.get('priceMin')) || 0;
    const priceMax = Number(searchParams.get('priceMax')) || (filterMeta?.maxPrice || 5000000);
    const municipalities = searchParams.get('municipalities')?.split(',').filter(Boolean) || [];
    
    let metaFilters = {};
    const metaStr = searchParams.get('meta');
    if (metaStr) {
      try {
        metaFilters = JSON.parse(metaStr);
      } catch (e) {
        console.error('Failed to parse meta filters from URL', e);
      }
    }

    // Check if filters have actually changed to avoid unnecessary re-renders
    const isMunDiff = municipalities.length !== activeFilters.municipalities.length || !municipalities.every(m => activeFilters.municipalities.includes(m));
    const isMetaDiff = JSON.stringify(metaFilters) !== JSON.stringify(activeFilters.metaFilters);
    
    if (priceMin !== activeFilters.priceMin || priceMax !== activeFilters.priceMax || isMunDiff || isMetaDiff) {
      setActiveFilters({
        priceMin,
        priceMax,
        municipalities,
        metaFilters
      });
    }
  }, [searchParams]);

  // Consolidated URL synchronization (debounced to avoid excessive history entries)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      
      const maxLimit = filterMeta?.maxPrice || 5000000;
      if (searchQuery) params.set('search', searchQuery);
      if (activeFilters.priceMin > 0) params.set('priceMin', activeFilters.priceMin.toString());
      if (activeFilters.priceMax < maxLimit) params.set('priceMax', activeFilters.priceMax.toString());
      if (activeFilters.municipalities.length > 0) params.set('municipalities', activeFilters.municipalities.join(','));
      if (Object.keys(activeFilters.metaFilters).length > 0) params.set('meta', JSON.stringify(activeFilters.metaFilters));
      if (orderBy !== '_createdAt desc') params.set('orderBy', orderBy);

      const newQuery = params.toString();
      const currentQuery = searchParams.toString();

      if (newQuery !== currentQuery) {
        router.replace(`${pathname}?${newQuery}`, { scroll: false });
      }
      
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters, orderBy, filterMeta?.maxPrice, pathname, router, searchParams]);

  // Fetch filter metadata
  useEffect(() => {
    const fetchFilterMeta = async () => {
      try {
        const res = await client.fetch(PROPERTY_META_QUERY, { language: locale });
        setFilterMeta(res);
      } catch (err) {
        console.error('Error fetching filter meta:', err);
      }
    };
    fetchFilterMeta();
  }, [locale]);

  // Sync priceMax once filterMeta loads
  useEffect(() => {
    if (filterMeta?.maxPrice !== undefined) {
      setActiveFilters((prev) => ({
        ...prev,
        priceMax: prev.priceMax === 5000000 ? filterMeta.maxPrice : prev.priceMax
      }));
    }
  }, [filterMeta?.maxPrice]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // Use 1024px for sidebar layout threshold
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = isMobile ? 6 : 12;

  // Fetch properties based on search, filters, and page changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const fetchProperties = async () => {
      try {
        let baseFilter = `_type == "property" && (language == $language || (!defined(language) && $language == "en")) && status != "sold"`;

        // Price Range Filter
        baseFilter += ` && price >= $priceMin && price <= $priceMax`;

        // Municipalities Filter
        if (activeFilters.municipalities.length > 0) {
          baseFilter += ` && location.municipality in $municipalities`;
        }

        // Search text filter
        if (debouncedSearchQuery.trim().length > 0) {
          baseFilter += ` && (
            title match $search || 
            title[$language] match $search ||
            location.streetAddress match $search || 
            location.complexName match $search || 
            location.municipality match $search
          )`;
        }

        // Dynamic Sanity Metadata Filters
        Object.entries(activeFilters.metaFilters).forEach(([metaId, val]) => {
          if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) return;

          const cleanMetaId = metaId.replace('drafts.', '');
          const def = filterMeta?.definitions?.find((d: any) => d._id.replace('drafts.', '') === cleanMetaId);
          if (!def) return;

          const type = def.filter?.filterType;
          if (type === 'boolean' && val === true) {
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && booleanValue == true]) > 0`;
          } else if (type === 'rangeSlider') {
            const isDouble = def.filter?.isDoubleSlider === true;
            if (isDouble && typeof val === 'object' && val !== null) {
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue >= ${val.min} && numberValue <= ${val.max}]) > 0`;
            } else {
              const maxVal = (typeof val === 'object' && val !== null) ? val.max : val;
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue <= ${maxVal}]) > 0`;
            }
          } else if (type === 'prefixRange') {
            const prefixOptions = def.filter?.prefixOptions || [];
            const opt = prefixOptions.find((o: any) => String(o.value) === String(val));

            // Handle "Any" option via the new Sanity toggle
            if (opt?.isAny === true) {
              return;
            }

            if (val === undefined || val === null || val === '') return;

            // Default to '==' for prefixRange unless explicitly set to gte/lte
            let groqOperator = '==';
            if (opt) {
              if (opt.operator === 'gte' || opt.operator === '>=') groqOperator = '>=';
              else if (opt.operator === 'lte' || opt.operator === '<=') groqOperator = '<=';
              else if (opt.operator === 'equals' || opt.operator === '==') groqOperator = '==';
            }

            const num = parseInt(val);
            if (!isNaN(num)) {
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue ${groqOperator} ${num}]) > 0`;
            }
          } else if (type === 'select') {
            baseFilter += ` && count(meta[metaKey->_id == "${metaId}" && stringValue == "${val}"]) > 0`;
          } else if (type === 'multiSelect' && Array.isArray(val) && val.length > 0) {
            const joinedOptions = val.map(v => `"${v}"`).join(', ');
            baseFilter += ` && count(meta[metaKey->_id == "${metaId}" && stringValue in [${joinedOptions}]]) > 0`;
          }
        });

        const query = `
          {
            "items": *[${baseFilter}] | order(${orderBy}) [$start...$end] {
              ${PROPERTY_CARD_FIELDS}
            },
            "total": count(*[${baseFilter}])
          }
        `;

        const res = await client.fetch(query, {
          language: locale,
          start,
          end,
          priceMin: activeFilters.priceMin,
          priceMax: activeFilters.priceMax,
          municipalities: activeFilters.municipalities,
          search: `*${debouncedSearchQuery}*`
        });

        if (isMounted) {
          setProperties(res.items || []);
          setTotalCount(res.total || 0);
          setLoading(false);

          // Trigger ScrollTrigger refresh
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);

          // Grid Entrance Animation
          if (gridRef.current && res.items?.length > 0) {
            const cards = gridRef.current.querySelectorAll('.property-card');
            gsap.fromTo(
              cards,
              { y: 30, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.08,
                ease: 'power3.out'
              }
            );
          }
        }
      } catch (err) {
        console.error('Error fetching properties archive:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [currentPage, locale, itemsPerPage, activeFilters, debouncedSearchQuery, filterMeta, orderBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeFilters.priceMin > 0) count++;
    if (activeFilters.priceMax < (filterMeta?.maxPrice || 5000000)) count++;
    if (activeFilters.municipalities.length > 0) count++;

    Object.values(activeFilters.metaFilters).forEach((val: any) => {
      if (val !== undefined && val !== '' && (Array.isArray(val) ? val.length > 0 : true)) {
        count++;
      }
    });
    return count;
  }, [activeFilters, filterMeta]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    const maxVisible = 4;

    if (totalPages <= maxVisible + 1) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
      return range;
    }

    range.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      range.push("...");
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (end < totalPages - 1) {
      range.push("...");
    }

    range.push(totalPages);
    return range;
  };

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
    setCurrentPage(pageNum);

    // Smooth scroll back to section top
    if (typeof window !== 'undefined' && (window as any).lenis && sectionRef.current) {
      (window as any).lenis.scrollTo(sectionRef.current, { offset: -100, duration: 1.2 });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveFilters({
      priceMin: 0,
      priceMax: filterMeta?.maxPrice || 5000000,
      municipalities: [],
      metaFilters: {}
    });
    setCurrentPage(1);
  };

  const handleClearMunicipalities = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveFilters(prev => ({
      ...prev,
      municipalities: []
    }));
    setCurrentPage(1);
  };

  const isMunicipalityFocused = useMemo(() => {
    if (activeFilters.municipalities.length > 0) return true;
    if (searchQuery.length > 2) {
      const query = searchQuery.toLowerCase().trim();
      const combinedList = [...new Set([...TENERIFE_MUNICIPALITIES, ...municipalitiesList])];
      
      // Check if search query matches any known municipality
      return combinedList.some((name: string) => {
        const lowerName = name.toLowerCase();
        return lowerName === query || lowerName.includes(query) || query.includes(lowerName);
      });
    }
    return false;
  }, [activeFilters.municipalities, searchQuery, municipalitiesList]);

  return (
    <section className="archive-properties-section" ref={sectionRef}>
      <div className="archive-properties-wrapper">

        {/* Top Premium Search Bar Row */}
        <div className="archive-search-container" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <div className="search-modal-header-row">
            <div className="search-input-wrapper" ref={suggestionsRef}>
              <span className="search-input-icon">
                <Image src="/icons/search.svg" alt="Search" width={22} height={22} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={dict?.archive?.search_placeholder}
                className="search-input-real"
              />
              {searchQuery && (
                <button className="archive-search-clear" onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }} aria-label="Clear Search">
                  ✕
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                  {suggestions.map((mun) => (
                    <div 
                      key={mun} 
                      className="suggestion-item-row"
                      onClick={() => {
                        setSearchQuery(mun);
                        setShowSuggestions(false);
                      }}
                    >
                      <Image src="/icons/search.svg" alt="" width={14} height={14} className="suggestion-icon" />
                      <span>{mun}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout Column Wrapper */}
        <div className="archive-main-layout">

          {/* Left Column: Filter Sidebar (Desktop only) */}
          {!isMobile && (
            <div className="archive-filter-column filter-sidebar-inline">
              <FilterSidebar
                isOpen={true}
                onClose={() => { }}
                locale={locale}
                dict={dict}
                meta={filterMeta}
                activeFilters={activeFilters}
                onApplyFilters={(filters) => {
                  setActiveFilters(filters);
                  setCurrentPage(1);
                }}
                isInline={true}
              />
            </div>
          )}

          {/* Right Column: Listings and results count */}
          <div className="archive-listings-column">

            <div className="archive-results-header">
              <div className="archive-sort-pills">
                <span className="sort-label">{dict?.archive?.sort_label}</span>
                <button
                  className={`suggestion-item ${orderBy === '_createdAt desc' ? 'active' : ''}`}
                  onClick={() => { setOrderBy('_createdAt desc'); setCurrentPage(1); }}
                >
                  {dict?.archive?.sort_newest}
                </button>
                <button
                  className={`suggestion-item ${orderBy === 'price desc' ? 'active' : ''}`}
                  onClick={() => { setOrderBy('price desc'); setCurrentPage(1); }}
                >
                  {dict?.archive?.sort_price_desc}
                </button>
                <button
                  className={`suggestion-item ${orderBy === 'price asc' ? 'active' : ''}`}
                  onClick={() => { setOrderBy('price asc'); setCurrentPage(1); }}
                >
                  {dict?.archive?.sort_price_asc}
                </button>
              </div>

              {/* Filter Button for Mobile/Tablet */}
              {isMobile && (
                <div className='archive-mobile-filter-btn-container'>
                  <button className="archive-mobile-filter-btn btn-pill" onClick={() => setIsSidebarOpen(true)}>
                    <span>{dict?.archive?.filter_button}</span>
                    {activeFiltersCount > 0 && <span className="filter-count-badge">{activeFiltersCount}</span>}
                    <Image src="/icons/tune.svg" alt="Filter" width={18} height={18} className="filter-icon btn-icon" />
                  </button>
                </div>
              )}
            </div>

            {/* Properties Grid */}
            <div className="archive-grid-container">
              {loading ? (
                <div className="archive-loader">
                  <div className="spinner"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="archive-empty">
                  <div className="smart-empty-state">
                    <div className="smart-empty-icon">
                      <img src="/icons/info.svg" alt="No results" />
                    </div>
                    <h3>
                      {isMunicipalityFocused 
                        ? dict?.archive?.no_properties_in_area 
                        : dict?.archive?.no_results}
                    </h3>
                    <p>
                      {isMunicipalityFocused 
                        ? dict?.archive?.explore_others 
                        : dict?.archive?.no_results_subtitle}
                    </p>
                    {isMunicipalityFocused && (
                      <Button 
                        label={dict?.archive?.explore_other_areas}
                        variant="dark"
                        showArrow={true}
                        onClick={handleClearMunicipalities}
                        className="empty-state-cta"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="archive-grid" ref={gridRef}>
                  {properties.map((prop) => (
                    <PropertyCard key={prop._id} prop={prop} variant="seamless" dict={dict} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Row */}
            {!loading && totalPages > 1 && (
              <div className="archive-pagination" ref={paginationRef}>
                <button
                  className="pagination-arrow prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  <img src="/icons/chevron_backward.svg" alt="Previous" />
                </button>

                <div className="pagination-numbers">
                  {isMobile ? (
                    <span className="pagination-mobile-indicator">
                      {currentPage} <span style={{ opacity: 0.4, margin: '0 4px' }}>/</span> {totalPages}
                    </span>
                  ) : (
                    getPaginationRange().map((item, idx) => {
                      if (item === "...") {
                        return (
                          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={item}
                          className={`pagination-number ${currentPage === item ? "active" : ""}`}
                          onClick={() => handlePageChange(item as number)}
                        >
                          {item}
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  className="pagination-arrow next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                >
                  <img src="/icons/chevron_forward.svg" alt="Next" />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Mobile/Tablet Popup Filter Sidebar */}
      {isMobile && (
        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          locale={locale}
          dict={dict}
          meta={filterMeta}
          activeFilters={activeFilters}
          onApplyFilters={(filters) => {
            setActiveFilters(filters);
            setCurrentPage(1);
            setIsSidebarOpen(false);
          }}
          isInline={false}
        />
      )}
    </section>
  );
}
