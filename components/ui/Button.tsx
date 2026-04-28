'use client';

import React from 'react';
import StretchArrow from './StretchArrow';

interface ButtonProps {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'pill' | 'link';
  icon?: string;
  className?: string;
  showArrow?: boolean;
  id?: string;
}

/**
 * Global Button Component
 * Supports two main styles:
 * - 'pill': Rounded background button (like 'Speak to an Expert')
 * - 'link': Underlined text with icon/arrow (like Hero CTAs or Service links)
 */
export default function Button({
  label,
  href,
  onClick,
  variant = 'pill',
  icon,
  className = '',
  showArrow = true,
  id,
}: ButtonProps) {
  const Component = href ? 'a' : 'button';
  
  // Base classes for the two main styles
  const variantClass = variant === 'pill' ? 'btn-pill' : 'btn-link-styled';
  
  return (
    <Component
      id={id}
      href={href}
      onClick={onClick}
      className={`${variantClass} ${className}`}
    >
      {icon && (
        <img src={icon} alt="" className="btn-icon" />
      )}
      <span>{label}</span>
      {showArrow && <StretchArrow className="btn-stretch-arrow" />}
    </Component>
  );
}
