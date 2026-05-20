'use client';

import { useState, useCallback, useEffect } from 'react';
import ContactCard from '@/components/ui/ContactCard';
import ContactModal from '@/components/ui/ContactModal';
import Button from '@/components/ui/Button';
import { useModalRegistry, ModalRegistryProvider, ModalRegistryContext } from '@/components/providers/ModalRegistryContext';

export { useModalRegistry, ModalRegistryProvider, ModalRegistryContext };

// ─── Individual Contact Modal Component ──────────────────────────────────────
interface ContactModalComponentProps {
  componentId: string;
  formType: 'general' | 'sell' | 'mortgage';
  title?: string;
  subtitle?: string;
  hideWhatsApp?: boolean;
  whatsappMessageTemplate?: string;
  presetMessage?: string;
  dict?: any;
  whatsappNumber?: string;
}

export function ContactModalComponentInstance({
  componentId,
  formType,
  title,
  subtitle,
  hideWhatsApp,
  whatsappMessageTemplate,
  presetMessage,
  dict,
  whatsappNumber,
}: ContactModalComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerModal, unregisterModal } = useModalRegistry();

  useEffect(() => {
    registerModal(componentId, () => setIsOpen(true));
    return () => unregisterModal(componentId);
  }, [componentId, registerModal, unregisterModal]);

  const handleClose = () => {
    setIsOpen(false);
    if (submitSuccess) {
      setTimeout(() => {
        setSubmitSuccess(null);
      }, 400);
    }
  };

  const c = dict?.contact || {};
  const formTitle = title || '';
  const formSubtitle = subtitle || '';

  const sellDict = {
    submit: c.sell?.submit || 'START SELLING',
    title: formTitle,
  };
  const generalDict = {
    submit: c.general?.submit || 'SEND MESSAGE',
    title: formTitle,
  };
  const mortgageDict = {
    submit: c.mortgage?.submit || (dict?.locale === 'es' ? 'SOLICITAR ESTUDIO' : 'REQUEST STUDY'),
    title: formTitle,
  };

  return (
    <ContactModal
      isOpen={isOpen}
      onClose={handleClose}
      title={submitSuccess ? '' : formTitle}
      subtitle={submitSuccess ? '' : formSubtitle}
      footer={
        submitSuccess ? (
          <Button
            type="button"
            variant="dark"
            label={dict?.contact?.success?.close || 'Back to start'}
            className="form-submit-btn"
            onClick={() => {
              setIsOpen(false);
              setTimeout(() => setSubmitSuccess(null), 400);
            }}
          />
        ) : formType === 'general' ? (
          <Button
            type="submit"
            variant="dark"
            label={isSubmitting ? (dict?.contact?.sending || 'Sending...') : generalDict.submit}
            className="form-submit-btn"
            showArrow={!isSubmitting}
            form={`pc-modal-${componentId}-general-form`}
            disabled={isSubmitting}
          />
        ) : formType === 'mortgage' ? (
          <Button
            type="submit"
            variant="dark"
            label={isSubmitting ? (dict?.contact?.sending || 'Sending...') : mortgageDict.submit}
            className="form-submit-btn"
            showArrow={!isSubmitting}
            form={`pc-modal-${componentId}-mortgage-form`}
            disabled={isSubmitting}
          />
        ) : (
          <Button
            type="submit"
            variant="dark"
            label={isSubmitting ? (dict?.contact?.sending || 'Sending...') : sellDict.submit}
            className="form-submit-btn"
            showArrow={!isSubmitting}
            form={`pc-modal-${componentId}-sell-form`}
            disabled={isSubmitting}
          />
        )
      }
    >
      <ContactCard
        initialStep={formType}
        allowBack={false}
        isInsideExternalModal={true}
        dict={dict}
        generalTitle={formType === 'general' ? formTitle : undefined}
        generalSubtitle={formType === 'general' ? formSubtitle : undefined}
        sellTitle={formType === 'sell' ? formTitle : undefined}
        sellSubtitle={formType === 'sell' ? formSubtitle : undefined}
        mortgageTitle={formType === 'mortgage' ? formTitle : undefined}
        mortgageSubtitle={formType === 'mortgage' ? formSubtitle : undefined}
        showGeneralWhatsApp={formType === 'general' && !hideWhatsApp}
        showSellWhatsApp={formType === 'sell' && !hideWhatsApp}
        showMortgageWhatsApp={formType === 'mortgage' && !hideWhatsApp}
        sellWhatsappMessageTemplate={formType === 'sell' ? whatsappMessageTemplate : undefined}
        mortgageWhatsappMessageTemplate={formType === 'mortgage' ? whatsappMessageTemplate : undefined}
        whatsappMessageTemplate={formType === 'general' ? whatsappMessageTemplate : undefined}
        presetMessage={presetMessage}
        whatsappNumber={whatsappNumber}
        onSubmittingChange={setIsSubmitting}
        onSubmitSuccessChange={setSubmitSuccess}
        submitSuccess={submitSuccess}
        formIdPrefix={`pc-modal-${componentId}`}
      />
    </ContactModal>
  );
}

// ─── Main Renderer ────────────────────────────────────────────────────────────
interface PageComponentsRendererProps {
  pageComponents?: any[];
  dict?: any;
  whatsappNumber?: string;
}

export default function PageComponentsRenderer({
  pageComponents,
  dict,
  whatsappNumber,
}: PageComponentsRendererProps) {
  if (!pageComponents || pageComponents.length === 0) return null;

  return (
    <>
      {pageComponents.map((component, index) => {
        if (component._type === 'contactModalComponent') {
          return (
            <ContactModalComponentInstance
              key={component._key || index}
              componentId={component.componentId}
              formType={component.formType || 'general'}
              title={component.title}
              subtitle={component.subtitle}
              hideWhatsApp={component.componentId === 'sell-modal' ? true : component.hideWhatsApp}
              whatsappMessageTemplate={component.whatsappMessageTemplate}
              presetMessage={component.presetMessage}
              dict={dict}
              whatsappNumber={whatsappNumber}
            />
          );
        }
        return null;
      })}
    </>
  );
}
