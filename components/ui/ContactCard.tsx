'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import ContactModal from './ContactModal';
import { client } from '@/sanity/lib/client';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './ContactCard.css';

export type ContactFormStep = 'intent' | 'general' | 'sell' | 'mortgage';

export interface ContactCardProps {
  initialStep?: ContactFormStep;
  allowBack?: boolean;
  nextStepAsModal?: boolean;
  dict?: any;

  intentTitle?: string;
  intentSubtitle?: string;
  showIntentWhatsApp?: boolean;
  intentWhatsappMessageTemplate?: string;

  generalTitle?: string;
  generalSubtitle?: string;
  showGeneralWhatsApp?: boolean;

  sellTitle?: string;
  sellSubtitle?: string;
  showSellWhatsApp?: boolean;
  sellWhatsappMessageTemplate?: string;

  mortgageTitle?: string;
  mortgageSubtitle?: string;
  showMortgageWhatsApp?: boolean;
  mortgageWhatsappMessageTemplate?: string;

  presetMessage?: string;
  whatsappNumber?: string;
  whatsappMessageTemplate?: string;

  className?: string;
  onStepChange?: (step: ContactFormStep) => void;
  isInsideExternalModal?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  onSubmitSuccessChange?: (success: boolean | null) => void;
  /** Optional prefix for form element IDs to avoid conflicts when multiple instances exist */
  formIdPrefix?: string;
}

const intentKeys = ['general', 'sell', 'buy', 'mortgage'] as const;

