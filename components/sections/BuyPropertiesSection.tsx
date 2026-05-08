'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { client } from '@/sanity/lib/client';
import { PROPERTY_META_QUERY, PROPERTY_CARD_FIELDS } from '@/sanity/lib/queries';
import PropertyCard from '../ui/PropertyCard';
import SearchModal from './SearchModal';
import FilterSidebar from './FilterSidebar';
import './BuyPropertiesSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BuyPropertiesSection({ data, dict }: { data?: any, dict?: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [filterMeta, setFilterMeta] = useState<any>(null);

  // Filter States
  const [activeFilters, setActiveFilters] = useState<{
    priceMin: number;
    priceMax: number;
    municipalities: string[];
    metaFilters: Record<string, any>;
  }>({
    priceMin: 0,
    priceMax: 5000000,
    municipalities: [],
    metaFilters: {}
  });

  const title = data?.title || (dict?.properties?.title || 'Exclusive Tenerife Homes');

  const pathname = usePathname();
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

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
      setIsMobile(window.innerWidth <= 768);
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

          const def = filterMeta?.definitions?.find((d: any) => d._id === metaId);
          if (!def) return;

          const type = def.filter?.filterType;
          if (type === 'boolean' && val === true) {
            baseFilter += ` && count(meta[metaKey->_id == "${metaId}" && booleanValue == true]) > 0`;
          } else if (type === 'rangeSlider') {
            baseFilter += ` && count(meta[metaKey->_id == "${metaId}" && numberValue <= ${val}]) > 0`;
          } else if (type === 'prefixRange') {
            const num = parseInt(val);
            if (!isNaN(num)) {
              baseFilter += ` && count(meta[metaKey->_id == "${metaId}" && numberValue >= ${num}]) > 0`;
            }
          } else if (type === 'select') {
            baseFilter += ` && count(meta[metaKey->_id == "${metaId}" && stringValue == "${val}"]) > 0`;
          } else if (type === 'multiSelect' && Array.isArray(val) && val.length > 0) {
            const joinedOptions = val.map(v => `"${v}"`).join(', ');
            baseFilter += ` && count(meta[metaKey->_id == "${metaId}" && stringValue in [${joinedOptions}]]) > 0`;
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
            "items": *[${baseFilter}] | order(${sortOrder}) [$start...$end] {
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
          municipalities: activeFilters.municipalities
        });

        if (isMounted) {
          setProperties(res.items || []);
          setTotalCount(res.total || 0);
          setLoading(false);

          // Trigger grid animation on load
          if (gridRef.current) {
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
    <section className="buy-properties-section" id="properties-list" ref={sectionRef}>
      <div className="buy-properties-wrapper">
        
        {/* Section Header */}
        <div className="buy-properties-header">
          <h2 className="buy-properties-title">{title}</h2>
          <button className="buy-properties-filter-btn" onClick={() => setIsSidebarOpen(true)}>
            <span>{locale === 'es' ? 'Filtrar' : 'Filter'}</span>
            <img src="/icons/tune.svg" alt="Filter" className="filter-icon" />
          </button>
        </div>

        {/* Properties Grid */}
        <div className="buy-properties-grid-container">
          {loading ? (
            <div className="buy-properties-loader">
              <div className="spinner"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="buy-properties-empty">
              {locale === 'es' ? 'Tidak ada properti ditemukan.' : 'No properties found.'}
            </div>
          ) : (
            <div className="buy-properties-grid" ref={gridRef}>
              {properties.map((prop) => (
                <PropertyCard key={prop._id} prop={prop} variant="seamless" />
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
        activeFilters={activeFilters}
        onApplyFilters={(filters) => {
          setActiveFilters(filters);
          setCurrentPage(1);
        }}
      />
    </section>
  );
}
