'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'all' | 'property' | 'location';

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearching = searchQuery.length > 0;

  // Handle search with simulated loading
  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const tl = gsap.timeline();
      tl.set(modalRef.current, { display: 'flex' });
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0);
      tl.fromTo(
        contentRef.current,
        { y: 50, opacity: 0, scale: 0.95, filter: 'blur(10px)' },
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' },
        0.1
      );

      // Manual focus with small delay to ensure visibility
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    } else {
      document.body.style.overflow = '';
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (modalRef.current) modalRef.current.style.display = 'none';
          setSearchQuery(''); // Reset on close
          setActiveTab('all');
        }
      });
      tl.to(contentRef.current, { y: 30, opacity: 0, scale: 0.98, filter: 'blur(5px)', duration: 0.4, ease: 'power2.in' });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.1);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div className="search-modal-container" ref={modalRef} style={{ display: 'none' }}>
      <div className="search-modal-overlay" ref={overlayRef} onClick={handleOverlayClick} />
      
      <div className="search-modal-content" ref={contentRef}>
        <div className="search-modal-body">
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
                autoFocus 
                type="text" 
                className="search-input-real"
                placeholder="Type to search properties, locations..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <button className="search-modal-close-new" onClick={onClose} aria-label="Close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {!isSearching ? (
            /* Mode 1: Initial Suggestions */
            <div className="search-suggestions-container">
              <p className="section-title">Trending Searches</p>
              <div className="suggestions-list">
                {['Villa Del Mar', 'Costa Adeje', 'Modern Penthouse', 'Los Gigantes'].map((item) => (
                  <button key={item} className="suggestion-item" onClick={() => setSearchQuery(item)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', opacity: 0.5}}>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Mode 2: Search Results with Grouping Tabs */
            <div className="search-results-container">
              {isLoading ? (
                /* Loading State */
                <div className="search-loading-state">
                  <div className="loading-shimmer" />
                  <div className="loading-shimmer" style={{ width: '80%', marginTop: '1rem' }} />
                  <div className="loading-shimmer" style={{ width: '60%', marginTop: '1rem' }} />
                </div>
              ) : (
                /* Loaded State */
                <>
                  <div className="search-tabs">
                    <button className={`search-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Results</button>
                    <button className={`search-tab ${activeTab === 'property' ? 'active' : ''}`} onClick={() => setActiveTab('property')}>Properties</button>
                    <button className={`search-tab ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}>Locations</button>
                  </div>

                  <div className="search-results-list">
                    {/* All tab shows simple grouping */}
                    {(activeTab === 'all' || activeTab === 'property') && (
                      <div className="result-group">
                        <p className="group-label">Properties</p>
                        <div className="result-items">
                          <div className="result-item">Villa Del Mar - <span className="result-meta">Adeje</span></div>
                          <div className="result-item">Modern Penthouse - <span className="result-meta">Santa Cruz</span></div>
                        </div>
                      </div>
                    )}

                    {(activeTab === 'all' || activeTab === 'location') && (
                      <div className="result-group">
                        <p className="group-label">Locations</p>
                        <div className="result-items">
                          <div className="result-item">Costa Adeje</div>
                          <div className="result-item">Los Gigantes</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
