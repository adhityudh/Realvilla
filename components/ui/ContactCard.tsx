'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import './ContactCard.css';

export type ContactFormStep = 'intent' | 'general' | 'sell';

export interface ContactCardProps {
  initialStep?: ContactFormStep;
  allowBack?: boolean;
  dict?: any;
  
  intentTitle?: string;
  intentSubtitle?: string;
  
  generalTitle?: string;
  generalSubtitle?: string;
  
  sellTitle?: string;
  sellSubtitle?: string;
  
  className?: string;
  onStepChange?: (step: ContactFormStep) => void;
}

const intentKeys = ['general', 'sell', 'buy', 'invest'] as const;

export default function ContactCard({
  initialStep = 'intent',
  allowBack = true,
  dict,
  intentTitle,
  intentSubtitle,
  generalTitle,
  generalSubtitle,
  sellTitle,
  sellSubtitle,
  className = '',
  onStepChange
}: ContactCardProps) {
  // Guarantee we always have a valid enum string, blocking null/undefined/object/unicode-ghost edge-cases strictly
  const getValidStep = (val: any): ContactFormStep => {
    // Aggressively strip ALL non-word characters (like zero-width spaces, control chars, etc.)
    const clean = val ? String(val).replace(/[^\w]/g, '').trim() : '';
    if (clean === 'general' || clean === 'sell') return clean as ContactFormStep;
    return 'intent';
  };

  const [step, setStep] = useState<ContactFormStep>(getValidStep(initialStep));
  const router = useRouter();

  // Seamlessly update form step dynamically if prop shifts on subsequent component mounts
  useEffect(() => {
    setStep(getValidStep(initialStep));
  }, [initialStep]);

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
      case 'general': handleStepTransition('general'); break;
      case 'sell': handleStepTransition('sell'); break;
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

  const renderGeneralForm = () => (
    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
      {allowBack && initialStep === 'intent' && (
        <button type="button" className="form-back-btn" onClick={() => handleStepTransition('intent')}>
          ← {generalDict.back}
        </button>
      )}
      <h3 className="form-title">{generalDict.title}</h3>
      <p className="form-subtitle">{generalDict.subtitle}</p>
      
      <div className="form-group">
        <label htmlFor="name">{generalDict.fields.name}</label>
        <input type="text" id="name" placeholder={generalDict.fields.name_placeholder} />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">{generalDict.fields.email}</label>
        <input type="email" id="email" placeholder={generalDict.fields.email_placeholder} />
      </div>
      
      <div className="form-group">
        <label htmlFor="phone">{generalDict.fields.phone}</label>
        <input type="tel" id="phone" placeholder={generalDict.fields.phone_placeholder} />
      </div>
      
      <div className="form-group">
        <label htmlFor="message">{generalDict.fields.message}</label>
        <textarea id="message" rows={4} placeholder={generalDict.fields.message_placeholder}></textarea>
      </div>
      
      <Button type="submit" variant="dark" label={generalDict.submit} className="form-submit-btn" showArrow={true} />
    </form>
  );

  const renderSellForm = () => (
    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
      {allowBack && initialStep === 'intent' && (
        <button type="button" className="form-back-btn" onClick={() => handleStepTransition('intent')}>
          ← {sellDict.back}
        </button>
      )}
      <h3 className="form-title">{sellDict.title}</h3>
      <p className="form-subtitle">{sellDict.subtitle}</p>
      
      <div className="form-group">
        <label htmlFor="sell-name">
          {sellDict.fields.name} <span className="form-required">{sellDict.fields.required}</span>
        </label>
        <input type="text" id="sell-name" placeholder={sellDict.fields.name_placeholder} required />
      </div>
      
      <div className="form-group">
        <label htmlFor="sell-phone">
          {sellDict.fields.phone} <span className="form-required">{sellDict.fields.required}</span>
        </label>
        <input type="tel" id="sell-phone" placeholder={sellDict.fields.phone_placeholder} required />
      </div>
      
      <div className="form-group">
        <label htmlFor="sell-email">
          {sellDict.fields.email} <span className="form-optional">{sellDict.fields.optional}</span>
        </label>
        <input type="email" id="sell-email" placeholder={sellDict.fields.email_placeholder} />
      </div>
      
      <div className="form-group">
        <label htmlFor="sell-municipality">{sellDict.fields.municipality}</label>
        <input type="text" id="sell-municipality" placeholder={sellDict.fields.municipality_placeholder} />
      </div>
      
      <div className="form-group">
        <label htmlFor="sell-property-type">{sellDict.fields.property_type}</label>
        <select id="sell-property-type" className="form-select" defaultValue="">
          <option value="" disabled>{sellDict.fields.select_type}</option>
          {Object.entries(sellDict.fields.types || {}).map(([key, value]) => (
            <option key={key} value={key}>{value as string}</option>
          ))}
        </select>
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
      
      <Button type="submit" variant="dark" label={sellDict.submit} className="form-submit-btn" showArrow={true} />
    </form>
  );

  return (
    <div className={`contact-card ${className}`}>
      {step === 'intent' && renderIntentStep()}
      {step === 'general' && renderGeneralForm()}
      {step === 'sell' && renderSellForm()}
    </div>
  );
}
