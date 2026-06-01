'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';
import PropertyGalleryModal from './PropertyGalleryModal';
import './PropertyGallery.css';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useGalleryModal } from '@/components/providers/GalleryModalContext';

interface PropertyGalleryProps {
  property: any;
  dict?: any;
  offerEnabled?: boolean;
}

export default function PropertyGallery({ property, dict, offerEnabled = false }: PropertyGalleryProps) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const [imageSizes, setImageSizes] = useState<Record<string, { w: number; h: number }>>({});
  const { isOpen: isModalOpen, selectedItem: selectedGalleryItem, openModal, closeModal } = useGalleryModal();
  
  const isSold = property?.status === 'sold' || property?.status === 'reserved';
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

  // 2. Logic to pick 4 small items for the grid using group-based round-robin with virtual tour priority
  const smallItems: any[] = [];
  const pickedIds = new Set<string>();
  const clean = (str: any) => typeof str === 'string' ? str.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : str;

  const getItemId = (item: any) => {
    // Prefer _key or _id if available (common for Sanity array items and documents)
    if (item._key) return item._key;
    if (item._id) return item._id;

    // For images, use asset ID as a fallback
    if (item.asset?._id) return item.asset._id;

    // For videoItems, use URL as a unique identifier if no _key/_id
    if (item._type === 'videoItem' && item.url) return item.url;
    // For nativeVideoItems, use videoUrl as a unique identifier
    if (item._type === 'nativeVideoItem' && item.videoUrl) return item.videoUrl;
    
    // For galleryGroups that are virtual tours (treated as an item itself), use the group's _key or title
    // Make sure to clean mediaType for comparison
    if (item._type === 'galleryGroup' && clean(item.mediaType) === 'virtualTour') {
      return `vt-group-${item._key || item.title || JSON.stringify(item)}`;
    }

    // Fallback for items that don't fit above, should ideally not be hit
    console.warn('Could not generate unique ID for item:', item);
    return JSON.stringify(item); // Fallback to stringifying for uniqueness, though not ideal
  };

  // Array to hold references to groups, each with its own cursor for round-robin
  const activeGroups: { group: any; items: any[]; cursor: number }[] = [];

  // Populate activeGroups with eligible items, maintaining original group structure
  groups.forEach((g: any) => {
    if (g._type === 'galleryGroup') {
      const cleanMediaType = clean(g.mediaType);
      if (cleanMediaType === 'virtualTour') {
        // A virtual tour group is itself an item
        activeGroups.push({ group: g, items: [g], cursor: 0 });
      } else {
        // A regular media group has its own array of items
        const availableItems = (g.items || []).filter((item: any) => item.asset || item.url || item.videoUrl);
        if (availableItems.length > 0) {
          activeGroups.push({ group: g, items: availableItems, cursor: 0 });
        }
      }
    } else {
      // Individual image or video is a group of one item
      if (g.asset || g.url || g.videoUrl) {
        activeGroups.push({ group: g, items: [g], cursor: 0 });
      }
    }
  });

  // Step 1: Find and add the first Virtual Tour group (P1)
  const firstVirtualTourIndex = activeGroups.findIndex(ag => clean(ag.group.mediaType) === 'virtualTour' && ag.items.length > 0);
  
  if (firstVirtualTourIndex !== -1 && smallItems.length < 4) {
    const vtItem = activeGroups[firstVirtualTourIndex].items[0];
    smallItems.push(vtItem);
    pickedIds.add(getItemId(vtItem));
    // Remove virtual tour from activeGroups so it doesn't participate in round-robin
    activeGroups.splice(firstVirtualTourIndex, 1);
  }
  
  // Step 2: Round-robin through remaining groups/items for the remaining slots
  let groupCursor = 0;
  let attempts = 0;
  const maxAttempts = activeGroups.length * 5; // Upper bound to prevent infinite loops, generous multiplier

  while (smallItems.length < 4 && attempts < maxAttempts && activeGroups.length > 0) {
    const currentGroupIndex = groupCursor % activeGroups.length;
    const currentGroup = activeGroups[currentGroupIndex];
    
    // Find next unpicked item in this group
    let itemToPick: any = null;
    let originalCursor = currentGroup.cursor; // Store original cursor to detect if item was found
    while (currentGroup.cursor < currentGroup.items.length) {
      const potentialItem = currentGroup.items[currentGroup.cursor];
      const itemId = getItemId(potentialItem); // Recalculate itemId here
      if (!pickedIds.has(itemId)) {
        itemToPick = potentialItem;
        break;
      }
      currentGroup.cursor++; // Advance cursor to next item in this group
    }

    if (itemToPick) {
      smallItems.push(itemToPick);
      pickedIds.add(getItemId(itemToPick));
      currentGroup.cursor++; // Advance cursor for this group
    }
    
    // If no item was picked from this group, or if it was exhausted, move to next group
    if (!itemToPick || currentGroup.cursor >= currentGroup.items.length) {
      // If group is exhausted (all items picked from it or no items to begin with), remove it from activeGroups
      if (currentGroup.cursor >= currentGroup.items.length) {
        activeGroups.splice(currentGroupIndex, 1);
        // Do NOT increment groupCursor if a group was removed, as the next group shifts into its place
      } else {
        groupCursor++; // Only advance groupCursor if the group still has items to potentially pick later
      }
    } else {
      groupCursor++; // Always advance groupCursor if an item was successfully picked
    }
    attempts++;
  }


  displayItems.push(...smallItems);

  // Collect all unique potential media items for total count calculation
  const allUniquePotentialItemsMap = new Map<string, any>();
  groups.forEach((g: any) => {
    if (g._type === 'galleryGroup') {
      const cleanMediaType = clean(g.mediaType);
      if (cleanMediaType === 'virtualTour') {
        const id = getItemId(g);
        if (id && !allUniquePotentialItemsMap.has(id)) {
          allUniquePotentialItemsMap.set(id, g);
        }
      } else {
        (g.items || []).filter((item: any) => item.asset || item.url).forEach((item: any) => {
          const id = getItemId(item);
          if (id && !allUniquePotentialItemsMap.has(id)) {
            allUniquePotentialItemsMap.set(id, item);
          }
        });
      }
    } else {
      const id = getItemId(g);
      if (id && (g.asset || g.url || g.videoUrl) && !allUniquePotentialItemsMap.has(id)) {
        allUniquePotentialItemsMap.set(id, g);
      }
    }
  });

  if (displayItems.length === 0) return null;

  // Calculate remaining count for "See all" functionality
  const totalMediaCount = (mainImage ? 1 : 0) + groups.reduce((acc: number, g: any) => {
    if (g._type === 'galleryGroup') {
      // Virtual tour counts as 1 item
      const cleanMediaType = clean(g.mediaType);
      if (cleanMediaType === 'virtualTour') return acc + 1;
      return acc + (g.items?.length || 0);
    }
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
          const isVideo = item._type === 'videoItem' || item._type === 'nativeVideoItem';
          const cleanMediaType = clean(item.mediaType);
          const isVirtualTour = item._type === 'galleryGroup' && cleanMediaType === 'virtualTour';
          const isMain = index === 0;

          let imageUrl = '/placeholder-media.jpg';
          let lqip = '';

          if (isVirtualTour) {
            if (item.thumbnail?.asset) {
              imageUrl = urlForImage(item.thumbnail).url();
              lqip = item.thumbnail.asset?.metadata?.lqip;
            }
          } else if (item._type === 'image') {
            imageUrl = urlForImage(item).url();
            lqip = item.asset?.metadata?.lqip;
          } else if (item._type === 'nativeVideoItem') {
            // Native video: use thumbnail if available
            if (item.thumbnail?.asset) {
              imageUrl = urlForImage(item.thumbnail).url();
              lqip = item.thumbnail.asset?.metadata?.lqip;
            }
          } else if (item._type === 'videoItem') {
            if (item.thumbnail?.asset) {
              imageUrl = urlForImage(item.thumbnail).url();
              lqip = item.thumbnail.asset?.metadata?.lqip;
            } else {
              const videoId = item.url?.includes('v=')
                ? item.url.split('v=')[1]?.split('&')[0]
                : item.url?.split('/').pop();
              if (videoId) {
                imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
              }
            }
          }

          const isSeeAllItem = index === 4 && remainingCount > 0;

          return (
            <div
              key={item._id || item._key || index}
              className={`gallery-item item-${index} ${isMain ? 'main-item' : 'small-item'} ${isVideo ? 'video-item' : ''} ${isVirtualTour ? 'virtual-tour-item' : ''} ${isSeeAllItem ? 'has-see-all' : ''}`}
              onClick={() => {
                // Only set initial item if it's NOT the main photo AND not the "See All" item
                openModal((isMain || isSeeAllItem) ? null : item);
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
                {isVirtualTour ? (
                  <div className="overlay-icon virtual-tour-icon">
                    <img src="/icons/360-degrees.svg" alt="Virtual Tour" width="64" height="64" />
                  </div>
                ) : isVideo ? (
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
                <button className="see-all-btn-overlay btn-pill" onClick={(e) => { e.stopPropagation(); openModal(null); }}>
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
            <div className="summary-badge-row">
              {property.category?.title && (
                <span className="badge--outline">
                  {property.category.icon && <img src={property.category.icon} alt="" className="badge--outline-icon" />}
                  {property.category.title}
                </span>
              )}
              {property.propertyCode && (
                <span className="badge--outline">
                  #{property.propertyCode}
                </span>
              )}
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

            <div className="summary-title-row">
              <h1 className="summary-title">{property.title}</h1>
              <div className="summary-price">
                {property.price ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price) : dict?.properties?.price_upon_request}
              </div>
            </div>
            <p className="summary-address">{property.address}</p>
            
            <div 
              className="summary-branding-logo" 
              aria-hidden="true"
            />
          </div>



          <div className="summary-bottom-row">
            <div className="summary-meta-row">
              {(() => {
                const categoryHighlights = property.category?.highlightedMetas || [];
                const highlights: any[] = [];

                categoryHighlights.forEach((ch: any) => {
                  const matchingMeta = (property.meta || []).find((m: any) => m.metaId === ch.metaId);
                  if (matchingMeta) {
                    highlights.push({
                      ...matchingMeta,
                      hideLabelOnHighlight: ch.hideLabel === true
                    });
                  }
                });

                return highlights.map((m: any, i: number, arr: any[]) => {
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
                        {m.icon && <img src={m.icon} alt="" className="summary-meta-icon" />}
                        {value} {!m.hideLabelOnHighlight && (m.unit || m.shortLabel)}
                      </span>
                      {i < arr.length - 1 && <div className="summary-meta-dot"></div>}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="summary-cta-group">
              {isSold ? (
                <>
                  <span className={`summary-sold-badge ${property?.status === 'reserved' ? 'reserved' : ''}`}>
                    {property?.status === 'reserved' 
                      ? (dict?.property?.status_reserved || 'Reserved')
                      : (dict?.property?.status_sold || 'Sold')}
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
                  {offerEnabled && (
                    <Button 
                      label={dict?.property?.cta_make_offer || 'Make an offer'} 
                      href="modal:make-an-offer" 
                      variant="dark" 
                    />
                  )}
                  <Button 
                    label={dict?.property?.cta_request_info || 'Request info'} 
                    href="#contact" 
                    variant="outline" 
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <PropertyGalleryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        property={property}
        dict={dict}
        initialItem={selectedGalleryItem}
      />
    </section>
  );
}
