'use client';

import { useState, useRef } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
}

export default function Tooltip({ content, position = 'top', children, className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  
  const showTooltip = () => setOpen(true);
  const hideTooltip = () => setOpen(false);
  
  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(prev => !prev);
  };

  return (
    <span 
      className={`rv-tooltip-wrap ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      ref={triggerRef}
    >
      {children ? (
        <span className="rv-tooltip-trigger-custom" onClick={toggleTooltip}>
          {children}
        </span>
      ) : (
        <button 
          type="button"
          className="rv-tooltip-info-icon" 
          onClick={toggleTooltip}
          aria-label="More information"
        >
          <img src="/icons/info.svg" alt="Info" />
        </button>
      )}

      <span className={`rv-tooltip-bubble rv-tooltip-bubble--${position} ${open ? 'is-open' : ''}`}>
        <span className="rv-tooltip-inner">
          {content}
        </span>
      </span>
    </span>
  );
}
