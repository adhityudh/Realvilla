'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import ContactModal from './ContactModal';
import { client } from '@/sanity/lib/client';
import { getMunicipalities } from '@/lib/municipalities';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './ContactCard.css';

export type ContactFormStep = 'intent' | 'general' | 'sell';

export interface ContactCardProps {
  initialStep?: ContactFormStep;
  allowBack?: boolean;
  nextStepAsModal?: boolean;
  dict?: any;
  
  intentTitle?: string;
  intentSubtitle?: string;
  
  generalTitle?: string;
  generalSubtitle?: string;
  
  sellTitle?: string;
  sellSubtitle?: string;
  
  className?: string;
  onStepChange?: (step: ContactFormStep) => void;
  isInsideExternalModal?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  onSubmitSuccessChange?: (success: boolean | null) => void;
}

const intentKeys = ['general', 'sell', 'buy', 'invest'] as const;

export default function ContactCard({
  initialStep = 'intent',
  allowBack = true,
  nextStepAsModal = false,
  dict,
  intentTitle,
  intentSubtitle,
  generalTitle,
  generalSubtitle,
  sellTitle,
  sellSubtitle,
  className = '',
  onStepChange,
  isInsideExternalModal = false,
  onSubmittingChange,
  onSubmitSuccessChange
}: ContactCardProps) {
  // Added for displaying next step in sliding sidebar drawer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ContactFormStep | null>(null);
  // Guarantee we always have a valid enum string, blocking null/undefined/object/unicode-ghost edge-cases strictly
  const getValidStep = (val: any): ContactFormStep => {
    // Aggressively strip ALL non-word characters (like zero-width spaces, control chars, etc.)
    const clean = val ? String(val).replace(/[^\w]/g, '').trim() : '';
    if (clean === 'general' || clean === 'sell') return clean as ContactFormStep;
    return 'intent';
  };

  const [step, setStep] = useState<ContactFormStep>(getValidStep(initialStep));
  const router = useRouter();
  
  // Locales tracking
  const pathname = usePathname();
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  // Seamlessly update form step dynamically if prop shifts on subsequent component mounts
  useEffect(() => {
    setStep(getValidStep(initialStep));
  }, [initialStep]);

  // DYNAMIC DATA SOURCES & FORM STATES
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [detectedCountry, setDetectedCountry] = useState<any>('ES'); // Fallback to Spain

  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [generalPhone, setGeneralPhone] = useState<any>();
  const [sellPhone, setSellPhone] = useState<any>();

  // Input binding states
  const [generalName, setGeneralName] = useState('');
  const [generalEmail, setGeneralEmail] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');

  const [sellName, setSellName] = useState('');
  const [sellEmail, setSellEmail] = useState('');

  // Form Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Adaptive height locking for anti-jumping transitions
  const cardRef = useRef<HTMLDivElement>(null);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  // Forward states up if inside external containers
  useEffect(() => {
    if (onSubmittingChange) {
      onSubmittingChange(isSubmitting);
    }
  }, [isSubmitting, onSubmittingChange]);

  useEffect(() => {
    if (onSubmitSuccessChange) {
      onSubmitSuccessChange(submitSuccess);
    }
  }, [submitSuccess, onSubmitSuccessChange]);

  // Anti-spam stealth trackers
  const [formStartTime] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e: React.FormEvent, formType: 'general' | 'sell') => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    // Validate custom dynamic select fields which lack native HTML5 form validation triggers
    if (formType === 'sell' && (!selectedMunicipality || !selectedPropertyType)) {
      setSubmitError(
        dict?.filter?.no_results ? "Por favor, complete todos los campos obligatorios." : "Please fill out all required fields."
      );
      setIsSubmitting(false);
      return;
    }

    const payload = formType === 'sell' ? {
      formType: 'sell',
      name: sellName,
      phone: sellPhone,
      email: sellEmail,
      municipality: selectedMunicipality,
      propertyType: selectedPropertyType,
      fax: honeypot, // Named neutrally to bait automated autofill bots
      ts: formStartTime,
      url: currentUrl
    } : {
      formType: 'general',
      name: generalName,
      email: generalEmail,
      phone: generalPhone,
      message: generalMessage,
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

      // Freeze and lock the exact rendered height of the form container
      if (cardRef.current) {
        setLockedHeight(cardRef.current.clientHeight);
      }
      setSubmitSuccess(true);
      
      // Clear fields upon successful submission
      if (formType === 'sell') {
        setSellName('');
        setSellPhone('');
        setSellEmail('');
        setSelectedMunicipality('');
        setSelectedPropertyType('');
      } else {
        setGeneralName('');
        setGeneralEmail('');
        setGeneralPhone('');
        setGeneralMessage('');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Dropdown UI Controls
  const [munDropdownOpen, setMunDropdownOpen] = useState(false);
  const [munSearch, setMunSearch] = useState('');
  const munDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (munDropdownRef.current && !munDropdownRef.current.contains(event.target as Node)) {
        setMunDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 1. Auto-Detect Country IP (Third-Party API)
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          setDetectedCountry(data.country_code);
        }
      })
      .catch(() => {
        // Fallback to navigator locale
        try {
          const language = navigator.language || 'ES';
          const country = language.split('-')[1]?.toUpperCase();
          if (country) setDetectedCountry(country);
        } catch (e) {}
      });
  }, []);

  // 2. Load dynamic datasets from APIs & Sanity
  useEffect(() => {
    let isMounted = true;

    async function loadSources() {
      try {
        // A. Fetch dynamic municipalities list
        const munList = await getMunicipalities();
        if (isMounted) setMunicipalities(munList);

        // B. Fetch dynamic property categories from Sanity
        const query = `*[_type == "propertyCategory"] | order(order asc) {
          _id,
          "label": coalesce(title[$language], title.en),
          "icon": icon.asset->url
        }`;
        const types = await client.fetch(query, { language: locale });
        if (isMounted) setPropertyTypes(types || []);
      } catch (err) {
        console.error('Error loading dynamic contact form datasets:', err);
      }
    }

    loadSources();
    return () => { isMounted = false; };
  }, [locale]);

  // Renderers helpers
  const filteredMunicipalities = useMemo(() => {
    return municipalities.filter(m => 
      m.toLowerCase().includes(munSearch.toLowerCase())
    );
  }, [municipalities, munSearch]);

  const renderMunicipalitySelector = (isInsideModal: boolean) => (
    <div className="form-group form-custom-select-group" ref={munDropdownRef}>
      <label>{sellDict.fields.municipality} <span className="form-required">{sellDict.fields.required || "*"}</span></label>
      <div 
        className={`custom-select-trigger ${selectedMunicipality ? 'has-value' : ''} ${munDropdownOpen ? 'active' : ''}`}
        onClick={() => setMunDropdownOpen(!munDropdownOpen)}
      >
        <span>{selectedMunicipality || sellDict.fields.municipality_placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" className="select-arrow-icon">
          <path fill="currentColor" d="M6 8.825L0.35 3.175l0.7-0.7L6 7.425l4.95-4.95 0.7 0.7z"/>
        </svg>
      </div>
      
      <input 
        type="hidden" 
        id={isInsideModal ? "modal-sell-municipality" : "sell-municipality"} 
        name="municipality" 
        value={selectedMunicipality}
      />

      {munDropdownOpen && (
        <div className="custom-select-dropdown" data-lenis-prevent="true">
          <div className="select-search-box">
            <input 
              type="text" 
              placeholder={dict?.filter?.search_municipalities || "Search..."} 
              value={munSearch}
              onChange={(e) => setMunSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {munSearch && (
              <button type="button" className="clear-btn" onClick={(e) => { e.stopPropagation(); setMunSearch(''); }}>×</button>
            )}
          </div>
          <div className="select-options-list">
            {filteredMunicipalities.length === 0 ? (
              <div className="select-no-results">{dict?.filter?.no_municipalities || "No results"}</div>
            ) : (
              filteredMunicipalities.map(mun => (
                <div 
                  key={mun} 
                  className={`select-option-row ${selectedMunicipality === mun ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedMunicipality(mun);
                    setMunDropdownOpen(false);
                    setMunSearch('');
                  }}
                >
                  {mun}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderPropertyTypeSelector = (isInsideModal: boolean) => (
    <div className="form-group">
      <label>{sellDict.fields.property_type} <span className="form-required">{sellDict.fields.required || "*"}</span></label>
      
      <input 
        type="hidden" 
        id={isInsideModal ? "modal-sell-property-type" : "sell-property-type"} 
        name="property_type" 
        value={selectedPropertyType}
      />

      <div className="chips-grid-wrapper" style={{ marginTop: '0.5rem' }}>
        {propertyTypes.length === 0 ? (
          Object.entries(sellDict.fields.types || {}).map(([key, value]) => {
            const active = selectedPropertyType === key;
            return (
              <button
                key={key}
                type="button"
                className={`filter-grid-btn ${active ? 'active' : ''}`}
                onClick={() => setSelectedPropertyType(key)}
              >
                <span className="filter-grid-label">{value as string}</span>
              </button>
            );
          })
        ) : (
          propertyTypes.map((cat: any) => {
            const active = selectedPropertyType === cat.label;
            return (
              <button
                key={cat._id}
                type="button"
                className={`filter-grid-btn ${active ? 'active' : ''}`}
                onClick={() => setSelectedPropertyType(cat.label)}
              >
                {cat.icon && (
                  <div className="filter-grid-icon-box">
                    <img src={cat.icon} alt={cat.label} className="filter-grid-icon" />
                  </div>
                )}
                <span className="filter-grid-label">{cat.label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // Extract purely from dictionary data tree with zero hardcoded visual string fallbacks
  const c = dict?.contact || {};
  
  const intentDict = {
    title: intentTitle || "",
    subtitle: intentSubtitle || "",
    options: c.intent?.options || {}
  };

  const generalDict = {
    back: c.general?.back || "",
    title: generalTitle || "",
    subtitle: generalSubtitle || "",
    fields: c.general?.fields || {
      name: "", name_placeholder: "",
      email: "", email_placeholder: "",
      phone: "", phone_placeholder: "",
      message: "", message_placeholder: ""
    },
    submit: c.general?.submit || ""
  };

  const sellDict = {
    back: c.sell?.back || "",
    title: sellTitle || "",
    subtitle: sellSubtitle || "",
    fields: c.sell?.fields || {
      name: "", name_placeholder: "",
      phone: "", phone_placeholder: "",
      email: "", email_placeholder: "",
      optional: "", required: "",
      municipality: "", municipality_placeholder: "",
      property_type: "", select_type: "",
      types: {}
    },
    legal: c.sell?.legal || {
      authorize: "",
      terms: ""
    },
    submit: c.sell?.submit || ""
  };

  const handleStepTransition = (newStep: ContactFormStep) => {
    setStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  const handleIntentClick = (key: string) => {
    switch (key) {
      case 'buy': router.push('/buy'); break;
      case 'invest': router.push('/invest'); break;
      case 'general': 
        if (nextStepAsModal) {
          setModalStep('general');
          setIsModalOpen(true);
        } else {
          handleStepTransition('general'); 
        }
        break;
      case 'sell': 
        if (nextStepAsModal) {
          setModalStep('sell');
          setIsModalOpen(true);
        } else {
          handleStepTransition('sell'); 
        }
        break;
    }
  };

  const renderIntentStep = () => (
    <div className="contact-form contact-intent">
      <h3 className="form-title">{intentDict.title}</h3>
      <p className="form-subtitle">{intentDict.subtitle}</p>
      <div className="intent-options">
        {intentKeys.map((key) => (
          <button 
            key={key} 
            type="button" 
            className="intent-option-btn" 
            onClick={() => handleIntentClick(key)}
          >
            <span className="intent-option-label">{intentDict.options[key] || ""}</span>
            <span className="intent-option-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSuccessState = (isInsideModal = false) => (
    <div className="contact-success-view">
      <img 
        src="/icons/check_circle.svg" 
        alt="Success Checkmark"
        className="success-check-icon"
      />
      <h3 className="form-title">
        {dict?.contact?.success?.title || "Message Sent!"}
      </h3>
      <p className="form-subtitle">
        {dict?.contact?.success?.subtitle || "Thank you for contacting us. Our specialists will respond shortly."}
      </p>
      {!isInsideModal && (
        <Button 
          type="button" 
          variant="dark" 
          label={dict?.contact?.success?.close || "Back to start"} 
          onClick={() => {
            setSubmitSuccess(null);
            setLockedHeight(null); // Reset viewport lock for next session
            setIsModalOpen(false);
            handleStepTransition(initialStep); // Properly maintain user determined initial step
          }} 
        />
      )}
    </div>
  );

  const renderGeneralForm = (isInsideModal = false) => (
    <form 
      className="contact-form" 
      id={isInsideModal ? "contact-modal-general-form" : undefined}
      onSubmit={(e) => handleSubmit(e, 'general')}
    >
      {/* Stealth anti-spam honeypot trap */}
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
      {!isInsideModal && allowBack && initialStep === 'intent' && (
        <button type="button" className="form-back-btn" onClick={() => handleStepTransition('intent')}>
          ← {generalDict.back}
        </button>
      )}
      <h3 className="form-title">{generalDict.title}</h3>
      <p className="form-subtitle">{generalDict.subtitle}</p>
      
      <div className="form-group">
        <label htmlFor={isInsideModal ? "modal-name" : "name"}>
          {generalDict.fields.name} <span className="form-required">{sellDict.fields.required || "*"}</span>
        </label>
        <input 
          type="text" 
          id={isInsideModal ? "modal-name" : "name"} 
          placeholder={generalDict.fields.name_placeholder}
          value={generalName}
          onChange={(e) => setGeneralName(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor={isInsideModal ? "modal-email" : "email"}>
          {generalDict.fields.email} <span className="form-required">{sellDict.fields.required || "*"}</span>
        </label>
        <input 
          type="email" 
          id={isInsideModal ? "modal-email" : "email"} 
          placeholder={generalDict.fields.email_placeholder}
          value={generalEmail}
          onChange={(e) => setGeneralEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label>
          {generalDict.fields.phone} <span className="form-required">{sellDict.fields.required || "*"}</span>
        </label>
        <PhoneInput
          placeholder={generalDict.fields.phone_placeholder}
          value={generalPhone}
          onChange={setGeneralPhone}
          defaultCountry={detectedCountry}
          required
          numberInputProps={{
            id: isInsideModal ? "modal-phone" : "phone"
          }}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor={isInsideModal ? "modal-message" : "message"}>{generalDict.fields.message}</label>
        <textarea 
          id={isInsideModal ? "modal-message" : "message"} 
          rows={4} 
          placeholder={generalDict.fields.message_placeholder}
          value={generalMessage}
          onChange={(e) => setGeneralMessage(e.target.value)}
        ></textarea>
      </div>

      {submitError && (
        <div className="form-error-message" style={{ color: '#D32F2F', fontSize: 'var(--text-sm)', marginTop: '0.5rem', fontFamily: 'var(--font-manrope)' }}>
          ✕ {submitError}
        </div>
      )}
      
      {!isInsideModal && (
        <Button 
          type="submit" 
          variant="dark" 
          label={isSubmitting ? (dict?.contact?.sending || "Sending...") : generalDict.submit} 
          className="form-submit-btn" 
          showArrow={!isSubmitting}
          disabled={isSubmitting}
        />
      )}
    </form>
  );

  const renderSellForm = (isInsideModal = false) => (
    <form 
      className="contact-form" 
      id={isInsideModal ? "contact-modal-sell-form" : undefined}
      onSubmit={(e) => handleSubmit(e, 'sell')}
    >
      {/* Stealth anti-spam honeypot trap */}
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
      {!isInsideModal && allowBack && initialStep === 'intent' && (
        <button type="button" className="form-back-btn" onClick={() => handleStepTransition('intent')}>
          ← {sellDict.back}
        </button>
      )}
      <h3 className="form-title">{sellDict.title}</h3>
      <p className="form-subtitle">{sellDict.subtitle}</p>
      
      <div className="form-group">
        <label htmlFor={isInsideModal ? "modal-sell-name" : "sell-name"}>
          {sellDict.fields.name} <span className="form-required">{sellDict.fields.required}</span>
        </label>
        <input 
          type="text" 
          id={isInsideModal ? "modal-sell-name" : "sell-name"} 
          placeholder={sellDict.fields.name_placeholder} 
          required 
          value={sellName}
          onChange={(e) => setSellName(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label>
          {sellDict.fields.phone} <span className="form-required">{sellDict.fields.required}</span>
        </label>
        <PhoneInput
          placeholder={sellDict.fields.phone_placeholder}
          value={sellPhone}
          onChange={setSellPhone}
          defaultCountry={detectedCountry}
          required
          numberInputProps={{
            id: isInsideModal ? "modal-sell-phone" : "sell-phone"
          }}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor={isInsideModal ? "modal-sell-email" : "sell-email"}>
          {sellDict.fields.email} <span className="form-required">{sellDict.fields.required || "*"}</span>
        </label>
        <input 
          type="email" 
          id={isInsideModal ? "modal-sell-email" : "sell-email"} 
          placeholder={sellDict.fields.email_placeholder}
          required
          value={sellEmail}
          onChange={(e) => setSellEmail(e.target.value)}
        />
      </div>
      
      {renderMunicipalitySelector(isInsideModal)}
      
      {renderPropertyTypeSelector(isInsideModal)}
      
      <div className="form-legal-checkboxes">
        <label className="form-checkbox-label">
          <input type="checkbox" className="form-checkbox" required />
          <span className="form-checkbox-text">{sellDict.legal.authorize}</span>
        </label>
        <label className="form-checkbox-label">
          <input type="checkbox" className="form-checkbox" required />
          <span className="form-checkbox-text">{sellDict.legal.terms}</span>
        </label>
      </div>

      {submitError && (
        <div className="form-error-message" style={{ color: '#D32F2F', fontSize: 'var(--text-sm)', marginTop: '0.5rem', fontFamily: 'var(--font-manrope)' }}>
          ✕ {submitError}
        </div>
      )}
      
      {!isInsideModal && (
        <Button 
          type="submit" 
          variant="dark" 
          label={isSubmitting ? (dict?.contact?.sending || "Sending...") : sellDict.submit} 
          className="form-submit-btn" 
          showArrow={!isSubmitting}
          disabled={isSubmitting}
        />
      )}
    </form>
  );

  const getModalTitle = () => {
    if (modalStep === 'general') return generalDict.title;
    if (modalStep === 'sell') return sellDict.title;
    return '';
  };

  const getModalSubtitle = () => {
    if (modalStep === 'general') return generalDict.subtitle;
    if (modalStep === 'sell') return sellDict.subtitle;
    return '';
  };

  if (isInsideExternalModal) {
    return (
      <>
        {submitSuccess ? (
          renderSuccessState(true)
        ) : (
          <>
            {step === 'intent' && renderIntentStep()}
            {step === 'general' && renderGeneralForm(true)}
            {step === 'sell' && renderSellForm(true)}
          </>
        )}
      </>
    );
  }

  return (
    <>
      <div 
        ref={cardRef}
        className={`contact-card ${className}`}
        style={submitSuccess && !isModalOpen && lockedHeight ? { minHeight: `${lockedHeight}px` } : {}}
      >
        {submitSuccess && !isModalOpen ? (
          renderSuccessState(false)
        ) : (
          <>
            {step === 'intent' && renderIntentStep()}
            {step === 'general' && renderGeneralForm(false)}
            {step === 'sell' && renderSellForm(false)}
          </>
        )}
      </div>

      {nextStepAsModal && (
        <ContactModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            if (submitSuccess) {
              // Delay cleaning up state until modal completes its 300ms slide-out animation!
              setTimeout(() => {
                setSubmitSuccess(null);
                setLockedHeight(null);
              }, 400);
            }
          }}
          title={submitSuccess ? "" : getModalTitle()}
          subtitle={submitSuccess ? "" : getModalSubtitle()}
          footer={
            submitSuccess ? (
              <Button 
                type="button" 
                variant="dark" 
                label={dict?.contact?.success?.close || "Back to start"} 
                className="form-submit-btn"
                onClick={() => {
                  setIsModalOpen(false); // Trigger slide-out transition immediately!
                  // Delay reset to allow full exit animation without internal content switching!
                  setTimeout(() => {
                    setSubmitSuccess(null);
                    setLockedHeight(null);
                    handleStepTransition(initialStep);
                  }, 400);
                }} 
              />
            ) : (
              modalStep === 'general' ? (
                <Button 
                  type="submit" 
                  variant="dark" 
                  label={isSubmitting ? (dict?.contact?.sending || "Sending...") : generalDict.submit} 
                  className="form-submit-btn" 
                  showArrow={!isSubmitting} 
                  form="contact-modal-general-form"
                  disabled={isSubmitting}
                />
              ) : (
                <Button 
                  type="submit" 
                  variant="dark" 
                  label={isSubmitting ? (dict?.contact?.sending || "Sending...") : sellDict.submit} 
                  className="form-submit-btn" 
                  showArrow={!isSubmitting} 
                  form="contact-modal-sell-form"
                  disabled={isSubmitting}
                />
              )
            )
          }
        >
          {submitSuccess ? (
            renderSuccessState(true)
          ) : (
            <>
              {modalStep === 'general' && renderGeneralForm(true)}
              {modalStep === 'sell' && renderSellForm(true)}
            </>
          )}
        </ContactModal>
      )}
    </>
  );
}
