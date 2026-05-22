'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import ContactModal from './ContactModal';
import Button from './Button';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './ContactCard.css';
import './OfferModal.css';

export interface OfferFormData {
  // Step 2 — Personal Details
  fullName: string;
  idNumber: string;
  email: string;
  phone: string;
  address: string;
  // Step 3 — Offer Details
  offerPrice: string;
  additionalConditions: string;
}

export interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertySlug?: string;
  propertyTitle: string;
  propertyPrice?: number;
  depositAmount?: number;
  dict?: any;
  locale?: string;
  useRequestGuidance?: boolean;
  offerConditionsTitle?: string;
  offerConditionsIntro?: string;
  offerConditionsTerms?: string[];
  offerConditionsAccept?: string;
  offerPriceHelper?: string;
  offerConditionsHelper?: string;
}

const TOTAL_STEPS = 4;

const formatPrice = (price: string | number) => {
  const cleanPrice = typeof price === 'string' ? price.replace(/,/g, '') : price;
  const num = typeof cleanPrice === 'string' ? parseFloat(cleanPrice) : cleanPrice;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function OfferModal({
  isOpen,
  onClose,
  propertyId,
  propertySlug,
  propertyTitle,
  propertyPrice,
  depositAmount = 500,
  dict,
  locale = 'en',
  useRequestGuidance = false,
  offerConditionsTitle,
  offerConditionsIntro,
  offerConditionsTerms,
  offerConditionsAccept,
  offerPriceHelper,
  offerConditionsHelper,
}: OfferModalProps) {
  const [step, setStep] = useState(1);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<any>('ES');
  const [showScrollDown, setShowScrollDown] = useState(false);

  type FieldErrors = {
    fullName?: string;
    idNumber?: string;
    email?: string;
    phone?: string;
    address?: string;
    offerPrice?: string;
  };
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState<OfferFormData>({
    fullName: '',
    idNumber: '',
    email: '',
    phone: '',
    address: '',
    offerPrice: '',
    additionalConditions: '',
  });

  const pathname = usePathname();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Remove all non-digits
    const cleanVal = rawVal.replace(/\D/g, '');
    
    if (!cleanVal) {
      setFormData((p) => ({ ...p, offerPrice: '' }));
      return;
    }
    
    // Format the clean value with thousands separator
    const formatted = new Intl.NumberFormat('en-IE', {
      maximumFractionDigits: 0,
    }).format(parseInt(cleanVal, 10));
    
    // Determine the new cursor position
    const input = e.target;
    const oldSelectionStart = input.selectionStart || 0;
    
    // Count how many non-digits (commas) are present before the selection in the old value
    const rawBeforeCursor = rawVal.substring(0, oldSelectionStart);
    const digitsBeforeCursor = rawBeforeCursor.replace(/\D/g, '').length;
    
    setFormData((p) => ({ ...p, offerPrice: formatted }));
    
    // Defer resetting cursor position to the next paint/tick
    setTimeout(() => {
      // Find new cursor position based on matching digit count
      let newSelectionStart = 0;
      let digitCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== ',') {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          newSelectionStart = i + 1;
          break;
        }
      }
      
      // If we didn't find it or it's the end, set to end
      if (newSelectionStart === 0 || cleanVal.length === digitsBeforeCursor) {
        newSelectionStart = formatted.length;
      }
      
      input.setSelectionRange(newSelectionStart, newSelectionStart);
    }, 0);
  };

  // Auto-detect country for phone flag
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code) setDetectedCountry(data.country_code);
      })
      .catch(() => setDetectedCountry('ES'));
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setConditionsAccepted(false);
        setCheckoutError(null);
        setFieldErrors({});
        setIsSubmitting(false);
      }, 450);
    }
  }, [isOpen]);

  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Reset scroll position to top when step changes
  useEffect(() => {
    if (isOpen && modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [step, isOpen]);

  // Scroll to bottom functionality for Step 1
  useEffect(() => {
    if (!isOpen || step !== 1) {
      setShowScrollDown(false);
      return;
    }

    let scrollEl: HTMLElement | null = null;
    let observer: ResizeObserver | null = null;

    const handleScroll = () => {
      if (!scrollEl) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;

      // If content is not scrollable (or extremely close), hide the button
      if (scrollHeight <= clientHeight + 10) {
        setShowScrollDown(false);
        return;
      }

      // Check if we are near the bottom (within 80px to be safe)
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
      setShowScrollDown(!isNearBottom);
    };

    const timer = setTimeout(() => {
      scrollEl = modalBodyRef.current;
      if (scrollEl) {
        scrollEl.addEventListener('scroll', handleScroll, { passive: true });

        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(() => {
            handleScroll();
          });
          observer.observe(scrollEl);
        }

        handleScroll();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', handleScroll);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isOpen, step]);

  const handleScrollToBottom = () => {
    const scrollEl = modalBodyRef.current;
    if (scrollEl) {
      scrollEl.scrollTo({
        top: scrollEl.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const od = dict?.offer || {};

  // Resolve condition texts based on Sanity settings
  const step1Title = offerConditionsTitle;
  const step1Intro = offerConditionsIntro;
  const step1Terms: string[] = offerConditionsTerms || [];
  const step1Accept = offerConditionsAccept;

  // Resolve helper texts based on Sanity settings
  const priceHelper = offerPriceHelper;
  const conditionsHelper = offerConditionsHelper;

  // Step names for indicator labels
  const stepNames = [
    od.step1_short,
    od.step2_short,
    od.step3_short,
    od.step4_short,
  ];

  // ─────────────────────────────────────────────────────
  // VALIDATION — returns per-field error map
  // ─────────────────────────────────────────────────────
  const validateStep2 = (): FieldErrors => {
    const errs: FieldErrors = {};
    const req = od.validation_required;
    if (!formData.fullName.trim()) errs.fullName = req;
    if (!formData.idNumber.trim()) {
      errs.idNumber = req;
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.idNumber.trim())) {
      errs.idNumber = od.validation_id_format;
    }
    if (!formData.email.trim()) {
      errs.email = req;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = od.validation_email;
    }
    if (!formData.phone) errs.phone = od.validation_phone;
    if (!formData.address.trim()) errs.address = req;
    return errs;
  };

  const validateStep3 = (): FieldErrors => {
    const errs: FieldErrors = {};
    const cleanPriceStr = formData.offerPrice.replace(/,/g, '');
    const price = parseFloat(cleanPriceStr);
    if (!formData.offerPrice || isNaN(price) || price < 1)
      errs.offerPrice = od.validation_price;
    return errs;
  };

  // ─────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────
  const handleNext = () => {
    setFieldErrors({});

    if (step === 1 && !conditionsAccepted) return;

    if (step === 2) {
      const errs = validateStep2();
      if (Object.keys(errs).length > 0) { 
        setFieldErrors(errs);
        // Auto-scroll to first error field
        setTimeout(() => {
          const firstErrorField = modalBodyRef.current?.querySelector('.form-group.has-error');
          if (firstErrorField && modalBodyRef.current) {
            // Calculate position relative to modal body
            const modalBody = modalBodyRef.current;
            const fieldTop = (firstErrorField as HTMLElement).offsetTop;
            modalBody.scrollTo({ top: fieldTop - 100, behavior: 'smooth' });
            
            // Focus on the input inside
            const input = firstErrorField.querySelector('input, textarea') as HTMLElement;
            if (input) input.focus();
          }
        }, 100);
        return; 
      }
    }

    if (step === 3) {
      const errs = validateStep3();
      if (Object.keys(errs).length > 0) { 
        setFieldErrors(errs);
        // Auto-scroll to first error field
        setTimeout(() => {
          const firstErrorField = modalBodyRef.current?.querySelector('.form-group.has-error');
          if (firstErrorField && modalBodyRef.current) {
            // Calculate position relative to modal body
            const modalBody = modalBodyRef.current;
            const fieldTop = (firstErrorField as HTMLElement).offsetTop;
            modalBody.scrollTo({ top: fieldTop - 100, behavior: 'smooth' });
            
            // Focus on the input inside
            const input = firstErrorField.querySelector('input, textarea') as HTMLElement;
            if (input) input.focus();
          }
        }, 100);
        return; 
      }
    }

    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  // ─────────────────────────────────────────────────────
  // SUBMIT → STRIPE CHECKOUT
  // ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setCheckoutError(null);
    setIsSubmitting(true);

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    try {
      const response = await fetch('/api/offer/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          propertySlug,
          propertyTitle,
          propertyPrice,
          depositAmount,
          locale,
          pageUrl: currentUrl,
          personal: {
            fullName: formData.fullName,
            idNumber: formData.idNumber,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          },
          offer: {
            offerPrice: parseFloat(formData.offerPrice.replace(/,/g, '')),
            additionalConditions: formData.additionalConditions,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || od.error_unexpected);
      }

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('[OfferModal] Checkout error:', err);
      setCheckoutError(err.message || od.error_unexpected);
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // STEP INDICATOR
  // ─────────────────────────────────────────────────────
  const renderStepIndicator = () => (
    <div className="offer-step-indicator" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`${od.step_label} ${step} ${od.step_of} ${TOTAL_STEPS}`}>
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div className="offer-step-item">
            <div className={`offer-step-dot ${s === step ? 'active' : s < step ? 'completed' : ''}`}>
              {s < step ? '✓' : s}
            </div>
            <span className={`offer-step-name ${s === step ? 'active' : s < step ? 'completed' : ''}`}>
              {stepNames[s - 1]}
            </span>
          </div>
          {s < 4 && <div className={`offer-step-line ${s < step ? 'completed' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────
  // STEP 1: CONDITIONS
  // ─────────────────────────────────────────────────────
  const renderStep1 = () => {
    return (
      <div className="offer-step1-container">
        {renderStepIndicator()}
        <h3 className="form-title" style={{ textAlign: 'left' }}>
          {step1Title}
        </h3>

        <div className="offer-deposit-notice">
          <span 
            className="offer-deposit-notice-text"
            dangerouslySetInnerHTML={{ __html: step1Intro }}
          />
        </div>

        <ul className="offer-terms-list">
          {step1Terms.map((term, i) => (
            <li key={i} className="offer-term-item">
              <div className="offer-term-bullet" aria-hidden="true" />
              <span dangerouslySetInnerHTML={{ __html: term }} />
            </li>
          ))}
        </ul>

        <div className="offer-accept-wrapper">
          <label className="offer-accept-label" htmlFor="offer-accept-checkbox">
            <input
              type="checkbox"
              id="offer-accept-checkbox"
              className="offer-accept-checkbox"
              checked={conditionsAccepted}
              onChange={(e) => setConditionsAccepted(e.target.checked)}
            />
            <span className="offer-accept-text">
              {step1Accept}
            </span>
          </label>
        </div>

        <button
          type="button"
          className={`offer-scroll-down-btn ${showScrollDown ? 'visible' : ''}`}
          onClick={handleScrollToBottom}
          aria-label={od.aria_scroll_down}
        >
          <img src="/icons/south.svg" alt="" aria-hidden="true" />
        </button>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────
  // STEP 2: PERSONAL DETAILS
  // ─────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="offer-form-section">
      {renderStepIndicator()}
      <h3 className="form-title" style={{ textAlign: 'left' }}>
        {od.step2_title}
      </h3>
      <p className="form-subtitle" style={{ textAlign: 'left', marginLeft: 0, marginRight: 0, marginBottom: '2rem' }}>
        {od.step2_subtitle}
      </p>

      {/* Full Name */}
      <div className={`form-group ${fieldErrors.fullName ? 'has-error' : ''}`}>
        <label htmlFor="offer-full-name">
          {od.field_full_name} <span className="form-required">{od.required}</span>
        </label>
        <input
          type="text"
          id="offer-full-name"
          placeholder={od.field_full_name_placeholder}
          maxLength={100}
          value={formData.fullName}
          onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
        />
        {fieldErrors.fullName && <span className="form-field-error">{fieldErrors.fullName}</span>}
      </div>

      {/* ID Number */}
      <div className={`form-group ${fieldErrors.idNumber ? 'has-error' : ''}`}>
        <label htmlFor="offer-id-number">
          {od.field_id_number} <span className="form-required">{od.required}</span>
        </label>
        <input
          type="text"
          id="offer-id-number"
          placeholder={od.field_id_number_placeholder}
          autoComplete="off"
          value={formData.idNumber}
          onChange={(e) => setFormData((p) => ({ ...p, idNumber: e.target.value }))}
        />
        {fieldErrors.idNumber && <span className="form-field-error">{fieldErrors.idNumber}</span>}
      </div>

      {/* Email */}
      <div className={`form-group ${fieldErrors.email ? 'has-error' : ''}`}>
        <label htmlFor="offer-email">
          {od.field_email} <span className="form-required">{od.required}</span>
        </label>
        <input
          type="email"
          id="offer-email"
          placeholder={od.field_email_placeholder}
          value={formData.email}
          onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
        />
        {fieldErrors.email && <span className="form-field-error">{fieldErrors.email}</span>}
      </div>

      {/* Phone */}
      <div className={`form-group ${fieldErrors.phone ? 'has-error' : ''}`}>
        <label>
          {od.field_phone} <span className="form-required">{od.required}</span>
        </label>
        <PhoneInput
          placeholder={od.field_phone_placeholder}
          value={formData.phone}
          onChange={(val) => setFormData((p) => ({ ...p, phone: val || '' }))}
          defaultCountry={detectedCountry}
          numberInputProps={{ id: 'offer-phone' }}
        />
        {fieldErrors.phone && <span className="form-field-error">{fieldErrors.phone}</span>}
      </div>

      {/* Address */}
      <div className={`form-group ${fieldErrors.address ? 'has-error' : ''}`}>
        <label htmlFor="offer-address">
          {od.field_address} <span className="form-required">{od.required}</span>
        </label>
        <input
          type="text"
          id="offer-address"
          placeholder={od.field_address_placeholder}
          maxLength={150}
          value={formData.address}
          onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
        />
        {fieldErrors.address && <span className="form-field-error">{fieldErrors.address}</span>}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────
  // STEP 3: OFFER DETAILS
  // ─────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="offer-form-section">
      {renderStepIndicator()}
      <h3 className="form-title" style={{ textAlign: 'left' }}>
        {od.step3_title}
      </h3>
      <p className="form-subtitle" style={{ textAlign: 'left', marginLeft: 0, marginRight: 0, marginBottom: '2rem' }}>
        {od.step3_subtitle}
      </p>

      {/* Property Info Box */}
      {propertyPrice && (
        <div className="offer-deposit-notice" style={{ marginBottom: '2rem' }}>
          <span className="offer-deposit-notice-text">
            <div style={{ marginBottom: '0.25rem' }}>{propertyTitle}</div>
            <strong>{formatPrice(propertyPrice)}</strong>
          </span>
        </div>
      )}

      {/* Offered Price */}
      <div className={`form-group ${fieldErrors.offerPrice ? 'has-error' : ''}`}>
        <label htmlFor="offer-price">
          {od.field_offer_price} <span className="form-required">{od.required}</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          id="offer-price"
          placeholder={od.field_offer_price_placeholder}
          value={formData.offerPrice}
          onChange={handlePriceChange}
        />
        {fieldErrors.offerPrice
          ? <span className="form-field-error">{fieldErrors.offerPrice}</span>
          : priceHelper && <span className="offer-field-helper">{priceHelper}</span>
        }
      </div>

      {/* Additional Conditions */}
      <div className="form-group">
        <label htmlFor="offer-conditions">
          {od.field_conditions}{' '}
          <span className="form-optional">{od.optional}</span>
        </label>
        <textarea
          id="offer-conditions"
          rows={4}
          placeholder={od.field_conditions_placeholder}
          maxLength={500}
          value={formData.additionalConditions}
          onChange={(e) => setFormData((p) => ({ ...p, additionalConditions: e.target.value }))}
        />
        <span className="offer-field-helper">
          {conditionsHelper}
        </span>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────
  // STEP 4: REVIEW & CHECKOUT
  // ─────────────────────────────────────────────────────
  const renderStep4 = () => (
    <div>
      {renderStepIndicator()}
      <h3 className="form-title" style={{ textAlign: 'left' }}>
        {od.step4_title}
      </h3>
      <p className="form-subtitle" style={{ textAlign: 'left', marginLeft: 0, marginRight: 0, marginBottom: '2rem' }}>
        {od.step4_subtitle}
      </p>

      {/* Personal Details Block */}
      <div className="offer-review-section">
        <div className="offer-review-section-header">
          <span className="offer-review-section-title">{od.section_personal}</span>
          <button
            type="button"
            className="offer-review-edit-btn"
            onClick={() => { setFieldErrors({}); setStep(2); }}
            id="offer-review-edit-personal"
          >
            {od.btn_edit}
          </button>
        </div>
        <div className="offer-review-rows">
          <div className="offer-review-row">
            <span className="offer-review-label">{od.label_name}</span>
            <span className="offer-review-value">{formData.fullName}</span>
          </div>
          <div className="offer-review-row">
            <span className="offer-review-label">{od.label_id}</span>
            <span className="offer-review-value">{formData.idNumber}</span>
          </div>
          <div className="offer-review-row">
            <span className="offer-review-label">{od.label_email}</span>
            <span className="offer-review-value">{formData.email}</span>
          </div>
          <div className="offer-review-row">
            <span className="offer-review-label">{od.label_phone}</span>
            <span className="offer-review-value">{formData.phone}</span>
          </div>
          <div className="offer-review-row">
            <span className="offer-review-label">{od.label_address}</span>
            <span className="offer-review-value">{formData.address}</span>
          </div>
        </div>
      </div>

      {/* Offer Details Block */}
      <div className="offer-review-section">
        <div className="offer-review-section-header">
          <span className="offer-review-section-title">{od.section_offer}</span>
          <button
            type="button"
            className="offer-review-edit-btn"
            onClick={() => { setFieldErrors({}); setStep(3); }}
            id="offer-review-edit-offer"
          >
            {od.btn_edit}
          </button>
        </div>
        <div className="offer-review-rows">
          <div className="offer-review-row">
            <span className="offer-review-label">{od.label_price}</span>
            <span className="offer-review-price">{formatPrice(formData.offerPrice)}</span>
          </div>
          {formData.additionalConditions && (
            <div className="offer-review-row">
              <span className="offer-review-label">{od.label_conditions}</span>
              <span className="offer-review-value">{formData.additionalConditions}</span>
            </div>
          )}
          {!formData.additionalConditions && (
            <div className="offer-review-row">
              <span className="offer-review-label">{od.label_conditions}</span>
              <span className="offer-review-value" style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                {od.label_no_conditions}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Notice */}
      <div className="offer-deposit-notice">
        <span className="offer-deposit-notice-icon">🔒</span>
        <span className="offer-deposit-notice-text">
          <span>{od.deposit_notice_part1}</span>
          <strong>{od.deposit_notice_part2}</strong>
          <span>{od.deposit_notice_part3}</span>
          <strong>€{depositAmount}</strong>
          <span>{od.deposit_notice_part4}</span>
        </span>
      </div>

      {checkoutError && <p className="offer-error-message">✕ {checkoutError}</p>}

      {/* Back button lives in the body on step 4 */}
      <button
        type="button"
        className="offer-back-btn offer-back-inline"
        onClick={handleBack}
        id="offer-step4-back"
      >
        <img src="/icons/arrow_left_alt.svg" alt="" aria-hidden="true" className="offer-back-icon" />
        {od.btn_back}
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────
  // FOOTER — rendered per step as modal footer
  // ─────────────────────────────────────────────────────
  const renderFooter = () => {
    // Step 1 — only Next (disabled until accepted)
    if (step === 1) {
      return (
        <Button
          type="button"
          variant="dark"
          label={od.btn_next}
          className="form-submit-btn"
          onClick={handleNext}
          disabled={!conditionsAccepted}
          showArrow
          id="offer-step1-next"
        />
      );
    }

    // Step 2 — Back + Next
    if (step === 2) {
      return (
        <div className="offer-footer-dual">
          <button type="button" className="offer-back-btn" onClick={handleBack} id="offer-step2-back">
            <img src="/icons/arrow_left_alt.svg" alt="" aria-hidden="true" className="offer-back-icon" />
            {od.btn_back}
          </button>
          <Button
            type="button"
            variant="dark"
            label={od.btn_next}
            className="form-submit-btn offer-footer-next"
            onClick={handleNext}
            showArrow
            id="offer-step2-next"
          />
        </div>
      );
    }

    // Step 3 — Back + Next
    if (step === 3) {
      return (
        <div className="offer-footer-dual">
          <button type="button" className="offer-back-btn" onClick={handleBack} id="offer-step3-back">
            <img src="/icons/arrow_left_alt.svg" alt="" aria-hidden="true" className="offer-back-icon" />
            {od.btn_back}
          </button>
          <Button
            type="button"
            variant="dark"
            label={od.btn_next}
            className="form-submit-btn offer-footer-next"
            onClick={handleNext}
            showArrow
            id="offer-step3-next"
          />
        </div>
      );
    }

    // Step 4 — Submit only (back is in body)
    if (step === 4) {
      return (
        <Button
          type="button"
          variant="dark"
          label={isSubmitting
            ? od.btn_submitting
            : `${od.btn_submit}`
          }
          className="form-submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
          showArrow={!isSubmitting}
          id="offer-submit-pay"
        />
      );
    }

    return null;
  };

  return (
    <ContactModal
      isOpen={isOpen}
      onClose={onClose}
      title={od.modal_title}
      subtitle={propertyTitle}
      footer={renderFooter()}
      bodyRef={modalBodyRef}
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </ContactModal>
  );
}
