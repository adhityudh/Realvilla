'use client';

import React, { useState, useEffect, useRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Button from '@/components/ui/Button';
import OfferModal from '@/components/ui/OfferModal';
import { useModalRegistry } from '@/components/providers/ModalRegistryContext';
import '@/components/ui/ContactCard.css';
import './PropertyContactCard.css';

interface PropertyContactCardProps {
  dict?: any;
  locale?: string;
  propertyId: string;
  propertySlug?: string;
  propertyTitle: string;
  propertyCode?: string;
  propertyPrice?: number;
  whatsappNumber?: string;
  presetMessage?: string;
  whatsappMessageTemplate?: string;
  showWhatsApp?: boolean;
  offerEnabled?: boolean;
  offerDepositAmount?: number;
  useRequestGuidance?: boolean;
  offerConditionsTitle?: string;
  offerConditionsIntro?: string;
  offerConditionsTerms?: string[];
  offerConditionsAccept?: string;
  offerPriceHelper?: string;
  offerConditionsHelper?: string;
  offerBankName?: string;
  offerAccountName?: string;
  offerIban?: string;
  offerBic?: string;
  isInsideModal?: boolean;
  onSubmitSuccess?: (success: boolean | null) => void;
  onSubmittingChange?: (submitting: boolean) => void;
  submitSuccess?: boolean | null;
}

export default function PropertyContactCard({
  dict,
  locale = 'en',
  propertyId,
  propertySlug,
  propertyTitle,
  propertyCode,
  propertyPrice,
  whatsappNumber,
  presetMessage,
  whatsappMessageTemplate,
  showWhatsApp = true,
  offerEnabled = false,
  offerDepositAmount = 500,
  useRequestGuidance = false,
  offerConditionsTitle,
  offerConditionsIntro,
  offerConditionsTerms,
  offerConditionsAccept,
  offerPriceHelper,
  offerConditionsHelper,
  offerBankName,
  offerAccountName,
  offerIban,
  offerBic,
  isInsideModal = false,
  onSubmitSuccess,
  onSubmittingChange,
  submitSuccess: submitSuccessProp
}: PropertyContactCardProps) {
  // Sanitize preset message to remove invisible Unicode characters
  const sanitizeText = (text: string | undefined) => {
    if (!text) return '';
    // Remove zero-width spaces, zero-width joiners, and other invisible characters
    return text.replace(/[\u200B-\u200D\uFEFF\u2060\u180E]/g, '').trim();
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<any>(undefined);
  const [message, setMessage] = useState(sanitizeText(presetMessage));
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isClickingInsideCard = useRef(false);
  const [honeypot, setHoneypot] = useState('');
  const [formStartTime, setFormStartTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (cardRef.current && cardRef.current.contains(e.target as Node)) {
        return;
      }
      const target = e.target as HTMLElement;
      if (target?.getAttribute('form') === 'contact-modal-general-form' || target?.closest('[form="contact-modal-general-form"]')) {
        return;
      }
      setIsFormExpanded(false);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  useEffect(() => {
    setMessage(sanitizeText(presetMessage));
  }, [presetMessage]);

  useEffect(() => {
    if (submitSuccessProp !== undefined && submitSuccessProp !== submitSuccess) {
      setSubmitSuccess(submitSuccessProp);
    }
  }, [submitSuccessProp, submitSuccess]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<any>('ES');

  const { registerModal, unregisterModal } = useModalRegistry();

  useEffect(() => {
    if (offerEnabled && !isInsideModal) {
      registerModal('make-an-offer', () => setIsOfferModalOpen(true));
      return () => unregisterModal('make-an-offer');
    }
  }, [offerEnabled, isInsideModal, registerModal, unregisterModal]);

  useEffect(() => {
    setFormStartTime(Date.now());
  }, []);

  // Detect IP for flag default
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code) setDetectedCountry(data.country_code);
      })
      .catch(() => setDetectedCountry('ES'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    if (onSubmittingChange) onSubmittingChange(true);

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const payload = {
      formType: 'general',
      name,
      email,
      phone: phone || '',
      message: message || `Inquiry about ${propertyTitle}`,
      fax: honeypot,
      ts: formStartTime,
      url: currentUrl
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitSuccess(true);
      if (onSubmitSuccess) onSubmitSuccess(true);

      // Clear fields
      setName('');
      setEmail('');
      setPhone(undefined);
      setMessage('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send message');
      setSubmitSuccess(false);
      if (onSubmitSuccess) onSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
      if (onSubmittingChange) onSubmittingChange(false);
    }
  };

  const generalDict = dict?.contact?.general || {};
  const successDict = dict?.contact?.success || {};
  const propertyDict = dict?.property || {};
  const contactDict = dict?.contact || {};

  const cleanPreset = whatsappMessageTemplate ? encodeURIComponent(whatsappMessageTemplate) : '';
  const waLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}${cleanPreset ? `?text=${cleanPreset}` : ''}` : '';

  if (submitSuccess) {
    return (
      <div className={`property-contact-card success-state ${isInsideModal ? 'in-modal' : ''}`}>
        <div className="property-contact-success-content">
          <div className="property-contact-success-icon-wrap">
            <img
              src="/icons/check_circle.svg"
              alt="Success"
              className="property-contact-success-icon"
            />
          </div>
          <h3 className="property-contact-form-title">{successDict.title}</h3>
          <p className="property-contact-form-subtitle">
            {successDict.subtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className={`property-contact-card ${isInsideModal ? 'in-modal' : ''}`}
      onMouseDown={() => {
        isClickingInsideCard.current = true;
      }}
      onMouseUp={() => {
        setTimeout(() => {
          isClickingInsideCard.current = false;
        }, 100);
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="property-contact-form"
        id={isInsideModal ? "contact-modal-general-form" : undefined}
        onFocus={() => setIsFormExpanded(true)}
        onBlur={(e) => {
          const currentTarget = e.currentTarget;
          setTimeout(() => {
            const activeEl = document.activeElement;
            if (cardRef.current && !cardRef.current.contains(activeEl) && !isClickingInsideCard.current) {
              if (activeEl?.getAttribute('form') === 'contact-modal-general-form') {
                return;
              }
              setIsFormExpanded(false);
            }
          }, 50);
        }}
      >
        {/* Anti-spam honeypot */}
        <div style={{ display: 'none', opacity: 0, position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <input
            type="text"
            name="fax"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {showWhatsApp && whatsappNumber && (
          <div 
            className="property-contact-whatsapp-wrapper"
            style={{
              '--btn-link-color': 'var(--text-black)',
              '--btn-link-border': 'var(--border-strong)'
            } as React.CSSProperties}
          >
            <Button
              href={waLink}
              variant="link"
              label={contactDict.whatsapp_cta}
              icon="/icons/logo-wa.svg"
              className="whatsapp-link-sm"
              target="_blank"
              rel="noopener noreferrer"
            />
            <div className="property-contact-divider">
              <span>{contactDict.whatsapp_or_form}</span>
            </div>
          </div>
        )}

        <div className="property-contact-form-group">
          <label htmlFor="prop-contact-message">{generalDict.fields?.message}</label>
          <textarea
            id="prop-contact-message"
            rows={4}
            placeholder={generalDict.fields?.message_placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
          />
        </div>

        <div className={`property-contact-expandable-section ${isFormExpanded ? 'expanded' : ''}`}>
          <div className="property-contact-expandable-inner">
            <div className="property-contact-form-group">
              <label htmlFor="prop-contact-name">
                {generalDict.fields?.name} <span className="property-contact-required">*</span>
              </label>
              <input
                type="text"
                id="prop-contact-name"
                placeholder={generalDict.fields?.name_placeholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="property-contact-form-group">
              <label htmlFor="prop-contact-email">
                {generalDict.fields?.email} <span className="property-contact-required">*</span>
              </label>
              <input
                type="email"
                id="prop-contact-email"
                placeholder={generalDict.fields?.email_placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="property-contact-form-group">
              <label htmlFor="prop-contact-phone">
                {generalDict.fields?.phone} <span className="property-contact-required">*</span>
              </label>
              <PhoneInput
                placeholder={generalDict.fields?.phone_placeholder}
                value={phone}
                onChange={setPhone}
                defaultCountry={detectedCountry}
                required
                numberInputProps={{
                  id: 'prop-contact-phone'
                }}
              />
            </div>
          </div>
        </div>

        {submitError && (
          <p className="property-contact-error-message">✕ {submitError}</p>
        )}

        {!isInsideModal && (
          <div className="property-contact-submit-wrapper">
            <Button
              type="submit"
              variant={isFormExpanded ? "dark" : "outline"}
              label={isSubmitting ? contactDict.sending : generalDict.submit}
              className="property-contact-submit-btn"
              showArrow={!isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        )}
      </form>

      {/* Make an Offer CTA — only shown when feature is enabled and inline */}
      {offerEnabled && !isInsideModal && (
        <div className="property-contact-offer-cta">
          <p className="property-contact-offer-intro">
            {propertyDict.offer_cta_intro}
          </p>
          <Button
            type="button"
            id="prop-make-an-offer-btn"
            onClick={() => setIsOfferModalOpen(true)}
            variant="dark"
            label={propertyDict.cta_make_offer}
            className="property-contact-offer-btn"
            showArrow={true}
          />
        </div>
      )}

      {/* Offer Modal Portal */}
      {offerEnabled && !isInsideModal && (
        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          propertyId={propertyId}
          propertySlug={propertySlug}
          propertyTitle={propertyTitle}
          propertyCode={propertyCode}
          propertyPrice={propertyPrice}
          depositAmount={offerDepositAmount}
          dict={dict}
          locale={locale}
          useRequestGuidance={useRequestGuidance}
          offerConditionsTitle={offerConditionsTitle}
          offerConditionsIntro={offerConditionsIntro}
          offerConditionsTerms={offerConditionsTerms}
          offerConditionsAccept={offerConditionsAccept}
          offerPriceHelper={offerPriceHelper}
          offerConditionsHelper={offerConditionsHelper}
          offerBankName={offerBankName}
          offerAccountName={offerAccountName}
          offerIban={offerIban}
          offerBic={offerBic}
        />
      )}
    </div>
  );
}
