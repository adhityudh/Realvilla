'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { client } from '@/sanity/lib/client';
import { BLOG_ARCHIVE_QUERY } from '@/sanity/lib/queries';
import { sanitizeSanityData } from '@/lib/sanitize';
import BlogCard, { BlogPost } from '../ui/BlogCard';
import BlogFeaturedHero from './BlogFeaturedHero';
import Button from '../ui/Button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './BlogArchiveSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BlogArchiveSectionProps {
  dict?: any;
  locale: string;
  initialFeatured?: BlogPost[];
  initialItems?: BlogPost[];
  initialTotalCount?: number;
  initialCategories?: Array<{ _id: string; title: string; slug: string }>;
}

const ITEMS_PER_PAGE = 6;

const deduplicateCategories = (categories: Array<{ _id: string; title: string; slug: string }>) => {
  return categories.reduce((acc: Array<{ _id: string; title: string; slug: string }>, cat) => {
    if (!acc.find(c => c._id === cat._id)) {
      acc.push(cat);
    }
    return acc;
  }, []);
};

export default function BlogArchiveSection({
  dict,
  locale,
  initialFeatured,
  initialItems,
  initialTotalCount,
  initialCategories,
}: BlogArchiveSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tabsWrapperRef = useRef<HTMLDivElement>(null);

  const [featured, setFeatured] = useState<BlogPost[]>(initialFeatured || []);
  const [items, setItems] = useState<BlogPost[]>(initialItems || []);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount || 0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(!initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [allCategories, setAllCategories] = useState<Array<{ _id: string; title: string; slug: string }>>(deduplicateCategories(initialCategories || []));
  const hasRunInitialFetch = useRef<boolean>(false);

  useEffect(() => {
    document.body.classList.remove('header-light-mode');
    document.body.classList.add('header-dark-mode');
    return () => {
      document.body.classList.remove('header-dark-mode');
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch items on page change
  useEffect(() => {
    let isMounted = true;

    const isInitialDefaultState = currentPage === 1 && !selectedCategory && initialItems && !hasRunInitialFetch.current;

    if (isInitialDefaultState) {
      hasRunInitialFetch.current = true;
      setLoading(false);
      return;
    }

    hasRunInitialFetch.current = true;
    setLoading(true);

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    const fetchPosts = async () => {
      try {
        const res = await client.fetch(
          BLOG_ARCHIVE_QUERY,
          { language: locale, start, end, categoryId: selectedCategory },
          { stega: false }
        );
        const data = sanitizeSanityData(res);
        if (!isMounted) return;

        setFeatured(data.featured || []);
        setItems(data.items || []);
        setTotalCount(data.total || 0);
        setAllCategories(deduplicateCategories(data.allCategories || []));
        setLoading(false);

        setTimeout(() => { ScrollTrigger.refresh(); }, 100);
      } catch (err) {
        console.error('Error fetching blog archive:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchPosts();
    return () => { isMounted = false; };
  }, [currentPage, locale, selectedCategory]);

  const hasMore = items.length < totalCount;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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

    const scrollTarget = gridRef.current || sectionRef.current;
    if (typeof window !== 'undefined' && (window as any).lenis && scrollTarget) {
      (window as any).lenis.scrollTo(scrollTarget, { offset: -100, duration: 1.2 });
    } else if (scrollTarget) {
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  useEffect(() => {
    const tabsWrapper = tabsWrapperRef.current;
    if (!tabsWrapper) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = tabsWrapper;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
    };

    handleScroll();
    tabsWrapper.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      tabsWrapper.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [allCategories]);

  return (
    <section className="blog-archive-section" ref={sectionRef}>
      {featured.length > 0 && (
        <BlogFeaturedHero posts={featured} locale={locale} dict={dict} />
      )}

      {/* Featured Articles */}
      {/* {featured.length > 0 && (
        <div className="blog-featured-grid">
          <div className="blog-featured-item blog-featured-item--highlight">
            <BlogCard
              post={featured[0]}
              locale={locale}
              variant="default"
            />
          </div>
          {featured.length > 1 && (
            <div className="blog-featured-list">
              {featured.slice(1, 4).map((post) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  locale={locale}
                  variant="horizontal"
                />
              ))}
            </div>
          )}
        </div>
      )} */}

      {/* Category Tabs */}
      {items.length > 0 && allCategories.length > 0 && (
        <div className="blog-archive-tabs-container">
          <div 
            className={`blog-archive-tabs-wrapper ${showLeftGradient ? 'show-left-gradient' : ''} ${showRightGradient ? 'show-right-gradient' : ''}`}
          >
            <div className="blog-archive-tabs" ref={tabsWrapperRef}>
              <button
                className={`blog-archive-tab-item ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => handleCategoryChange(null)}
              >
                {dict?.blog?.all || 'All'}
              </button>
              {allCategories.map((category) => (
                <button
                  key={category._id}
                  className={`blog-archive-tab-item ${selectedCategory === category._id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category._id)}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Archive Grid */}
      <div className="blog-archive-grid-container">
        {loading ? (
          <div className="blog-archive-loader">
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="blog-archive-empty">
            <p>{dict?.blog?.no_results || 'No blog posts found.'}</p>
          </div>
        ) : (
          <div className="blog-archive-grid" ref={gridRef}>
            {items.map((post) => (
              <BlogCard key={post._id} post={post} locale={locale} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="blog-archive-pagination">
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
    </section>
  );
}