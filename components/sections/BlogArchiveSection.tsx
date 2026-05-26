'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { client } from '@/sanity/lib/client';
import { BLOG_ARCHIVE_QUERY } from '@/sanity/lib/queries';
import { sanitizeSanityData } from '@/lib/sanitize';
import BlogCard, { BlogPost } from '../ui/BlogCard';
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
}

const ITEMS_PER_PAGE = 9;

export default function BlogArchiveSection({
  dict,
  locale,
  initialFeatured,
  initialItems,
  initialTotalCount,
}: BlogArchiveSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [featured, setFeatured] = useState<BlogPost[]>(initialFeatured || []);
  const [items, setItems] = useState<BlogPost[]>(initialItems || []);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount || 0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(!initialItems);
  const hasRunInitialFetch = useRef<boolean>(false);

  useEffect(() => {
    document.body.classList.remove('header-light-mode');
    document.body.classList.add('header-dark-mode');
    return () => {
      document.body.classList.remove('header-dark-mode');
    };
  }, []);

  // Fetch items on page change
  useEffect(() => {
    let isMounted = true;

    const isInitialDefaultState = currentPage === 1 && initialItems && !hasRunInitialFetch.current;

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
          { language: locale, start, end },
          { stega: false }
        );
        const data = sanitizeSanityData(res);
        if (!isMounted) return;

        if (currentPage === 1) {
          setFeatured(data.featured || []);
          setItems(data.items || []);
        } else {
          setItems((prev) => [...prev, ...(data.items || [])]);
        }
        setTotalCount(data.total || 0);
        setLoading(false);

        setTimeout(() => { ScrollTrigger.refresh(); }, 100);
      } catch (err) {
        console.error('Error fetching blog archive:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchPosts();
    return () => { isMounted = false; };
  }, [currentPage, locale]);

  const hasMore = items.length < totalCount;
  const displayedFeatured = featured.slice(0, 3);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  return (
    <section className="blog-archive-section" ref={sectionRef}>
      {/* Featured Articles */}
      {displayedFeatured.length > 0 && (
        <div className="blog-featured-grid">
          {displayedFeatured.map((post, index) => (
            <div
              key={post._id}
              className={`blog-featured-item blog-featured-item--${index === 0 ? 'span-2' : 'span-1'}`}
            >
              <BlogCard
                post={post}
                locale={locale}
                variant="seamless"
              />
            </div>
          ))}
        </div>
      )}

      {/* Archive Grid */}
      {items.length > 0 && (
        <div className="blog-archive-grid" ref={gridRef}>
          {items.map((post) => (
            <BlogCard key={post._id} post={post} locale={locale} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="blog-archive-empty">
          <p>{dict?.blog?.no_results || 'No blog posts found.'}</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="blog-archive-load-more">
          <Button
            label={
              loading
                ? dict?.blog?.loading || 'Loading...'
                : dict?.blog?.load_more || 'Load More'
            }
            onClick={handleLoadMore}
            variant="dark"
            showArrow={false}
            className="blog-load-more-btn"
          />
        </div>
      )}
    </section>
  );
}