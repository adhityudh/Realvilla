'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';
import PropertyGalleryModal from './PropertyGalleryModal';
import './PropertyGallery.css';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';

interface PropertyGalleryProps {
  property: any;
  dict?: any;
}

export default function PropertyGallery({ property, dict }: PropertyGalleryProps) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const [imageSizes, setImageSizes] = useState<Record<string, { w: number; h: number }>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<any>(null);
  
  const isSold = property?.status === 'sold';
  const archiveLink = `/${locale}/${locale === 'es' ? 'propiedades' : 'properties'}`;

  useEffect(() => {
    document.body.classList.remove('header-light-mode');
    document.body.classList.remove('header-black-bg');
    document.body.classList.add('header-dark-mode');
    return () => {
      document.body.classList.remove('header-dark-mode');
    };
  }, []);

  if (!property) return null;

  const mainImage = property.image;
  const groups = property.gallery || [];

  // 1. Initial items array - displayItems[0] is always the Primary Image
  const displayItems: any[] = [];
  if (mainImage) {
    displayItems.push({ _type: 'image', asset: mainImage.asset, alt: property.title, isMain: true });
  }

  // 2. Logic to pick 4 small items from groups with distributed selection and video priority
  const smallItems: any[] = [];
  const pickedIds = new Set<string>();
  const getItemId = (item: any) => item._id || item._key || item.asset?._id;

  // Map each gallery entry into an array of items. 
  // If it's a group, we use its items. If it's an individual item, we treat it as a group of one.
  const groupsMedia = groups.map((g: any) => {
    if (g._type === 'galleryGroup') {
      return (g.items || []).filter((item: any) => item.asset || item.url);
    }
    // Individual image or videoItem
    return [g].filter((item: any) => item.asset || item.url);
  });

  if (groupsMedia.length > 0) {
    // A. Rule: At least one video if any video exists in all groups
    for (const groupItems of groupsMedia) {
      const video = groupItems.find((item: any) => item._type === 'videoItem');
      if (video) {
        smallItems.push(video);
        pickedIds.add(getItemId(video));
        break;
      }
    }

    // B. Rule: Distributed selection (Round-Robin) to fill up to 4 small items
    let groupIdx = 0;
    let itemsFoundInLastCycle = true;
    while (smallItems.length < 4 && itemsFoundInLastCycle) {
      itemsFoundInLastCycle = false;
      const startIdx = groupIdx;

      for (let i = 0; i < groupsMedia.length; i++) {
        const currentIdx = (startIdx + i) % groupsMedia.length;
        const currentGroup = groupsMedia[currentIdx];
        const nextItem = currentGroup.find((item: any) => !pickedIds.has(getItemId(item)));

        if (nextItem) {
          smallItems.push(nextItem);
          pickedIds.add(getItemId(nextItem));
          itemsFoundInLastCycle = true;
          groupIdx = (currentIdx + 1) % groupsMedia.length;
          if (smallItems.length === 4) break;
        }
      }
    }
  }

  displayItems.push(...smallItems);

  if (displayItems.length === 0) return null;

  // Calculate remaining count for "See all" functionality
  const totalMediaCount = (mainImage ? 1 : 0) + groups.reduce((acc: number, g: any) => {
    if (g._type === 'galleryGroup') return acc + (g.items?.length || 0);
    return acc + 1;
  }, 0);
  const remainingCount = totalMediaCount - displayItems.length;

  return (
    <section className="property-gallery-section">
      <div className="property-breadcrumb-wrapper">
        <nav className="property-breadcrumb">
          <Link href={`/${locale}`} className="breadcrumb-item breadcrumb-home-link">
            <img src="/images/logo-mark-raster.png" alt="Home" width="20" height="20" className="breadcrumb-logo" />
          </Link>

          <img src="/icons/chevron_forward.svg" className="breadcrumb-separator" alt="separator" width="16" height="16" />

          <Link href={`/${locale}/${locale === 'es' ? 'propiedades' : 'properties'}`} className="breadcrumb-item">
            <span>{dict?.property?.properties_breadcrumb}</span>
          </Link>

          <img src="/icons/chevron_forward.svg" className="breadcrumb-separator" alt="separator" width="16" height="16" />

          <div className="breadcrumb-item current">
            {property.title}
          </div>
        </nav>
      </div>

      <div className="property-gallery-grid">
        {displayItems.map((item, index) => {
          const isVideo = item._type === 'videoItem';
          const isMain = index === 0;

          let imageUrl = '/placeholder-media.jpg'; // Set safe fallback to avoid console warning on empty src
          let lqip = '';

          if (item._type === 'image') {
            imageUrl = urlForImage(item).url();
            lqip = item.asset?.metadata?.lqip;
          } else if (isVideo) {
            // Use custom thumbnail if available, otherwise a placeholder or extract from YT
            if (item.thumbnail?.asset) {
              imageUrl = urlForImage(item.thumbnail).url();
              lqip = item.thumbnail.asset?.metadata?.lqip;
            } else {
              // Extract YouTube thumbnail
              const videoId = item.url?.includes('v=')
                ? item.url.split('v=')[1]?.split('&')[0]
                : item.url?.split('/').pop();

              if (videoId) {
                imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
              } else {
                // Fallback to a placeholder if extraction fails
                imageUrl = '/placeholder-media.jpg';
              }
            }
          }

          const isSeeAllItem = index === 4 && remainingCount > 0;

          return (
            <div
              key={item._id || item._key || index}
              className={`gallery-item item-${index} ${isMain ? 'main-item' : 'small-item'} ${isVideo ? 'video-item' : ''} ${isSeeAllItem ? 'has-see-all' : ''}`}
              onClick={() => {
                // Only set initial item if it's NOT the main photo AND not the "See All" item
                setSelectedGalleryItem((isMain || isSeeAllItem) ? null : item);
                setIsModalOpen(true);
              }}
            >
              <Image
                src={imageUrl}
                alt={item.alt || property.title}
                fill
                sizes={isMain ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                className="img-reveal"
                placeholder={lqip ? "blur" : "empty"}
                blurDataURL={lqip}
                style={{ objectFit: 'cover' }}
                onLoad={(e) => e.currentTarget.classList.add('loaded')}
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

              {/* Show "See all photos" button on the first image (main) like in some designs, 
                  or on the last image if there are more photos */}

              {index === 4 && remainingCount > 0 && (
                <button className="see-all-btn-overlay btn-pill" onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}>
                  <div className="btn-content-desktop">
                    <svg width="18" height="18" viewBox="0 -960 960 960" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M127.69-220q-30.3 0-51.3-21-21-21-21-51.31v-375.38q0-30.31 21-51.31 21-21 51.3-21h375.39q30.3 0 51.3 21 21 21 21 51.31v375.38q0 30.31-21 51.31-21 21-51.3 21H127.69Zm0-60h375.39q4.61 0 8.46-3.85 3.84-3.84 3.84-8.46v-375.38q0-4.62-3.84-8.46-3.85-3.85-8.46-3.85H127.69q-4.61 0-8.46 3.85-3.85 3.84-3.85 8.46v375.38q0 4.62 3.85 8.46 3.85 3.85 8.46 3.85Zm36.93-84.62h301.53l-94.77-127.69-76 100-56-74-74.76 101.69ZM680-220v-520h60v520h-60Zm164.62 0v-520h59.99v520h-59.99Zm-729.24-60v-400 400Z" />
                    </svg>
                    <span>{dict?.property?.see_all_photos}</span>
                  </div>
                  <div className="btn-content-mobile">
                    +{remainingCount}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="property-gallery-summary">
        <div className="summary-details-col">
          <div className="summary-info-group">
            <div className="summary-price-row">
              <div className="summary-price">
                {property.price ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price) : dict?.properties?.price_upon_request}
              </div>
              <button 
                className="summary-share-btn" 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: property.title,
                      text: `Check out this property: ${property.title}`,
                      url: window.location.href,
                    }).catch(() => { /* fail silently */ });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
              >
                <img src="/icons/share.svg" alt="Share" />
                <span>{dict?.property?.cta_share || 'Share'}</span>
              </button>
            </div>

            <h1 className="summary-title">{property.title}</h1>
            <p className="summary-address">{property.address}</p>
            
            <div 
              className="summary-branding-logo" 
              aria-hidden="true"
            />
          </div>



          <div className="summary-bottom-row">
            <div className="summary-meta-row">
              {property.meta
                ?.filter((m: any) => m.isHighlighted)
                .sort((a: any, b: any) => (a.highlightOrder || 0) - (b.highlightOrder || 0))
                .map((m: any, i: number, arr: any[]) => {
                  // Helper to strip invisible Stega characters that break simple equality matching
                  const clean = (str: any) => typeof str === 'string' ? str.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : str;

                  const getDisplay = (val: string) => {
                    const cleanedVal = clean(val);
                    const match = m.selectOptions?.find((o: any) => clean(o.value) === cleanedVal);
                    return match?.label || val;
                  };

                  const sVal = m.selectValue ? getDisplay(m.selectValue) : null;
                  const aVal = Array.isArray(m.selectArrayValue) ? m.selectArrayValue.map(getDisplay).join(', ') : null;

                  const value = m.numberValue ?? m.stringValue ?? sVal ?? aVal ?? (m.booleanValue !== undefined ? (m.booleanValue ? dict?.common?.yes || 'Yes' : dict?.common?.no || 'No') : '—');
                  return (
                    <div key={m.metaId || i} style={{ display: 'contents' }}>
                      <span className="summary-meta-item">
                        {value} {!m.hideLabelOnHighlight && (m.unit || m.shortLabel)}
                      </span>
                      {i < arr.length - 1 && <div className="summary-meta-dot"></div>}
                    </div>
                  );
                })}
            </div>

            <div className="summary-cta-group">
              {isSold ? (
                <>
                  <span className="summary-sold-badge">
                    {dict?.property?.status_sold || 'Sold'}
                  </span>
                  <Button 
                    label={dict?.property?.cta_find_similar || 'Find Similar Properties'} 
                    href={archiveLink} 
                    variant="dark" 
                    className="find-similar-btn"
                  />
                </>
              ) : (
                <>
                  <Button 
                    label={dict?.property?.cta_make_offer || 'Make an offer'} 
                    href="#" 
                    variant="dark" 
                  />
                  <Button 
                    label={dict?.property?.cta_request_visit || 'Request a visit'} 
                    href="#" 
                    variant="pill" 
                    className="service-cta" 
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <PropertyGalleryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGalleryItem(null);
        }}
        property={property}
        dict={dict}
        initialItem={selectedGalleryItem}
      />
    </section>
  );
}
