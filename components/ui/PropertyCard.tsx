'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';
import { useParams } from 'next/navigation';
import './PropertyCard.css';

export interface PropertyCardProps {
  prop: any;
  variant?: 'default' | 'seamless';
}

export default function PropertyCard({ prop, variant = 'default', dict }: { prop: any, variant?: 'default' | 'seamless', dict?: any }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImgLoading, setIsImgLoading] = useState(false);

  // Build carousel images array: primary image + all images from gallery groups (excluding virtual tours)
  const carouselImages = (() => {
    const images: { src: string; lqip?: string }[] = [];

    // 1. Primary image
    if (prop.image?.asset) {
      images.push({
        src: urlForImage(prop.image).width(800).url(),
        lqip: prop.image.asset?.metadata?.lqip,
      });
    }

    // 2. Images from gallery groups (only image type, not virtual tours)
    if (prop.gallery) {
      prop.gallery.forEach((g: any) => {
        if (g._type === 'galleryGroup') {
          // Skip virtual tours
          const cleanMediaType = typeof g.mediaType === 'string'
            ? g.mediaType.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim()
            : g.mediaType;
          if (cleanMediaType === 'virtualTour') return;

          if (g.items && Array.isArray(g.items)) {
            g.items.forEach((item: any) => {
              if (item._type === 'image' && item.asset) {
                images.push({
                  src: urlForImage(item).width(800).url(),
                  lqip: item.asset?.metadata?.lqip,
                });
              }
            });
          }
        } else if (g._type === 'image' && g.asset) {
          images.push({
            src: urlForImage(g).width(800).url(),
            lqip: g.asset?.metadata?.lqip,
          });
        }
      });
    }

    return images;
  })();

  const hasMultipleImages = carouselImages.length > 1;

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImgLoading(true);
    setActiveImageIndex(prev => (prev + 1) % carouselImages.length);
  }, [carouselImages.length]);

  const goToPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImgLoading(true);
    setActiveImageIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length);
  }, [carouselImages.length]);

  // Sanitize slug to remove Sanity Stega invisible characters that break URLs
  const cleanSlug = typeof prop.slug === 'string' 
    ? prop.slug.replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E\u202A-\u202E\u2066-\u2069]/g, '').trim()
    : prop.slug;

  const params = useParams();
  const activeLocale = prop.language || (params?.locale as string) || 'en';
  const routePrefix = (activeLocale === 'es') ? 'propiedades' : 'properties';

  if (!carouselImages.length) return null;

  const currentImage = carouselImages[activeImageIndex];

  return (
    <Link href={`/${activeLocale}/${routePrefix}/${cleanSlug}`} className={`property-card ${variant === 'seamless' ? 'property-card-seamless' : ''}`}>
      <div className="property-image-wrapper">
        <div className="badge-row">
          {prop.category?.title && (
            <span className="badge">
              {prop.category.icon && <img src={prop.category.icon} alt="" className="badge-icon" />}
              {prop.category.title}
            </span>
          )}
          {prop.propertyCode && (
            <span className="badge">
              #{prop.propertyCode}
            </span>
          )}
        </div>
        {(prop.status === 'sold' || prop.status === 'reserved') && (
          <span className="badge badge--tr badge--status">
            <span className={`badge-dot badge-dot--${prop.status}`} />
            {prop.status === 'reserved' 
              ? (dict?.property?.status_reserved || 'Reserved')
              : (dict?.property?.status_sold || 'Sold')}
          </span>
        )}

        {/* Carousel navigation arrows */}
        {hasMultipleImages && (
          <>
            <button className="carousel-arrow carousel-arrow--prev" onClick={goToPrev} type="button" aria-label="Previous image">
              <img src="/icons/chevron_backward.svg" alt="Previous" />
            </button>
            <button className="carousel-arrow carousel-arrow--next" onClick={goToNext} type="button" aria-label="Next image">
              <img src="/icons/chevron_forward.svg" alt="Next" />
            </button>
          </>
        )}

        <Image 
          src={currentImage.src}
          alt={prop.address || 'Property'} 
          className="property-image primary img-reveal" 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder={currentImage.lqip ? "blur" : "empty"}
          blurDataURL={currentImage.lqip}
          style={{ objectFit: 'cover' }}
          onLoad={(e) => {
            e.currentTarget.classList.add('loaded');
            setIsImgLoading(false);
          }}
        />

        {/* Carousel loading shimmer */}
        {isImgLoading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'card-shimmer 1.2s infinite',
          }} />
        )}

        {/* Carousel dots */}
        {hasMultipleImages && (
          <div className="carousel-dots">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot ${idx === activeImageIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                type="button"
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="property-info">
        <div className="property-info-header">
          <div className="property-info-left">
            <h3 className="property-address">
              {prop.title || prop.address}
            </h3>
            {prop.locationMunicipality && (
              <p className="property-address-line">
                {[prop.locationMunicipality, prop.locationPostalCode].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <div className="property-price">
            {prop.price ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(prop.price) : dict?.properties?.price_upon_request}
          </div>
        </div>
        <div className="property-details">
          {(() => {
            const categoryHighlights = prop.category?.highlightedMetas || [];
            const highlights: any[] = [];

            categoryHighlights.forEach((ch: any) => {
              const matchingMeta = (prop.meta || []).find((m: any) => m.metaId === ch.metaId);
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
                  <span className="detail-item">
                    {m.icon && <img src={m.icon} alt="" className="detail-icon" />}
                    {value}
                    {m.valueType === 'string'
                      ? (m.unit ? ` ${m.unit}` : '')
                      : (!m.hideLabelOnHighlight && (m.unit || m.shortLabel) ? ` ${m.unit || m.shortLabel}` : '')
                    }
                  </span>
                  {i < arr.length - 1 && <div className="detail-dot"></div>}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </Link>
  );
}