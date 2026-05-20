'use client';

import { useEffect, useRef, useState } from 'react';
import './Map.css';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
  draggable?: boolean;
  onPositionChange?: (pos: { lat: number; lng: number }) => void;
}

export default function PropertyMap({ lat, lng, title, draggable, onPositionChange }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const draggableRef = useRef(draggable);
  useEffect(() => {
    draggableRef.current = draggable;
  }, [draggable]);

  useEffect(() => {
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setDraggable(!!draggable);
    }
  }, [draggable]);

  useEffect(() => {
    if (!lat || !lng) return;

    // Check if script already attached
    if (window.google?.maps) {
      setApiLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setApiLoaded(true);
      document.head.appendChild(script);
    } else {
      // Wait if script was already added but not loaded yet
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setApiLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
    }
  }, [apiKey, lat, lng]);

  useEffect(() => {
    if (apiLoaded && mapRef.current && lat && lng) {
      const position = { lat, lng };

      // High-Contrast Branded Premium Style
      const mapStyle = [
        { "elementType": "geometry", "stylers": [{ "color": "#f4f1eb" }] }, // Darkened base for road contrast
        { "elementType": "labels.icon", "stylers": [{ "saturation": -100 }, { "lightness": -10 }] }, // Charcoal-grey POI icons for deep editorial defining
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#2c2b29" }] }, // High contrast text
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f4f1eb" }] },
        { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#c4b8a4" }] },
        { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#78746b" }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#e8e3d9" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#4a463f" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e2ddcd" }] },
        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#615d54" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] }, // Pure white roads on cream base pops perfectly
        { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dfd2ba" }] }, // Clear, definitive brand highway gold
        { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#423e37" }] },
        { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#524e47" }] },
        { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#dacfb9" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#a6aeba" }] }, // Deeper distinct water
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4a4c50" }] }
      ];

      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          styles: mapStyle,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });
        mapInstanceRef.current = map;

        // Custom Brand Logo Marker
        const markerIcon = {
          url: "/images/logo-mark-raster.png",
          scaledSize: new window.google.maps.Size(36, 36),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(18, 18),
        };

        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: title || 'Property Location',
          icon: markerIcon,
          draggable: draggable || false,
          animation: window.google.maps.Animation.DROP,
        });
        markerInstanceRef.current = marker;

        // Add dragend listener (always add, check state dynamically in callback)
        marker.addListener('dragend', () => {
          if (!draggableRef.current) return;
          const newPos = marker.getPosition();
          if (newPos && onPositionChange) {
            onPositionChange({
              lat: newPos.lat(),
              lng: newPos.lng(),
            });
          }
        });

        // Add map click listener (always add, check state dynamically in callback)
        map.addListener('click', (e: any) => {
          if (!draggableRef.current) return;
          const clickedPos = e.latLng;
          if (clickedPos && onPositionChange) {
            marker.setPosition(clickedPos);
            onPositionChange({
              lat: clickedPos.lat(),
              lng: clickedPos.lng(),
            });
          }
        });
      } else {
        // Map and marker already initialized, update marker position smoothly
        const currentMarkerPos = markerInstanceRef.current?.getPosition();
        const currentLat = currentMarkerPos?.lat();
        const currentLng = currentMarkerPos?.lng();

        const hasChanged = !currentMarkerPos || 
          Math.abs(currentLat - lat) > 0.0001 || 
          Math.abs(currentLng - lng) > 0.0001;

        if (hasChanged) {
          const newPos = { lat, lng };
          markerInstanceRef.current?.setPosition(newPos);
          mapInstanceRef.current?.panTo(newPos);
        }
      }
    }
  }, [apiLoaded, lat, lng, title, onPositionChange]);

  if (!lat || !lng) return null;

  return (
    <div className="map-outer-wrapper">
      <div
        ref={mapRef}
        className="map-inner-element"
      />
      {apiKey === '' && (
        <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6, color: '#666' }}>
          Google Maps Key is not configured in environment variables yet.
        </p>
      )}
    </div>
  );
}

declare global {
  interface Window {
    google: any;
  }
}