export default function ContactCard({
  initialStep = 'intent',
  allowBack = true,
  nextStepAsModal = false,
  dict,
  intentTitle,
  intentSubtitle,
  showIntentWhatsApp,
  intentWhatsappMessageTemplate,
  generalTitle,
  generalSubtitle,
  showGeneralWhatsApp = true,
  sellTitle,
  sellSubtitle,
  showSellWhatsApp = true,
  sellWhatsappMessageTemplate,
  mortgageTitle,
  mortgageSubtitle,
  showMortgageWhatsApp = true,
  mortgageWhatsappMessageTemplate,
  presetMessage,
  whatsappNumber,
  whatsappMessageTemplate,
  className = '',
  onStepChange,
  isInsideExternalModal = false,
  onSubmittingChange,
  onSubmitSuccessChange,
  formIdPrefix = 'contact-modal',
}: ContactCardProps) {
  // Added for displaying next step in sliding sidebar drawer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ContactFormStep | null>(null);
  // Guarantee we always have a valid enum string, blocking null/undefined/object/unicode-ghost edge-cases strictly
  const getValidStep = (val: any): ContactFormStep => {
    // Aggressively strip ALL non-word characters (like zero-width spaces, control chars, etc.)
    const clean = val ? String(val).replace(/[^\w]/g, '').trim() : '';
    if (clean === 'general' || clean === 'sell' || clean === 'mortgage') return clean as ContactFormStep;
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

  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [detectedCountry, setDetectedCountry] = useState<any>('ES'); // Fallback to Spain

  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [generalPhone, setGeneralPhone] = useState<any>();
  const [sellPhone, setSellPhone] = useState<any>();
  const [mortgagePhone, setMortgagePhone] = useState<any>();

  // Input binding states
  const [generalName, setGeneralName] = useState('');
  const [generalEmail, setGeneralEmail] = useState('');
  const [generalMessage, setGeneralMessage] = useState(presetMessage || '');

  // Update general message seamlessly if presetMessage changes dynamically
  useEffect(() => {
    if (presetMessage) setGeneralMessage(presetMessage);
  }, [presetMessage]);

  const [sellName, setSellName] = useState('');
  const [sellEmail, setSellEmail] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const [isTypingPrefix, setIsTypingPrefix] = useState(false);
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const isAddressSelectedRef = useRef(false);
  const updateAddressSelected = (val: boolean) => {
    setIsAddressSelected(val);
    isAddressSelectedRef.current = val;
  };

  // Sync selectedMunicipality with addressInput (e.g. on clean/submit success)
  useEffect(() => {
    setAddressInput(selectedMunicipality);
  }, [selectedMunicipality]);

  // Listen for preset address (e.g. from SellHeroSection search modal)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__sellPresetAddress) {
        const addr = win.__sellPresetAddress;
        setSelectedMunicipality(addr);
        setAddressInput(addr);
        updateAddressSelected(true);
        delete win.__sellPresetAddress;
      }
    }

    const handlePresetEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setSelectedMunicipality(detail);
        setAddressInput(detail);
        updateAddressSelected(true);
      }
    };

    window.addEventListener('set-sell-address', handlePresetEvent);
    return () => {
      window.removeEventListener('set-sell-address', handlePresetEvent);
    };
  }, []);

  const [mortgageName, setMortgageName] = useState('');
  const [mortgageEmail, setMortgageEmail] = useState('');


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

  const handleSubmit = async (e: React.FormEvent, formType: 'general' | 'sell' | 'mortgage') => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    // Validate custom dynamic select fields which lack native HTML5 form validation triggers
    if (formType === 'sell') {
      if (!selectedMunicipality || !selectedPropertyType) {
        setSubmitError(
          dict?.filter?.no_results ? "Por favor, complete todos los campos obligatorios." : "Please fill out all required fields."
        );
        setIsSubmitting(false);
        return;
      }
      if (!isAddressSelected) {
        setSubmitError(
          locale === 'es'
            ? "Por favor, seleccione una dirección de la lista de sugerencias."
            : "Please select a valid address from the suggestions list."
        );
        setIsSubmitting(false);
        return;
      }
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
    } : formType === 'mortgage' ? {
      formType: 'mortgage',
      name: mortgageName,
      email: mortgageEmail,
      phone: mortgagePhone,
      fax: honeypot,
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
        updateAddressSelected(false);
      } else if (formType === 'mortgage') {
        setMortgageName('');
        setMortgageEmail('');
        setMortgagePhone('');
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

  // Close custom dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 1. Auto-Detect Country IP (Third-Party API)
  const renderWhatsAppOption = (overrideTemplate?: string) => {
    if (!whatsappNumber) return null;
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const activeTemplate = overrideTemplate || whatsappMessageTemplate;
    const text = activeTemplate ? encodeURIComponent(activeTemplate) : (presetMessage ? encodeURIComponent(presetMessage) : '');
    const waUrl = `https://wa.me/${cleanNumber}${text ? `?text=${text}` : ''}`;

    // We get locale from pathname
    const waLabel = dict?.contact?.whatsapp_cta;
    const orLabel = dict?.contact?.whatsapp_or_form;

    return (
      <div className="whatsapp-option" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '--btn-link-color': 'var(--text-black)',
        '--btn-link-border': 'var(--border-strong)'
      } as React.CSSProperties}>
        <Button
          href={waUrl}
          variant="link"
          label={waLabel}
          icon="/icons/logo-wa.svg"
          className="whatsapp-link-sm"
          target="_blank"
          rel="noopener noreferrer"
        />
        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--text-subtle)', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
          <div style={{ padding: '0 15px', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-manrope)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wider)', fontWeight: 'var(--fw-bold)' }}>
            {orLabel}
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
        </div>
      </div>
    );
  };

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
        } catch (e) { }
      });
  }, []);

  // 2. Load dynamic datasets from APIs & Sanity
  useEffect(() => {
    let isMounted = true;

    async function loadSources() {
      try {
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

  // Address Autocomplete Handlers
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddressInput(val);
    setSelectedMunicipality(val); // Keep selectedMunicipality in sync for submitting
    updateAddressSelected(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = val.trim().toLowerCase();
    const commonPrefixes = ['calle', 'avenida', 'c/', 'av.', 'av', 'street', 'road', 'calle de', 'plaza', 'paseo', 'camino'];
    const isPrefix = commonPrefixes.includes(trimmed);

    if (!val || val.trim().length < 3) {
      setSuggestions([]);
      setIsTypingPrefix(false);
      setShowSuggestions(false);
      return;
    }

    if (isPrefix) {
      setSuggestions([]);
      setIsTypingPrefix(true);
      setShowSuggestions(true);
      return;
    }

    setIsTypingPrefix(false);
    setShowSuggestions(true);
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const allowedTypes = ['house', 'street', 'poi'];
        
        // Fetch helper to hit Photon API
        const fetchFeatures = async (queryStr: string) => {
          const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryStr)}&limit=30&lat=28.2916&lon=-16.6291&bbox=-16.95,27.98,-16.10,28.59`;
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
          });
          if (res.ok) {
            const data = await res.json();
            return data.features || [];
          }
          return [];
        };

        // 1. Primary Fetch
        let features = await fetchFeatures(val);

        // Filter primary features strictly to street-level
        let filteredFeatures = features.filter((f: any) => allowedTypes.includes(f.properties?.type));

        // 2. Fallback Fetch: if we have few street level results and no street-prefix is present in input
        const commonPrefixes = ['calle', 'avenida', 'c/', 'av.', 'av', 'street', 'road', 'calle de', 'plaza', 'paseo', 'camino', 'glorieta', 'bulevar'];
        const hasStreetKeyword = commonPrefixes.some(word => val.toLowerCase().includes(word));

        if (filteredFeatures.length < 5 && !hasStreetKeyword) {
          const fallbackFeatures = await fetchFeatures('calle ' + val);
          const filteredFallback = fallbackFeatures.filter((f: any) => allowedTypes.includes(f.properties?.type));
          
          // Combine and deduplicate by osm_id
          const seenIds = new Set(filteredFeatures.map((f: any) => f.properties?.osm_id).filter(Boolean));
          filteredFallback.forEach((f: any) => {
            const osmId = f.properties?.osm_id;
            if (!osmId || !seenIds.has(osmId)) {
              filteredFeatures.push(f);
              if (osmId) seenIds.add(osmId);
            }
          });
        }

        // Map to suggestions with clean formatting
        const mapped = filteredFeatures.map((f: any, idx: number) => {
          const p = f.properties || {};
          const parts: string[] = [];

          let streetAddress = '';
          if (p.name) {
            streetAddress = p.name;
            if (p.street && p.street !== p.name) {
              streetAddress += ` (${p.street})`;
            }
          } else if (p.street) {
            streetAddress = p.street;
          }

          if (p.housenumber && streetAddress) {
            streetAddress += `, ${p.housenumber}`;
          }

          if (streetAddress) parts.push(streetAddress);
          if (p.district) parts.push(p.district);
          else if (p.locality) parts.push(p.locality);
          if (p.city) parts.push(p.city);
          if (p.postcode) parts.push(p.postcode);

          return {
            place_id: p.osm_id || idx,
            display_name: parts.join(', ')
          };
        });

        // Limit the final suggestion dropdown list to 10 items
        setSuggestions(mapped.slice(0, 10));
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (display_name: string) => {
    setAddressInput(display_name);
    setSelectedMunicipality(display_name);
    updateAddressSelected(true);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const renderMunicipalitySelector = (isInsideModal: boolean) => (
    <div className="form-group form-custom-select-group" ref={addressDropdownRef}>
      <label htmlFor={isInsideModal ? "modal-sell-address" : "sell-address"}>
        {sellDict.fields.municipality} <span className="form-required">{sellDict.fields.required || "*"}</span>
      </label>
      <input
        type="text"
        id={isInsideModal ? "modal-sell-address" : "sell-address"}
        placeholder={sellDict.fields.municipality_placeholder}
        required
        value={addressInput}
        onChange={handleAddressChange}
        onFocus={() => {
          const trimmed = addressInput.trim().toLowerCase();
          const commonPrefixes = ['calle', 'avenida', 'c/', 'av.', 'av', 'street', 'road', 'calle de', 'plaza', 'paseo', 'camino'];
          if (addressInput.trim().length >= 3 || commonPrefixes.includes(trimmed)) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            if (!isAddressSelectedRef.current) {
              setAddressInput('');
              setSelectedMunicipality('');
            }
            setShowSuggestions(false);
          }, 200);
        }}
        autoComplete="off"
      />

      {showSuggestions && (
        <div className="custom-select-dropdown" data-lenis-prevent="true" style={{ top: '100%' }}>
          <div className="select-options-list">
            {isTypingPrefix ? (
              <div className="select-no-results" style={{ fontSize: 'var(--text-base-sm)' }}>
                {locale === 'es' ? 'Siga escribiendo el nombre de la calle...' : 'Continue typing the street name...'}
              </div>
            ) : isLoadingSuggestions ? (
              <div className="select-no-results" style={{ fontSize: 'var(--text-base-sm)' }}>
                {locale === 'es' ? 'Buscando sugerencias...' : 'Searching suggestions...'}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="select-no-results" style={{ fontSize: 'var(--text-base-sm)' }}>
                {locale === 'es' ? 'No se encontraron sugerencias' : 'No suggestions found'}
              </div>
            ) : (
              suggestions.map((sug, idx) => (
                <div
                  key={sug.place_id || idx}
                  className="select-option-row"
                  onClick={() => handleSelectSuggestion(sug.display_name)}
                  style={{
                    fontSize: 'var(--text-base-sm)',
                    lineHeight: 'var(--lh-base)',
                    padding: '0.85rem 1.1rem',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  {sug.display_name}
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

  const mortgageDict = {
    back: c.mortgage?.back || "",
    title: mortgageTitle || "",
    subtitle: mortgageSubtitle || "",
    fields: c.mortgage?.fields || {
      name: "", name_placeholder: "",
      email: "", email_placeholder: "",
      phone: "", phone_placeholder: "",
      price: "", price_placeholder: "",
      down_payment: "", down_payment_placeholder: "",
      message: "", message_placeholder: "",
      required: ""
    },
    submit: c.mortgage?.submit || ""
  };

  const handleStepTransition = (newStep: ContactFormStep) => {
    setStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  const handleIntentClick = (key: string) => {
    switch (key) {
      case 'buy': router.push('/buy'); break;
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
      case 'mortgage':
        if (nextStepAsModal) {
          setModalStep('mortgage');
          setIsModalOpen(true);
        } else {
          handleStepTransition('mortgage');
        }
        break;
    }
  };

  const renderIntentStep = () => (
    <div className="contact-form contact-intent">
      <h3 className="form-title">{intentDict.title}</h3>
      <p className="form-subtitle">{intentDict.subtitle}</p>

      {showIntentWhatsApp && renderWhatsAppOption(intentWhatsappMessageTemplate)}

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
      id={isInsideModal ? `${formIdPrefix}-general-form` : undefined}
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

      {showGeneralWhatsApp && renderWhatsAppOption()}

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

      {!presetMessage && (
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
      )}

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
      id={isInsideModal ? `${formIdPrefix}-sell-form` : undefined}
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

      {showSellWhatsApp && renderWhatsAppOption(sellWhatsappMessageTemplate)}

      {renderMunicipalitySelector(isInsideModal)}

      {renderPropertyTypeSelector(isInsideModal)}

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

  const renderMortgageForm = (isInsideModal = false) => (
    <form
      className="contact-form"
      id={isInsideModal ? `${formIdPrefix}-mortgage-form` : undefined}
      onSubmit={(e) => handleSubmit(e, 'mortgage')}
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
          ← {mortgageDict.back}
        </button>
      )}
      <h3 className="form-title">{mortgageDict.title}</h3>
      <p className="form-subtitle">{mortgageDict.subtitle}</p>

      {showMortgageWhatsApp && renderWhatsAppOption(mortgageWhatsappMessageTemplate)}

      <div className="form-group">
        <label htmlFor={isInsideModal ? "modal-mortgage-name" : "mortgage-name"}>
          {mortgageDict.fields.name} <span className="form-required">{mortgageDict.fields.required}</span>
        </label>
        <input
          type="text"
          id={isInsideModal ? "modal-mortgage-name" : "mortgage-name"}
          placeholder={mortgageDict.fields.name_placeholder}
          required
          value={mortgageName}
          onChange={(e) => setMortgageName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor={isInsideModal ? "modal-mortgage-email" : "mortgage-email"}>
          {mortgageDict.fields.email} <span className="form-required">{mortgageDict.fields.required}</span>
        </label>
        <input
          type="email"
          id={isInsideModal ? "modal-mortgage-email" : "mortgage-email"}
          placeholder={mortgageDict.fields.email_placeholder}
          required
          value={mortgageEmail}
          onChange={(e) => setMortgageEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>
          {mortgageDict.fields.phone} <span className="form-required">{mortgageDict.fields.required}</span>
        </label>
        <PhoneInput
          placeholder={mortgageDict.fields.phone_placeholder}
          value={mortgagePhone}
          onChange={setMortgagePhone}
          defaultCountry={detectedCountry}
          required
          numberInputProps={{
            id: isInsideModal ? "modal-mortgage-phone" : "mortgage-phone"
          }}
        />
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
          label={isSubmitting ? (dict?.contact?.sending || "Sending...") : mortgageDict.submit}
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
    if (modalStep === 'mortgage') return mortgageDict.title;
    return '';
  };

  const getModalSubtitle = () => {
    if (modalStep === 'general') return generalDict.subtitle;
    if (modalStep === 'sell') return sellDict.subtitle;
    if (modalStep === 'mortgage') return mortgageDict.subtitle;
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
            {step === 'mortgage' && renderMortgageForm(true)}
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
            {step === 'mortgage' && renderMortgageForm(false)}
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
              ) : modalStep === 'mortgage' ? (
                <Button
                  type="submit"
                  variant="dark"
                  label={isSubmitting ? (dict?.contact?.sending || "Sending...") : mortgageDict.submit}
                  className="form-submit-btn"
                  showArrow={!isSubmitting}
                  form="contact-modal-mortgage-form"
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
              {modalStep === 'mortgage' && renderMortgageForm(true)}
            </>
          )}
        </ContactModal>
      )}
    </>
  );
}
