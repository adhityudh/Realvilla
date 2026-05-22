'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import './ContactModal.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  bodyRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ContactModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  bodyRef
}: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const tl = gsap.timeline();
      tl.set(modalRef.current, { display: 'flex' });
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0);
      tl.fromTo(
        contentRef.current,
        { y: 50, opacity: 0, scale: 0.95, filter: 'blur(10px)' },
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' },
        0.1
      );
    } else {
      document.body.style.overflow = '';

      const tl = gsap.timeline({
        onComplete: () => {
          if (modalRef.current) modalRef.current.style.display = 'none';
        }
      });
      tl.to(contentRef.current, { y: 30, opacity: 0, scale: 0.98, filter: 'blur(5px)', duration: 0.4, ease: 'power2.in' });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.1);
    }
  }, [isOpen, mounted]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!mounted) return null;

  const renderModalContent = () => (
    <div className="contact-modal-container" ref={modalRef} style={{ display: 'none' }}>
      <div
        className="contact-modal-overlay global-overlay"
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{ backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }}
      />

      <div className="contact-modal-content" ref={contentRef} data-lenis-prevent="true">
        {/* Header */}
        <div className="contact-modal-header">
          <div>
            <h3 className="contact-modal-title">{title}</h3>
            {subtitle && <p className="contact-modal-subtitle">{subtitle}</p>}
          </div>
          <button className="contact-modal-close" onClick={onClose} aria-label="Close">
            <img src="/icons/close.svg" alt="Close" width="20" height="20" />
          </button>
        </div>

        {/* Scrollable Body containing the Form */}
        <div className="contact-modal-body" ref={bodyRef} data-lenis-prevent="true">
          {children}
        </div>

        {/* Sticky Footer if provided */}
        {footer && (
          <div className="contact-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(renderModalContent(), document.body);
}
