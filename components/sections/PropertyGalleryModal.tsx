'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import gsap from 'gsap';
import { urlForImage } from '@/sanity/lib/image';
import { useLenis } from '@/lib/LenisContext';
import dynamic from 'next/dynamic';
import './PropertyGalleryModal.css';
import "plyr/dist/plyr.css";
import FloorfyViewer from './FloorfyViewer';

interface PropertyGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  dict?: any;
  initialItem?: any;
}

// --- STABLE NATIVE PLAYER ENGINE (YouTube via Plyr) ---
// This custom implementation bypasses buggy 3rd party wrappers to directly handle lifecycle,
// preventing React 18/19 StrictMode crashes (null getAttribute errors).
function ReliableVideoPlayer({ videoId, poster }: { videoId: string; poster?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitRef = useRef(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    // Reset ready state when videoId flips
    setIsPlayerReady(false);
  }, [videoId]);

  useEffect(() => {
    if (!containerRef.current || isInitRef.current) return;
    
    let instance: any = null;
    isInitRef.current = true; // Mutex lock against double invocation
    
    // Dynamically import core lib to completely avoid SSR issues
    import('plyr').then(({ default: Plyr }) => {
      if (!containerRef.current) {
        isInitRef.current = false;
        return;
      }
      
      // Initialize instance directly on the node
      instance = new Plyr(containerRef.current, {
        autoplay: true,
        muted: true,
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        youtube: { 
          noCookie: true, 
          rel: 0, 
          showinfo: 0, 
          iv_load_policy: 3, 
          modestbranding: 1, 
          enablejsapi: 1,
          controls: 0 
        }
      });

      // BIND DIRECT EVENTS: Sets state absolutely reliably directly from the library signals
      instance.on('ready', () => setIsPlayerReady(true));
      instance.on('playing', () => setIsPlayerReady(true));

      // Bind the definitive source configuration
      instance.source = {
        type: 'video',
        poster: poster,
        sources: [{ src: videoId, provider: 'youtube' }]
      };
    });

    // Clean cleanup callback
    return () => {
      if (instance) {
        instance.destroy();
      }
      isInitRef.current = false;
    };
  }, [videoId, poster]);

  return (
    <div key={videoId} className="plyr-isolated-viewport" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={containerRef} 
        className="plyr__video-embed" 
        style={{ width: '100%', height: '100%' }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}&enablejsapi=1`}
          allowFullScreen
          allow="autoplay"
        />
      </div>
      {/* Encapsulated inside component ensuring absolute positional stability */}
      <div 
        className="video-loading-overlay"
        style={{
          opacity: isPlayerReady ? 0 : 1,
          visibility: isPlayerReady ? 'hidden' : 'visible',
          transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s'
        }}
      >
        <div className="modal-loader-spinner"></div>
      </div>
    </div>
  );
}

// --- NATIVE HTML5 VIDEO PLAYER (for Sanity-hosted videos) ---
function NativeVideoPlayer({ src, poster }: { src: string; poster?: string }) {
  return (
    <div className="plyr-isolated-viewport" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <video
        key={src}
        controls
        autoPlay
        muted
        playsInline
        poster={poster}
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
      >
        <source src={src} />
      </video>
    </div>
  );
}

export default function PropertyGalleryModal({ isOpen, onClose, property, dict, initialItem }: PropertyGalleryModalProps) {
  const [mounted, setMounted] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    setMounted(true);
  }, []);
  const [activeTab, setActiveTab] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track current property to reset state when property changes
  const currentPropertyRef = useRef<string | null>(null);

  // Scroll Gradients state for Detail View
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  // Layout stabilizer state to defer player render until container achieves non-zero dimensions
  const [isLayoutStable, setIsLayoutStable] = useState(false);

  // Zoom state for image detail view
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset state when property changes
  useEffect(() => {
    const propertyId = property?._id || property?.slug || property?.title;
    if (propertyId && currentPropertyRef.current && currentPropertyRef.current !== propertyId) {
      // Property changed, reset to first tab
      setActiveTab('');
      setSelectedItem(null);
    }
    currentPropertyRef.current = propertyId;
  }, [property]);

  useEffect(() => {
    if (isOpen) {
      // Slight delay gives GSAP time to flip display:none to display:flex, 
      // avoiding 0px dimension calculations inside Plyr
      const timer = setTimeout(() => setIsLayoutStable(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsLayoutStable(false);
    }
  }, [isOpen]);

  const checkThumbnailScroll = () => {
    if (thumbScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = thumbScrollRef.current;
      // Using buffer values to allow a tiny bit of float inaccuracy/leeway
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      const timer = setTimeout(checkThumbnailScroll, 150);
      window.addEventListener('resize', checkThumbnailScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkThumbnailScroll);
      };
    }
  }, [selectedItem, activeTab]);

  // Reset zoom when selected item changes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [selectedItem]);

  // Zoom control functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Pan/drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const gallery = property?.gallery || [];
  const mainImage = property?.image;

  // Flatten and categorize media
  const allMedia = useMemo(() => {
    const items: any[] = [];
    if (mainImage) {
      items.push({ ...mainImage, _type: 'image', isMain: true });
    }
    gallery.forEach((g: any) => {
      if (g._type === 'galleryGroup') {
        // Skip virtual tour groups in allMedia (they're handled separately)
        if (g.mediaType !== 'virtualTour') {
          g.items?.forEach((item: any) => {
            items.push({ ...item, groupTitle: g.title });
          });
        }
      } else {
        items.push(g);
      }
    });
    return items;
  }, [gallery, mainImage]);

  const tabs = useMemo(() => {
    const tabList: Array<{ id: string; label: string; isVirtualTour?: boolean; group?: any }> = [];
    
    // Helper to strip invisible Stega characters
    const clean = (str: any) => typeof str === 'string' ? str.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : str;
    
    gallery.forEach((g: any) => {
      if (g._type === 'galleryGroup' && g.title) {
        const cleanMediaType = clean(g.mediaType);
        tabList.push({
          id: `group-${g.title}`,
          label: g.title,
          isVirtualTour: cleanMediaType === 'virtualTour',
          group: g
        });
      }
    });

    return tabList;
  }, [gallery]);

  // Sync activeTab with first available tab or fallback
  useEffect(() => {
    if (tabs.length > 0) {
      if (!activeTab || !tabs.some(t => t.id === activeTab)) {
        setActiveTab(tabs[0].id);
      }
    } else {
      setActiveTab('');
    }
  }, [tabs, activeTab]);

  const getFilteredMediaForTab = (tabId: string) => {
    if (tabId === 'all') return allMedia;
    if (tabId === 'video') return allMedia.filter(m => m._type === 'videoItem');
    if (tabId.startsWith('group-')) {
      const groupName = tabId.replace('group-', '');
      // Check if this is a virtual tour tab
      const tab = tabs.find(t => t.id === tabId);
      if (tab?.isVirtualTour) {
        return []; // Virtual tours don't use grid, return empty
      }
      return allMedia.filter(m => m.groupTitle === groupName);
    }
    return allMedia;
  };

  const filteredMedia = useMemo(() => getFilteredMediaForTab(activeTab), [activeTab, allMedia]);

  // Dedicated Effect to handle Jump-to-Detail Link on Open
  useEffect(() => {
    if (isOpen && initialItem) {
      // Helper to strip invisible Stega characters
      const clean = (str: any) => typeof str === 'string' ? str.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : str;
      
      // Check if initialItem is a virtual tour
      const isVirtualTour = initialItem._type === 'galleryGroup' && clean(initialItem.mediaType) === 'virtualTour';
      
      if (isVirtualTour) {
        // Find the matching virtual tour tab by title
        const matchingTab = tabs.find(t => 
          t.isVirtualTour && 
          t.group?.title === initialItem.title
        );
        
        if (matchingTab) {
          setActiveTab(matchingTab.id);
          // Don't set selectedItem for virtual tours - they show full iframe
          setSelectedItem(null);
        }
      } else {
        // Handle regular media items
        // Helper to extract ANY form of asset ID for uniform comparison
        const getAssetKey = (item: any) => item?.asset?._ref || item?.asset?._id || item?._id || '';
        const targetAssetKey = getAssetKey(initialItem);

        const matchedItem = allMedia.find(m => 
          (m._key && m._key === initialItem._key) ||
          (m._id && m._id === initialItem._id) ||
          (m.url && m.url === initialItem.url) ||
          // Compare extracted asset strings if keys/ids didn't match
          (targetAssetKey && getAssetKey(m) === targetAssetKey)
        );
        
        if (matchedItem) {
          setSelectedItem(matchedItem);
          if (matchedItem.groupTitle) {
            setActiveTab(`group-${matchedItem.groupTitle}`);
          } else {
            // Item has no groupTitle (e.g., main image), switch to first non-virtual tab
            // to prevent virtual tour from persisting as activeTab
            const firstRegularTab = tabs.find(t => !t.isVirtualTour);
            setActiveTab(firstRegularTab ? firstRegularTab.id : '');
          }
        }
      }
    } else if (isOpen && !initialItem && tabs.length > 0) {
      // Reset to first non-virtual tour tab when opening via "See All" (no initialItem)
      const firstRegularTab = tabs.find(t => !t.isVirtualTour) || tabs[0];
      setActiveTab(firstRegularTab.id);
    }
  }, [isOpen, initialItem, allMedia, tabs]);

  // GSAP Animations
  useEffect(() => {
    if (isOpen) {
      // Pre-warm/preload the Plyr package chunk eagerly as soon as the modal opens
      // This ensures the JS is already cached when the user clicks the video
      import("plyr-react").catch(() => { });

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
    } else {
      document.body.style.overflow = '';
      lenis?.start();

      const tl = gsap.timeline({
        onComplete: () => {
          if (modalRef.current) modalRef.current.style.display = 'none';
          // Don't reset activeTab - preserve virtual tour state
          // Only reset selectedItem (detail view)
          setSelectedItem(null);
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

  const getImageUrl = (item: any) => {
    if (item._type === 'image') {
      if (!item.asset) return '/placeholder-media.jpg';
      return urlForImage(item).url();
    }
    if (item._type === 'videoItem') {
      if (item.thumbnail?.asset) return urlForImage(item.thumbnail).url();
      const videoId = item.url?.includes('v=')
        ? item.url.split('v=')[1]?.split('&')[0]
        : item.url?.split('/').pop();
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/placeholder-media.jpg';
    }
    if (item._type === 'nativeVideoItem') {
      if (item.thumbnail?.asset) return urlForImage(item.thumbnail).url();
      return '/placeholder-media.jpg';
    }
    return '/placeholder-media.jpg';
  };

  // Get current active virtual tour group if applicable
  const activeVirtualTourGroup = useMemo(() => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab?.isVirtualTour ? tab.group : null;
  }, [activeTab, tabs]);

  const renderDetailView = () => {
    if (!selectedItem) return null;

    const isYouTubeVideo = selectedItem._type === 'videoItem';
    const isNativeVideo = selectedItem._type === 'nativeVideoItem';
    const isVideo = isYouTubeVideo || isNativeVideo;
    const currentGroupItems = filteredMedia;
    const currentIndex = currentGroupItems.findIndex(m => m === selectedItem);

    const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const nextIndex = (currentIndex + 1) % currentGroupItems.length;
      setSelectedItem(currentGroupItems[nextIndex]);
    };

    const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const prevIndex = (currentIndex - 1 + currentGroupItems.length) % currentGroupItems.length;
      setSelectedItem(currentGroupItems[prevIndex]);
    };

    return (
      <div className="gallery-detail-view">
        {/* Back Button */}
        <button className="back-to-grid" onClick={() => setSelectedItem(null)}>
          <img src="/icons/arrow_left_alt.svg" alt="Back" width="20" height="20" />
          {dict?.property?.gallery_grid_view}
        </button>

        <div className="detail-main-content">
          <button className="nav-btn prev" onClick={handlePrev}>
            <img src="/icons/chevron_backward.svg" alt="Previous" width="24" height="24" />
          </button>

          <div 
            className="detail-media-wrapper"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            {/* Zoom Controls */}
            {!isVideo && (
              <div className="zoom-controls">
                <button 
                  className="zoom-btn" 
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  title="Zoom In"
                >
                  <span>+</span>
                </button>
                <button 
                  className="zoom-btn" 
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  title="Zoom Out"
                >
                  <span>−</span>
                </button>
                {zoomLevel > 1 && (
                  <button 
                    className="zoom-btn zoom-reset" 
                    onClick={handleZoomReset}
                    title="Reset Zoom"
                  >
                    <span>1:1</span>
                  </button>
                )}
              </div>
            )}

            {/* Only mount the Player Engine once layout is stable with real dimensions */}
            {isLayoutStable && isYouTubeVideo ? (
              <div className="plyr-container">
                <ReliableVideoPlayer 
                   videoId={selectedItem.url?.split('v=')[1]?.split('&')[0] || selectedItem.url?.split('/').pop() || ''} 
                   poster={getImageUrl(selectedItem)}
                />
              </div>
            ) : isLayoutStable && isNativeVideo ? (
              <div className="plyr-container">
                <NativeVideoPlayer
                  src={selectedItem.videoUrl || ''}
                  poster={selectedItem.thumbnail?.asset ? urlForImage(selectedItem.thumbnail).url() : undefined}
                />
              </div>
            ) : (
              <div 
                className="zoomable-image-container"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                }}
              >
                <Image
                  src={getImageUrl(selectedItem)}
                  alt={selectedItem.caption || property?.title}
                  fill
                  style={{ objectFit: 'contain', pointerEvents: 'none' }}
                />
              </div>
            )}
            {selectedItem.caption && (
              <div className="detail-media-caption">
                {selectedItem.caption}
              </div>
            )}
          </div>

          <button className="nav-btn next" onClick={handleNext}>
            <img src="/icons/chevron_forward.svg" alt="Next" width="24" height="24" />
          </button>
        </div>

        {/* Horizontal Thumbnails */}
        <div className={`detail-thumbnails-container ${canScrollLeft ? 'can-scroll-left' : ''} ${canScrollRight ? 'can-scroll-right' : ''}`}>
          <div className="detail-thumbnails-scroll" ref={thumbScrollRef} onScroll={checkThumbnailScroll}>
            {/* Static Back to Grid Thumbnail (Visible on Desktop via CSS) */}
            <div 
              className="detail-thumb-item back-to-grid-thumb"
              onClick={() => setSelectedItem(null)}
              title={dict?.property?.gallery_grid_view}
            >
              <div className="thumb-grid-icon">
                <img src="/icons/grid_view.svg" alt="Grid" width="24" height="24" />
              </div>
              <span className="thumb-grid-label">{dict?.property?.gallery_grid_view}</span>
            </div>

            {currentGroupItems?.map((item, idx) => (
              <div
                key={idx}
                className={`detail-thumb-item ${selectedItem === item ? 'active' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <img src={getImageUrl(item)} alt={`Thumbnail ${idx}`} />
                {(item._type === 'videoItem' || item._type === 'nativeVideoItem') && (
                  <div className="thumb-video-icon">
                    <img src="/icons/play_arrow_filled.svg" alt="Play" width="16" height="16" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="gallery-modal-container" ref={modalRef} style={{ display: 'none' }}>
      <div className="gallery-modal-overlay global-overlay" ref={overlayRef} onClick={handleOverlayClick} style={{ backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }} />

      <div className="gallery-modal-content" ref={contentRef} data-lenis-prevent="true">
        <div className="gallery-modal-header">
          <div className="gallery-tabs-wrapper">
            <div className="gallery-tabs">
              {tabs?.map((tab) => (
                <button
                  key={tab.id}
                  className={`gallery-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // User UX Fix: If currently in Full/Detail mode, snap focus to the first item of the newly chosen group
                    if (selectedItem) {
                      const nextFiltered = getFilteredMediaForTab(tab.id);
                      if (nextFiltered && nextFiltered.length > 0) {
                        setSelectedItem(nextFiltered[0]);
                      }
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <button className="gallery-modal-close" onClick={onClose}>
            <img src="/icons/close.svg" alt="Close" width="22" height="22" />
          </button>
        </div>

        <div className="gallery-modal-body" data-lenis-prevent="true">
          {activeVirtualTourGroup ? (
            // Virtual Tour View - Full iframe, no grid
            <div className="virtual-tour-view">
              <FloorfyViewer 
                floorfyUrl={activeVirtualTourGroup.floorfyUrl} 
                title={activeVirtualTourGroup.title || 'Virtual Tour'}
              />
            </div>
          ) : selectedItem ? (
            renderDetailView()
          ) : (
            <div className="gallery-grid-scrollable">
              {filteredMedia?.map((item, index) => {
                const isVideo = item._type === 'videoItem';
                const imageUrl = getImageUrl(item);
                
                // Skip items without valid image URL
                if (!imageUrl || imageUrl === '/placeholder-media.jpg') return null;
                
                return (
                  <div
                    key={index}
                    className={`gallery-grid-item ${isVideo ? 'video' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <Image
                      src={imageUrl}
                      alt={item.alt || property?.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="gallery-item-overlay">
                      {isVideo ? (
                        <div className="overlay-icon video-icon">
                          <img src="/icons/play_arrow_filled.svg" alt="Play" width="64" height="64" />
                        </div>
                      ) : (
                        <div className="overlay-icon fullscreen-icon">
                          <img src="/icons/fullscreen.svg" alt="Fullscreen" width="48" height="48" />
                        </div>
                      )}
                      {item.caption && (
                        <div className="gallery-item-caption">
                          {item.caption}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
