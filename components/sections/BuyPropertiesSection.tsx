'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { client } from '@/sanity/lib/client';
import PropertyCard from '../ui/PropertyCard';
import SearchModal from './SearchModal';
import './BuyPropertiesSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ITEMS_PER_PAGE = 6;

export default function BuyPropertiesSection({ data, dict }: { data?: any, dict?: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const tagline = data?.tagline || (dict?.properties?.tagline || 'Our Properties');
  const title = data?.title || (dict?.properties?.title || 'Exclusive Tenerife Homes');
  const description = data?.description || (dict?.properties?.description || 'Browse our curated selection of ultra-luxury estates, modern villas, and elegant apartments across Tenerife.');

  const locale = dict?.locale || 'en';



  // Fetch properties based on page change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    const fetchProperties = async () => {
      try {
        const query = `
          {
            "items": *[_type == "property" && (language == $language || (!defined(language) && $language == "en"))] | order(_createdAt desc) [$start...$end] {
              _id,
              title,
              "address": coalesce(location.fullAddress, address),
              price,
              status,
              featured,
              "slug": slug.current,
              image { 
                asset->{ _id, url, metadata { lqip, dimensions } } 
              },
              secondaryImage { 
                asset->{ _id, url, metadata { lqip, dimensions } } 
              },
              meta[] {
                "metaId": metaKey->_id,
                "shortLabel": coalesce(metaKey->shortLabel[$language], metaKey->shortLabel.en),
                "valueType": metaKey->valueType,
                "unit": coalesce(metaKey->unit[$language], metaKey->unit.en),
                "isHighlighted": metaKey->isHighlighted,
                "highlightOrder": metaKey->highlightOrder,
                "icon": metaKey->icon.asset->url,
                numberValue,
                stringValue,
                booleanValue
              }
            },
            "total": count(*[_type == "property" && (language == $language || (!defined(language) && $language == "en"))])
          }
        `;

        const res = await client.fetch(query, {
          language: locale,
          start,
          end
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
  }, [currentPage, locale]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
          <button className="buy-properties-filter-btn" onClick={() => setIsModalOpen(true)}>
            <span>{locale === 'es' ? 'Filtrar' : 'Filter'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              className="pagination-arrow next" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}

      </div>
      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
