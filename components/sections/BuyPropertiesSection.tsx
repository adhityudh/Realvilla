'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { client } from '@/sanity/lib/client';
import { PROPERTY_META_QUERY, PROPERTY_CARD_FIELDS } from '@/sanity/lib/queries';
import { sanitizeSanityData } from '@/lib/sanitize';
import PropertyCard from '../ui/PropertyCard';
import Button from '../ui/Button';
import SearchModal from './SearchModal';
import FilterSidebar from './FilterSidebar';
import './BuyPropertiesSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BuyPropertiesSection({ data, dict, filterMeta: initialMeta }: { data?: any, dict?: any, filterMeta?: any }) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [filterMeta, setFilterMeta] = useState<any>(initialMeta || null);

  // Filter States
  const [activeFilters, setActiveFilters] = useState<{
    priceMin: number;
    priceMax: number;
    municipalities: string[];
    categories: string[];
    metaFilters: Record<string, any>;
  }>({
    priceMin: 0,
    priceMax: initialMeta?.maxPrice || 5000000,
    municipalities: [],
    categories: [],
    metaFilters: {}
  });

  const [municipalitiesList, setMunicipalitiesList] = useState<string[]>([]);

  const title = data?.title || dict?.properties?.title;

  const pathname = usePathname();
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  const handleQuickFilterClick = (val: string, filterType: 'meta' | 'category' = 'category', rawMetaId?: string) => {
    if (!val) return;
    const cleanedVal = typeof val === 'string' ? val.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : val;
    const targetPath = locale === 'es' ? 'propiedades' : 'properties';

    if (filterType === 'category') {
      router.push(`/${locale}/${targetPath}?categories=${encodeURIComponent(cleanedVal)}`);
    } else if (rawMetaId) {
      const metaId = rawMetaId.replace('drafts.', '');
      const metaObj = JSON.stringify({ [metaId]: [cleanedVal] });
      router.push(`/${locale}/${targetPath}?meta=${encodeURIComponent(metaObj)}`);
    }
  };

  useEffect(() => {
    if (initialMeta) {
      setFilterMeta(initialMeta);
      return;
    }
    const fetchFilterMeta = async () => {
      try {
        const rawRes = await client.fetch(PROPERTY_META_QUERY, { language: locale }, { stega: false });
        setFilterMeta(sanitizeSanityData(rawRes));
      } catch (err) {
        console.error('Error fetching filter meta:', err);
      }
    };
    fetchFilterMeta();
  }, [locale, initialMeta]);

  // Fetch municipalities from internal API
  useEffect(() => {
    async function loadMun() {
      try {
        const res = await fetch('/api/geo/tenerife');
        const data = await res.json();
        if (data.municipalities) {
          setMunicipalitiesList(data.municipalities);
        }
      } catch (err) {
        console.error('Error loading municipalities:', err);
      }
    }
    loadMun();
  }, []);

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
      setIsMobile(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOpenSidebar = () => {
      setIsSidebarOpen(true);
    };
    window.addEventListener('open-filter-sidebar', handleOpenSidebar);
    return () => window.removeEventListener('open-filter-sidebar', handleOpenSidebar);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (data?.disableHeaderEntranceAnimation) return;

    const header = sectionRef.current.querySelector('.buy-properties-header');
    const quickFilters = sectionRef.current.querySelector('.buy-properties-quick-filters-wrapper');
    const elementsToAnimate = [header, quickFilters].filter(Boolean);

    if (elementsToAnimate.length > 0) {
      gsap.fromTo(
        elementsToAnimate,
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().filter(st => st.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, [data, filterMeta]);

  const itemsPerPage = useMemo(() => {
    if (isMobile && data?.itemsPerPageMobile) {
      return data.itemsPerPageMobile;
    }
    return data?.itemsPerPage || 6;
  }, [isMobile, data]);

  // Fetch properties based on page change and filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const fetchProperties = async () => {
      try {
        let baseFilter = `_type == "property" && (language == $language || (!defined(language) && $language == "en"))${data?.showSold ? "" : " && status != 'sold'"}${data?.selectionType === "manual" ? " && _id in $manualIds" : ""}`;

        // Price Range Filter
        baseFilter += ` && price >= $priceMin && price <= $priceMax`;

        // Municipalities Filter
        if (activeFilters.municipalities.length > 0) {
          baseFilter += ` && location.municipality in $municipalities`;
        }



        // Dynamic Sanity Metadata Filters
        Object.entries(activeFilters.metaFilters).forEach(([metaId, val]) => {
          if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) return;

          const cleanMetaId = metaId.replace('drafts.', '');
          const def = filterMeta?.definitions?.find((d: any) => d._id.replace('drafts.', '') === cleanMetaId);
          if (!def) return;

          const type = def.filter?.filterType;
          if ((type === 'boolean' || type === 'checkbox') && val === true) {
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
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && (stringValue == "${val}" || selectValue == "${val}" || "${val}" in selectArrayValue)]) > 0`;
          } else if (type === 'multiSelect' && Array.isArray(val) && val.length > 0) {
            const joinedOptions = val.map(v => `"${v}"`).join(', ');
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && (stringValue in [${joinedOptions}] || selectValue in [${joinedOptions}] || count(selectArrayValue[@ in [${joinedOptions}]]) > 0)]) > 0`;
          }
        });

        let sortOrder = "_createdAt desc";
        if (data?.orderBy === "price desc") {
          sortOrder = "price desc";
        } else if (data?.orderBy === "price asc") {
          sortOrder = "price asc";
        }

        const query = `
          {
            "items": *[${baseFilter}] | order(select(status == "sold" => 1, 0) asc, ${sortOrder}) [$start...$end] {
              ${PROPERTY_CARD_FIELDS}
            },
            "total": count(*[${baseFilter}])
          }
        `;

        const res = await client.fetch(query, {
          language: locale,
          start,
          end,
          manualIds: data?.manualIds || [],
          priceMin: activeFilters.priceMin,
          priceMax: activeFilters.priceMax,
          municipalities: activeFilters.municipalities,
          categories: activeFilters.categories || []
        });

        if (isMounted) {
          setProperties(res.items || []);
          setTotalCount(res.total || 0);
          setLoading(false);

          // RECALIBRATE: Inform all other scroll triggers that height has changed
          ScrollTrigger.refresh();
          setTimeout(() => ScrollTrigger.refresh(), 300);
          setTimeout(() => ScrollTrigger.refresh(), 1000); // Safety check

          // Trigger grid animation on load
          if (gridRef.current && !data?.disableEntranceAnimation) {
            const cards = gridRef.current.querySelectorAll('.property-card');
            gsap.fromTo(
              cards,
              { y: 40, opacity: 0, filter: 'blur(10px)' },
              {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
              }
            );
          }
        }
      } catch (err) {
        console.error('Error fetching paginated properties:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [currentPage, locale, itemsPerPage, data?.orderBy, data?.showSold, data?.selectionType, data?.manualIds, activeFilters, filterMeta]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeFilters.priceMin > 0) count++;
    if (activeFilters.priceMax < (filterMeta?.maxPrice || 5000000)) count++;
    if (activeFilters.municipalities.length > 0) count++;

    Object.values(activeFilters.metaFilters).forEach((val: any) => {
      if (val !== undefined && val !== '') {
        if (Array.isArray(val)) {
          count += val.length;
        } else {
          count += 1;
        }
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

    // Smooth scroll back to section top using Lenis if available
    if (typeof window !== 'undefined' && (window as any).lenis && sectionRef.current) {
      (window as any).lenis.scrollTo(sectionRef.current, { offset: -50, duration: 1.2 });
    } else if (sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className={`buy-properties-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} id={data?.id || 'properties-list'} ref={sectionRef}>
      <div className="buy-properties-wrapper">

        {/* Section Header */}
        <div className="buy-properties-header">
          <h2 className="buy-properties-title">{title}</h2>
          <div className="buy-properties-actions">
            <Button
              label={isMobile ? (dict?.archive?.view_all_short || "View All") : dict?.archive?.all_properties}
              href={`/${locale}/${locale === 'es' ? 'propiedades' : 'properties'}`}
              variant="dark"
              showArrow={true}
              className="buy-properties-cta"
            />
            <button className="buy-properties-filter-btn btn-pill" onClick={() => setIsSidebarOpen(true)}>
              {!isMobile && <span>{dict?.archive?.filter_button}</span>}
              {activeFiltersCount > 0 && <span className="filter-count-badge">{activeFiltersCount}</span>}
              <img src="/icons/tune.svg" alt="Filter" className="filter-icon btn-icon" />
            </button>
          </div>
        </div>
        
        {/* Quick Filters Chips (Dynamic Category Filter Configuration) */}
        {(() => {
          // If toggle is explicitly turned off, render nothing
          if (data?.showQuickFilters === false) return null;

          // Default setting fallback if not populated in studio yet
          const isAllMode = data?.quickFilterSelection !== 'custom';
          
          let itemsToRender = [];

          if (isAllMode) {
            // Render ALL available categories
            const globalCategories = filterMeta?.standaloneCategories || [];
            itemsToRender = globalCategories.map((c: any) => ({
              value: c._id,
              label: c.label,
              icon: c.icon
            }));
          } else {
            // Render only specific categories chosen in the section
            const selectedCats = data?.quickFilterCategories || [];
            itemsToRender = selectedCats.map((c: any) => ({
              value: c.value,
              label: c.label,
              icon: c.icon
            }));
          }

          if (itemsToRender.length === 0) return null;

          return (
            <div className="buy-properties-quick-filters-wrapper">
              <div className="buy-properties-quick-filters">
                {itemsToRender.map((opt: any) => (
                  <button
                    key={opt.value}
                    className="quick-filter-chip"
                    onClick={() => handleQuickFilterClick(opt.value, 'category')}
                  >
                    {opt.icon && (
                      <div className="quick-filter-icon-box">
                        <img src={opt.icon} alt="" className="quick-filter-chip-icon" />
                      </div>
                    )}
                    <span className="quick-filter-text">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Properties Grid */}
        <div className="buy-properties-grid-container">
          {loading ? (
            <div className="buy-properties-loader">
              <div className="spinner"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="buy-properties-empty">
              {dict?.properties?.no_results}
            </div>
          ) : (
            <div className="buy-properties-grid" ref={gridRef}>
              {properties.map((prop) => (
                <PropertyCard key={prop._id} prop={prop} variant="seamless" dict={dict} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="buy-pagination" ref={paginationRef}>
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
      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} dict={dict} />
      <FilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        locale={locale}
        dict={dict}
        meta={filterMeta}
        municipalities={municipalitiesList}
        activeFilters={activeFilters}
        onApplyFilters={(filters) => {
          const targetPath = locale === 'es' ? 'propiedades' : 'properties';
          const params = new URLSearchParams();
          const maxLimit = filterMeta?.maxPrice || 5000000;
          if (filters.priceMin > 0) params.set('priceMin', filters.priceMin.toString());
          if (filters.priceMax < maxLimit) params.set('priceMax', filters.priceMax.toString());
          if (filters.municipalities.length > 0) params.set('municipalities', filters.municipalities.join(','));
          if (filters.categories && filters.categories.length > 0) params.set('categories', filters.categories.join(','));
          if (Object.keys(filters.metaFilters).length > 0) params.set('meta', JSON.stringify(filters.metaFilters));

          router.push(`/${locale}/${targetPath}?${params.toString()}`);
        }}
      />
    </section>
  );
}
