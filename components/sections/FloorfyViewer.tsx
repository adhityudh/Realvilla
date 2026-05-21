'use client';

import { useEffect, useRef, useState } from 'react';
import './FloorfyViewer.css';

interface FloorfyViewerProps {
  floorfyUrl: string;
  title?: string;
}

export default function FloorfyViewer({ floorfyUrl, title }: FloorfyViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [floorfyUrl]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!floorfyUrl) {
    return (
      <div className="floorfy-viewer-error">
        <p>No virtual tour URL provided</p>
      </div>
    );
  }

  return (
    <div className="floorfy-viewer-container">
      {isLoading && (
        <div className="floorfy-loading-overlay">
          <div className="floorfy-loading-spinner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <p>Loading virtual tour...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="floorfy-viewer-error">
          <img src="/icons/error.svg" alt="Error" width="48" height="48" />
          <p>Failed to load virtual tour</p>
          <p className="error-detail">Please check the URL or try again later</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={floorfyUrl}
        title={title || 'Virtual Tour'}
        className="floorfy-iframe"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking"
        onLoad={handleLoad}
        onError={handleError}
        style={{ opacity: isLoading || hasError ? 0 : 1 }}
      />
    </div>
  );
}