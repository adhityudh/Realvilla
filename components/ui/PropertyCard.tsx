'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { urlForImage } from '@/sanity/lib/image';

export interface PropertyCardProps {
  prop: any;
  variant?: 'default' | 'seamless';
}

export default function PropertyCard({ prop, variant = 'default' }: PropertyCardProps) {
  const secondaryImgRef = useRef<HTMLImageElement>(null);
  const hoverTl = useRef<gsap.core.Timeline | null>(null);

  const primarySrc = prop.image?.asset ? urlForImage(prop.image).url() : null;
  const secondarySrc = prop.secondaryImage?.asset ? urlForImage(prop.secondaryImage).url() : null;

  if (!primarySrc) return null;

  const handleMouseEnter = () => {
    if (!secondaryImgRef.current) return;
    if (hoverTl.current) hoverTl.current.kill();
    const target = secondaryImgRef.current;
    const obj = { p: 0 };
    hoverTl.current = gsap.timeline();
    hoverTl.current.to(obj, {
      p: 1,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        const numStrips = 12;
        const stagger = 0.3;
        const stops = [];
        for (let j = 0; j < numStrips; j++) {
          const stripStart = ((numStrips - 1 - j) / numStrips) * (1 - stagger);
          const stripEnd = stripStart + stagger;
          let sP = (obj.p - stripStart) / (stripEnd - stripStart);
          sP = Math.max(0, Math.min(1, sP));
          const y1 = (j / numStrips) * 100;
          const y2 = ((j + 1) / numStrips) * 100;
          const cut = y2 - (y2 - y1) * sP;
          stops.push(`transparent ${y1}%`);
          stops.push(`transparent ${cut}%`);
          stops.push(`#000 ${cut}%`);
          stops.push(`#000 ${y2}%`);
        }
        const mask = `linear-gradient(to bottom, ${stops.join(', ')})`;
        (target.style as any).WebkitMaskImage = mask;
        target.style.maskImage = mask;
      }
    });
  };

  const handleMouseLeave = () => {
    if (!secondaryImgRef.current) return;
    if (hoverTl.current) hoverTl.current.kill();
    const target = secondaryImgRef.current;
    const obj = { p: 1 };
    hoverTl.current = gsap.timeline();
    hoverTl.current.to(obj, {
      p: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const numStrips = 12;
        const stagger = 0.3;
        const stops = [];
        for (let j = 0; j < numStrips; j++) {
          const stripStart = ((numStrips - 1 - j) / numStrips) * (1 - stagger);
          const stripEnd = stripStart + stagger;
          let sP = (obj.p - stripStart) / (stripEnd - stripStart);
          sP = Math.max(0, Math.min(1, sP));
          const y1 = (j / numStrips) * 100;
          const y2 = ((j + 1) / numStrips) * 100;
          const cut = y2 - (y2 - y1) * sP;
          stops.push(`transparent ${y1}%`);
          stops.push(`transparent ${cut}%`);
          stops.push(`#000 ${cut}%`);
          stops.push(`#000 ${y2}%`);
        }
        const mask = `linear-gradient(to bottom, ${stops.join(', ')})`;
        (target.style as any).WebkitMaskImage = mask;
        target.style.maskImage = mask;
      }
    });
  };

  return (
    <div className={`property-card ${variant === 'seamless' ? 'property-card-seamless' : ''}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="property-image-wrapper">
        <Image 
          src={primarySrc} 
          alt={prop.address || 'Property'} 
          className="property-image primary img-reveal" 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder={prop.image?.asset?.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={prop.image?.asset?.metadata?.lqip}
          style={{ objectFit: 'cover' }}
          onLoad={(e) => e.currentTarget.classList.add('loaded')}
        />
        {secondarySrc && (
          <Image
            ref={secondaryImgRef}
            src={secondarySrc}
            alt={prop.address || 'Property'}
            className="property-image secondary"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder={prop.secondaryImage?.asset?.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={prop.secondaryImage?.asset?.metadata?.lqip}
            style={{ 
              objectFit: 'cover',
              WebkitMaskImage: 'linear-gradient(transparent, transparent)', 
              maskImage: 'linear-gradient(transparent, transparent)' 
            }}
          />
        )}
      </div>
      <div className="property-info">
        <div className="property-price">
          {prop.price ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(prop.price) : 'Price upon request'}
        </div>
        <h3 className="property-address">
          {prop.title || prop.address}
        </h3>
        <div className="property-details">
          {prop.meta
            ?.filter((m: any) => m.isHighlighted)
            .sort((a: any, b: any) => (a.highlightOrder || 0) - (b.highlightOrder || 0))
            .slice(0, 3)
            .map((m: any, i: number, arr: any[]) => {
              const value = m.numberValue ?? m.stringValue ?? (m.booleanValue ? 'Yes' : 'No');
              return (
                <div key={m.metaId || i} style={{ display: 'contents' }}>
                  <span className="detail-item">
                    {value} {m.unit || m.shortLabel}
                  </span>
                  {i < arr.length - 1 && <div className="detail-dot"></div>}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
