'use client';

import React from 'react';
import StretchArrow from './StretchArrow';

interface ButtonProps {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'pill' | 'link' | 'dark';
  icon?: string;
  className?: string;
  showArrow?: boolean;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
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
  type = 'button',
}: ButtonProps) {
  const Component = href ? 'a' : 'button';
  
  // Base classes for the main styles
  let variantClass = '';
  if (variant === 'pill') variantClass = 'btn-pill';
  else if (variant === 'dark') variantClass = 'btn-pill btn-dark';
  else variantClass = 'btn-link-styled';
  
  return (
    <Component
      id={id}
      href={href}
      onClick={onClick}
      type={Component === 'button' ? type : undefined}
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
