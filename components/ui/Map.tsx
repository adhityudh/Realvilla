'use client';

import { useEffect, useRef, useState } from 'react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

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

      // Minimalistic sleek Silver design (eliminates "barren" look, feels modern & clean)
      const mapStyle = [
        { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
        { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
        { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
        { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
        { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
        { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
        { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
      ];

      const map = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 14,
        styles: mapStyle,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      // Custom elegant Gold marker
      const markerIcon = {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#C8B48A', // Site Brand Gold
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        scale: 2,
        anchor: new window.google.maps.Point(12, 22),
      };

      new window.google.maps.Marker({
        position: position,
        map: map,
        title: title || 'Property Location',
        icon: markerIcon,
        animation: window.google.maps.Animation.DROP,
      });
    }
  }, [apiLoaded, lat, lng, title]);

  if (!lat || !lng) return null;

  return (
    <div className="map-outer-wrapper">
      <div
        ref={mapRef}
        style={{ width: '100%', height: '450px', backgroundColor: '#f5f5f5', overflow: 'hidden' }}
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
