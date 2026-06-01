'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import './PropertiesMap.css';

interface MapProperty {
  _id: string;
  title: string;
  slug: string;
  price: number;
  locationMunicipality: string;
  locationPostalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  image?: any;
  gallery?: any[];
  status?: string;
  propertyCode?: string;
  category?: {
    _id: string;
    title: string;
    icon?: string;
    slug?: string;
    highlightedMetas?: { metaId: string; hideLabel?: boolean }[];
  };
  meta?: {
    metaId: string;
    shortLabel?: string;
    valueType?: string;
    unit?: string;
    icon?: string;
    numberValue?: number;
    stringValue?: string;
    booleanValue?: boolean;
    selectValue?: string;
    selectArrayValue?: string[];
    selectOptions?: { value: string; label: string; icon?: string }[];
  }[];
  address?: string;
  language?: string;
}

interface PropertiesMapProps {
  properties: MapProperty[];
  municipalityFocus?: string;
  onPropertyClick?: (slug: string) => void;
}

function createPriceIcon(price: number): any {
  const priceStr = `€${Number(price).toLocaleString()}`;
  const padding = 20;
  const fontSize = 12;
  const charWidth = 7.5;
  const textWidth = priceStr.length * charWidth;
  const totalWidth = textWidth + padding * 2;
  const height = 34;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
      <defs>
        <filter x="-20%" y="-20%" width="140%" height="140%" id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect x="0" y="0" width="${totalWidth}" height="${height - 4}" rx="${(height - 4) / 2}" ry="${(height - 4) / 2}" fill="#000" filter="url(#shadow)"/>
      <text x="${totalWidth / 2}" y="${height - 4 - 10}" text-anchor="middle" fill="#fff" font-size="${fontSize}" font-weight="700" font-family="Manrope, sans-serif">${priceStr}</text>
      <polygon points="${totalWidth / 2 - 6},${height - 4} ${totalWidth / 2 + 6},${height - 4} ${totalWidth / 2},${height}" fill="#000"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(totalWidth, height),
    anchor: new window.google.maps.Point(totalWidth / 2, height),
  };
}

function createClusterIcon(count: number): any {
  const size = count > 9 ? 48 : 40;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#000" opacity="0.85"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dy="5" fill="#fff" font-size="14" font-weight="700" font-family="Manrope, sans-serif">${count}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(size, size),
    anchor: new window.google.maps.Point(size / 2, size / 2),
  };
}

function buildCarouselImages(prop: MapProperty): { src: string; lqip?: string }[] {
  const images: { src: string; lqip?: string }[] = [];

  if (prop.image?.asset?.url) {
    images.push({
      src: prop.image.asset.url,
      lqip: prop.image.asset.metadata?.lqip,
    });
  }

  if (prop.gallery) {
    prop.gallery.forEach((g: any) => {
      if (g._type === 'galleryGroup') {
        const cleanMediaType = typeof g.mediaType === 'string'
          ? g.mediaType.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim()
          : g.mediaType;
        if (cleanMediaType === 'virtualTour') return;

        if (g.items && Array.isArray(g.items)) {
          g.items.forEach((item: any) => {
            if (item._type === 'image' && item.asset?.url) {
              images.push({
                src: item.asset.url,
                lqip: item.asset.metadata?.lqip,
              });
            }
          });
        }
      } else if (g._type === 'image' && g.asset?.url) {
        images.push({
          src: g.asset.url,
          lqip: g.asset.metadata?.lqip,
        });
      }
    });
  }

  return images;
}

