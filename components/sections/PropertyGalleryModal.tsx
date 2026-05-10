'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import gsap from 'gsap';
import { urlForImage } from '@/sanity/lib/image';
import { useLenis } from '@/lib/LenisContext';
import './PropertyGalleryModal.css';

interface PropertyGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  dict?: any;
}

export default function PropertyGalleryModal({ isOpen, onClose, property, dict }: PropertyGalleryModalProps) {
  const [mounted, setMounted] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    setMounted(true);
  }, []);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
        g.items?.forEach((item: any) => {
          items.push({ ...item, groupTitle: g.title });
        });
      } else {
        items.push(g);
      }
    });
    return items;
  }, [gallery, mainImage]);

  const tabs = useMemo(() => {
    const uniqueGroups = new Set<string>();
    gallery.forEach((g: any) => {
      if (g._type === 'galleryGroup' && g.title) {
        uniqueGroups.add(g.title);
      }
    });

    const hasVideos = allMedia.some(m => m._type === 'videoItem');
    
    return [
      { id: 'all', label: dict?.property?.gallery_all || 'All' },
      ...(hasVideos ? [{ id: 'video', label: dict?.property?.gallery_video || 'Video' }] : []),
      ...Array.from(uniqueGroups).map(group => ({ id: `group-${group}`, label: group }))
    ];
  }, [gallery, allMedia, dict]);

  const filteredMedia = useMemo(() => {
    if (activeTab === 'all') return allMedia;
    if (activeTab === 'video') return allMedia.filter(m => m._type === 'videoItem');
    if (activeTab.startsWith('group-')) {
      const groupName = activeTab.replace('group-', '');
      return allMedia.filter(m => m.groupTitle === groupName);
    }
    return allMedia;
  }, [activeTab, allMedia]);

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
    } else {
      document.body.style.overflow = '';
      lenis?.start();
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (modalRef.current) modalRef.current.style.display = 'none';
          setActiveTab('all');
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
    if (item._type === 'image') return urlForImage(item).url();
    if (item._type === 'videoItem') {
      if (item.thumbnail?.asset) return urlForImage(item.thumbnail).url();
      const videoId = item.url?.includes('v=') 
        ? item.url.split('v=')[1]?.split('&')[0]
        : item.url?.split('/').pop();
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/placeholder-media.jpg';
    }
    return '';
  };

  const renderFullscreen = () => {
    if (!selectedItem) return null;
    const isVideo = selectedItem._type === 'videoItem';
    
    return (
      <div className="gallery-fullscreen-overlay">
        <button className="fullscreen-close" onClick={() => setSelectedItem(null)}>
          <img src="/icons/close.svg" alt="Close" />
        </button>
        
        <div className="fullscreen-content">
          {isVideo ? (
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${selectedItem.url?.split('v=')[1]?.split('&')[0] || selectedItem.url?.split('/').pop()}?autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="image-wrapper">
              <Image
                src={getImageUrl(selectedItem)}
                alt="Fullscreen view"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
        </div>

        {/* Simple navigation within fullscreen could be added here */}
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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`gallery-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
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
          <div className="gallery-grid-scrollable">
            {filteredMedia.map((item, index) => {
              const isVideo = item._type === 'videoItem';
              return (
                <div 
                  key={index} 
                  className={`gallery-grid-item ${isVideo ? 'video' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <Image
                    src={getImageUrl(item)}
                    alt={item.alt || 'Gallery item'}
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {renderFullscreen()}
      </div>
    </div>,
    document.body
  );
}
