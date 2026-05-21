'use client';

import React from 'react';
import Image from 'next/image';
import StretchArrow from './StretchArrow';
import { useModalRegistry } from '@/components/providers/ModalRegistryContext';
import { smoothScrollToAnchor } from '@/lib/scroll';

interface ButtonProps {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'pill' | 'link' | 'dark' | 'outline';
  icon?: string;
  className?: string;
  showArrow?: boolean;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  priority?: boolean;
  form?: string;
  disabled?: boolean;
  target?: string;
  rel?: string;
}

/**
 * Global Button Component
 * Supports two main styles:
 * - 'pill': Rounded background button (like 'Speak to an Expert')
 * - 'link': Underlined text with icon/arrow (like Hero CTAs or Service links)
 *
 * Modal links: if href starts with "modal:<componentId>", the button will
 * open the registered page component modal instead of navigating.
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
  priority = false,
  form,
  disabled = false,
  target,
  rel,
}: ButtonProps) {
  const { openModal } = useModalRegistry();

  const isModalLink = href?.startsWith('modal:');
  const modalId = isModalLink ? href!.slice('modal:'.length) : null;

  const handleClick = (e: React.MouseEvent) => {
    if (modalId) {
      e.preventDefault();
      openModal(modalId);
    } else if (href && (href.startsWith('#') || href.includes('#'))) {
      smoothScrollToAnchor(e, href);
    }
    if (onClick) onClick(e);
  };

  // If it's a modal link, render as a button (no real navigation)
  const Component = href && !isModalLink ? 'a' : 'button';

  // Base classes for the main styles
  let variantClass = '';
  if (variant === 'pill') variantClass = 'btn-pill';
  else if (variant === 'dark') variantClass = 'btn-pill btn-dark';
  else if (variant === 'outline') variantClass = 'btn-pill btn-outline';
  else variantClass = 'btn-link-styled';

  return (
    <Component
      id={id}
      href={(!isModalLink && href) ? href : undefined}
      onClick={handleClick}
      type={Component === 'button' ? type : undefined}
      form={Component === 'button' ? form : undefined}
      disabled={Component === 'button' ? disabled : undefined}
      target={Component === 'a' ? target : undefined}
      rel={Component === 'a' ? rel : undefined}
      className={`${variantClass} ${className} ${disabled ? 'btn-disabled' : ''}`}
    >
      {icon && (
        <Image
          src={icon}
          alt=""
          className="btn-icon"
          width={16}
          height={16}
          unoptimized
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      <span>{label}</span>
      {showArrow && <StretchArrow className="btn-stretch-arrow" />}
    </Component>
  );
}