export default function PropertiesMap({ properties, municipalityFocus, onPropertyClick }: PropertiesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<any[]>([]);
  const overlayProjectionRef = useRef<any>(null); // MapCanvasProjection via hidden overlay

  // Dialog state — replaces InfoWindow
  const [dialogProperty, setDialogProperty] = useState<MapProperty | null>(null);
  const [dialogPosition, setDialogPosition] = useState<{ x: number; y: number } | null>(null);
  const [dialogActiveImageIndex, setDialogActiveImageIndex] = useState(0);
  const dialogPropertyRef = useRef<MapProperty | null>(null);
  // Keep ref in sync so marker click handlers always read latest value
  dialogPropertyRef.current = dialogProperty;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (window.google?.maps) {
      setApiLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setApiLoaded(true);
      document.head.appendChild(script);
    } else {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setApiLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
    }
  }, [apiKey]);

  const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#f4f1eb" }] },
    { "elementType": "labels.icon", "stylers": [{ "saturation": -100 }, { "lightness": -10 }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#2c2b29" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f4f1eb" }] },
    { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#c4b8a4" }] },
    { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#78746b" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#e8e3d9" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#4a463f" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e2ddcd" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#615d54" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dfd2ba" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#423e37" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#524e47" }] },
    { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#dacfb9" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#a6aeba" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4a4c50" }] }
  ];

  // Initialize map once
  useEffect(() => {
    if (!apiLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.2916, lng: -16.6291 },
      zoom: 10,
      styles: mapStyle,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    // Create a hidden overlay to access MapCanvasProjection for lat/lng → pixel conversion
    const overlay = new window.google.maps.OverlayView();
    overlay.onAdd = function () {
      // Get the projection once overlay is added to map
      overlayProjectionRef.current = this.getProjection();
    };
    overlay.draw = function () {};
    overlay.onRemove = function () {};
    overlay.setMap(map);

    // Initialize MarkerClusterer
    clustererRef.current = new MarkerClusterer({
      map,
      markers: [],
      algorithmOptions: {
        maxZoom: 14,
      },
      renderer: {
        render: ({ count, position }) => {
          const marker = new window.google.maps.Marker({
            position,
            icon: createClusterIcon(count),
            zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + 1000,
          });
          return marker;
        },
      },
    });

    return () => {
      overlay.setMap(null);
    };
  }, [apiLoaded, mapStyle]);

  // Register global click handler for info window buttons (kept for backward compat)
  useEffect(() => {
    (window as any).__mapPropertyClick = (slug: string) => {
      if (onPropertyClick) onPropertyClick(slug);
    };
    return () => {
      delete (window as any).__mapPropertyClick;
    };
  }, [onPropertyClick]);

  // Close dialog on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDialogProperty(null);
        setDialogPosition(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent page pinch-to-zoom when dialog is open (mobile + desktop Safari)
  useEffect(() => {
    if (!dialogProperty) return;

    // Mobile: disable viewport scaling
    const meta = document.querySelector('meta[name=viewport]');
    const originalContent = meta?.getAttribute('content') || 'width=device-width, initial-scale=1';
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }

    // Desktop Safari: prevent trackpad pinch-to-zoom (ctrlKey + wheel) and gesture events
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('gesturestart', handleGesture);
    document.addEventListener('gesturechange', handleGesture);
    document.addEventListener('gestureend', handleGesture);

    return () => {
      if (meta) {
        meta.setAttribute('content', originalContent);
      }
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
      document.removeEventListener('gestureend', handleGesture);
    };
  }, [dialogProperty]);

  // Update dialog pixel position when map moves (using overlay projection)
  useEffect(() => {
    if (!dialogProperty || !mapInstanceRef.current || !dialogProperty.coordinates) return;

    const updatePosition = () => {
      try {
        const projection = overlayProjectionRef.current;
        if (!projection) return;
        const latLng = new window.google.maps.LatLng(
          dialogProperty.coordinates!.lat,
          dialogProperty.coordinates!.lng
        );
        const point = projection.fromLatLngToContainerPixel(latLng);
        if (point) {
          setDialogPosition({ x: point.x, y: point.y });
        }
      } catch (e) {
        // projection may not be ready yet
      }
    };

    const map = mapInstanceRef.current;
    const listeners: any[] = [];
    const events = ['drag', 'zoom_changed', 'center_changed', 'bounds_changed'];
    events.forEach((eventName) => {
      const listener = map.addListener(eventName, updatePosition);
      listeners.push(listener);
    });

    updatePosition();

    return () => {
      listeners.forEach((l) => window.google.maps.event.removeListener(l));
    };
  }, [dialogProperty]);

  // Close dialog when properties array changes (e.g. filters change)
  useEffect(() => {
    setDialogProperty(null);
    setDialogPosition(null);
  }, [properties]);

  // Clear and re-add markers when properties change
  useEffect(() => {
    if (!apiLoaded || !mapInstanceRef.current || !clustererRef.current) return;

    const map = mapInstanceRef.current;
    const clusterer = clustererRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];

    const validProperties = properties.filter(p => p.coordinates?.lat && p.coordinates?.lng);

    if (validProperties.length === 0) {
      clusterer.clearMarkers();
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();

    const newMarkers = validProperties.map((prop) => {
      if (!prop.coordinates) return null;
      const position = { lat: prop.coordinates.lat, lng: prop.coordinates.lng };
      bounds.extend(position);

      const priceIcon = createPriceIcon(prop.price);

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: prop.title,
        icon: priceIcon,
        animation: window.google.maps.Animation.DROP,
      });

      // Click handler — opens React card overlay instead of InfoWindow
      const propId = prop._id;
      const propCoords = prop.coordinates;
      marker.addListener('click', () => {
        // Read latest dialogProperty from ref to avoid stale closures
        const currentDialogId = dialogPropertyRef.current?._id;
        // Toggle off if same property is already selected
        if (currentDialogId === propId) {
          setDialogProperty(null);
          setDialogPosition(null);
          return;
        }

        setDialogProperty(prop);
        setDialogActiveImageIndex(0);

        // Calculate pixel position using overlay projection
        const projection = overlayProjectionRef.current;
        if (projection) {
          const latLng = new window.google.maps.LatLng(propCoords!.lat, propCoords!.lng);
          const point = projection.fromLatLngToContainerPixel(latLng);
          if (point) {
            setDialogPosition({ x: point.x, y: point.y });
          }
        }
      });

      return marker;
    }).filter(Boolean);

    markersRef.current = newMarkers;

    clusterer.clearMarkers();
    clusterer.addMarkers(newMarkers);

    if (validProperties.length > 1) {
      map.fitBounds(bounds);
    } else if (validProperties.length === 1) {
      map.setCenter({ lat: validProperties[0].coordinates!.lat, lng: validProperties[0].coordinates!.lng });
      map.setZoom(14);
    }
  }, [apiLoaded, properties]);

  // Municipality focus: geocode and pan
  useEffect(() => {
    if (!apiLoaded || !mapInstanceRef.current || !municipalityFocus) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: `${municipalityFocus}, Tenerife, Spain` }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        mapInstanceRef.current.panTo(loc);
        mapInstanceRef.current.setZoom(13);
      }
    });
  }, [apiLoaded, municipalityFocus]);

  // ─── Dialog rendering helpers ───

  const handleDialogClick = useCallback(() => {
    if (dialogProperty && onPropertyClick) {
      const cleanSlug = typeof dialogProperty.slug === 'string'
        ? dialogProperty.slug.replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E\u202A-\u202E\u2066-\u2069]/g, '').trim()
        : dialogProperty.slug;
      onPropertyClick(cleanSlug);
    }
  }, [dialogProperty, onPropertyClick]);

  const dialogCarouselImages = dialogProperty ? buildCarouselImages(dialogProperty) : [];
  const dialogHasMultipleImages = dialogCarouselImages.length > 1;

  const handleDialogPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogActiveImageIndex(prev => (prev - 1 + dialogCarouselImages.length) % dialogCarouselImages.length);
  }, [dialogCarouselImages.length]);

  const handleDialogNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogActiveImageIndex(prev => (prev + 1) % dialogCarouselImages.length);
  }, [dialogCarouselImages.length]);

  const renderDialog = () => {
    if (!dialogProperty || !dialogPosition) return null;

    // Calculate position — center the dialog horizontally above the marker
    const dialogWidth = 340;
    const dialogHeight = 400; // approximate
    const left = dialogPosition.x - dialogWidth / 2;
    const top = dialogPosition.y - dialogHeight - 16; // 16px above marker + arrow

    return (
      <>
        {/* Transparent backdrop for closing — on mobile it only covers the bottom half
             so that map markers above the sheet are still tappable */}
        <div className="map-dialog-backdrop map-dialog-backdrop--mobile-active" onClick={() => { setDialogProperty(null); setDialogPosition(null); }} />
        <div
          className="map-property-dialog"
          onClick={handleDialogClick}
          style={{ left: Math.max(8, left), top: Math.max(8, top) }}
        >
          {/* Close button — absolute positioned at top-right of the dialog */}
          <button
            className="map-dialog-close"
            onClick={(e) => { e.stopPropagation(); setDialogProperty(null); setDialogPosition(null); }}
            type="button"
            aria-label="Close"
          >
            <img src="/icons/close.svg" alt="Close" />
          </button>
          {/* Image area */}
          <div className="map-dialog-image-wrapper">
            {/* Badges row */}
            <div className="map-dialog-badge-row">
              {dialogProperty.category?.title && (
                <span className="map-dialog-badge">
                  {dialogProperty.category.icon && <img src={dialogProperty.category.icon} alt="" className="map-dialog-badge-icon" />}
                  {dialogProperty.category.title}
                </span>
              )}
              {dialogProperty.propertyCode && (
                <span className="map-dialog-badge">
                  #{dialogProperty.propertyCode}
                </span>
              )}
            </div>
            {(dialogProperty.status === 'sold' || dialogProperty.status === 'reserved') && (
              <span className="map-dialog-badge map-dialog-badge--tr map-dialog-badge--status">
                <span className={`map-dialog-badge-dot map-dialog-badge-dot--${dialogProperty.status}`} />
                {dialogProperty.status === 'reserved' ? 'Reserved' : 'Sold'}
              </span>
            )}

            {/* Carousel arrows */}
            {dialogHasMultipleImages && (
              <>
                <button className="map-dialog-carousel-arrow map-dialog-carousel-arrow--prev" onClick={handleDialogPrev} type="button" aria-label="Previous image">
                  <img src="/icons/chevron_backward.svg" alt="Previous" />
                </button>
                <button className="map-dialog-carousel-arrow map-dialog-carousel-arrow--next" onClick={handleDialogNext} type="button" aria-label="Next image">
                  <img src="/icons/chevron_forward.svg" alt="Next" />
                </button>
              </>
            )}

            {dialogCarouselImages.length > 0 && (
              <img
                src={dialogCarouselImages[dialogActiveImageIndex].src}
                alt={dialogProperty.title || 'Property'}
                className="map-dialog-image"
              />
            )}

            {/* Carousel dots */}
            {dialogHasMultipleImages && (
              <div className="map-dialog-carousel-dots">
                {dialogCarouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`map-dialog-carousel-dot ${idx === dialogActiveImageIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDialogActiveImageIndex(idx);
                    }}
                    type="button"
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

            {/* Info section — matches PropertyCard exactly */}
          <div className="map-dialog-info">
            <div className="map-dialog-info-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="map-dialog-address">
                  {dialogProperty.title || dialogProperty.address}
                </h3>
              </div>
              <div className="map-dialog-price">
                {dialogProperty.price
                  ? `€${Number(dialogProperty.price).toLocaleString()}`
                  : 'Price upon request'}
              </div>
            </div>

            {/* Highlighted meta details — same logic as PropertyCard */}
            <div className="map-dialog-details">
              {(() => {
                const categoryHighlights = dialogProperty.category?.highlightedMetas || [];
                const highlights: any[] = [];

                categoryHighlights.forEach((ch: any) => {
                  const matchingMeta = (dialogProperty.meta || []).find((m: any) => m.metaId === ch.metaId);
                  if (matchingMeta) {
                    highlights.push({
                      ...matchingMeta,
                      hideLabelOnHighlight: ch.hideLabel === true,
                    });
                  }
                });

                return highlights.map((m: any, i: number, arr: any[]) => {
                  const clean = (str: any) =>
                    typeof str === 'string'
                      ? str.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim()
                      : str;

                  const getDisplay = (val: string) => {
                    const cleanedVal = clean(val);
                    const match = m.selectOptions?.find((o: any) => clean(o.value) === cleanedVal);
                    return match?.label || val;
                  };

                  const sVal = m.selectValue ? getDisplay(m.selectValue) : null;
                  const aVal = Array.isArray(m.selectArrayValue)
                    ? m.selectArrayValue.map(getDisplay).join(', ')
                    : null;

                  const value =
                    m.numberValue ??
                    m.stringValue ??
                    sVal ??
                    aVal ??
                    (m.booleanValue !== undefined
                      ? m.booleanValue
                        ? 'Yes'
                        : 'No'
                      : '—');

                  return (
                    <span key={m.metaId || i} className="map-dialog-detail-item">
                      {m.icon && <img src={m.icon} alt="" className="map-dialog-detail-icon" />}
                      {value}
                      {m.valueType === 'string'
                        ? m.unit
                          ? ` ${m.unit}`
                          : ''
                        : !m.hideLabelOnHighlight && (m.unit || m.shortLabel)
                          ? ` ${m.unit || m.shortLabel}`
                          : ''}
                    </span>
                  );
                });
              })()}
            </div>
          </div>

          {/* Arrow pointer */}
          <div className="map-dialog-arrow" />
        </div>
      </>
    );
  };

  return (
    <div
      className="properties-map-wrapper"
      onClick={(e) => {
        // Close the dialog when the user taps on the map area (outside the
        // bottom-sheet card). Only needed on mobile where the backdrop is
        // limited to the lower half of the screen.
        const target = e.target as HTMLElement;
        if (
          dialogProperty &&
          !target.closest('.map-property-dialog') &&
          !target.closest('.map-dialog-backdrop')
        ) {
          setDialogProperty(null);
          setDialogPosition(null);
        }
      }}
    >
      <div ref={mapRef} className="properties-map-inner" />
      {apiKey === '' && (
        <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6, color: '#666' }}>
          Google Maps Key is not configured in environment variables yet.
        </p>
      )}
      {renderDialog()}
    </div>
  );
}

declare global {
  interface Window {
    google: any;
    __mapPropertyClick?: (slug: string) => void;
  }
}