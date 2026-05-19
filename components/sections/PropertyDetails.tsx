'use client';

import React, { useState, useEffect } from 'react';
import { PortableText } from 'next-sanity';
import PropertyMap from '@/components/ui/Map';
import Button from '@/components/ui/Button';
import ContactModal from '@/components/ui/ContactModal';
import ContactCard from '@/components/ui/ContactCard';
import { smoothScrollToAnchor } from '@/lib/scroll';
import './PropertyDetails.css';

interface PropertyDetailsProps {
  property: any;
  dict?: any;
  locale?: string;
  quickLinks?: any[];
  useRequestGuidance?: boolean;
  whatsappNumber?: string;
  whatsappMessageTemplate?: string;
  requestGuidancePresetMessage?: string;
  hideRequestGuidanceWhatsApp?: boolean;
}

export default function PropertyDetails({ 
  property, 
  dict, 
  locale = 'en',
  quickLinks = [],
  useRequestGuidance = true,
  whatsappNumber,
  whatsappMessageTemplate,
  requestGuidancePresetMessage,
  hideRequestGuidanceWhatsApp
}: PropertyDetailsProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [pageUrl, setPageUrl] = useState('');

  // Update the page url for link injections on the client
  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  if (!property) return null;

  const handleQuickLinkClick = (e: React.MouseEvent<any>, url: string) => {
    if (!url) return;

    // 1. Attempt central smooth scroll first (intercepts if element is local)
    // 2. If target is not in local DOM, browser will naturally navigate to dynamic href from Sanity!
    smoothScrollToAnchor(e, url);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr.split('T')[0];
    }
  };

  const price = property.price
    ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)
    : dict?.properties?.price_upon_request || 'Price upon request';

  const statusLabel = (() => {
    const raw = property?.status?.toLowerCase();
    if (raw === 'sold') return dict?.property?.status_sold;
    if (raw === 'reserved') return dict?.property?.status_reserved;
    return dict?.property?.status_for_sale;
  })();

  // Group meta by category
  const finalMeta = property.meta || [];
  const groupedMeta = finalMeta.reduce((acc: any, curr: any) => {
    const cat = curr.category || dict?.property?.other_details || 'General';
    const order = curr.categoryOrder ?? 999;

    if (!acc[cat]) {
      acc[cat] = { items: [], order };
    }
    acc[cat].items.push(curr);
    return acc;
  }, {});

  const formatMetaValue = (m: any) => {
    const clean = (str: any) => typeof str === 'string' ? str.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : str;

    const getDisplay = (val: string) => {
      const cleanedVal = clean(val);
      const match = m.selectOptions?.find((o: any) => clean(o.value) === cleanedVal);
      return match?.label || val;
    };

    const sVal = m.selectValue ? getDisplay(m.selectValue) : null;
    const aVal = Array.isArray(m.selectArrayValue) ? m.selectArrayValue.map(getDisplay).join(', ') : null;

    let baseVal = m.numberValue ?? m.stringValue ?? sVal ?? aVal;

    if (baseVal === null || baseVal === undefined) {
      if (m.booleanValue !== undefined) {
        baseVal = m.booleanValue ? (dict?.common?.yes || 'Yes') : (dict?.common?.no || 'No');
      } else {
        return '—';
      }
    }

    if (baseVal === '') return '—';

    const unit = m.unit ? ` ${m.unit}` : '';
    return `${baseVal}${unit}`;
  };

  return (
    <section className="property-details-section">
      <div className="property-details-container">

        <div className="details-left-col">
          {/* 1. Description */}
          {property.description && (
            <div className="details-block description-block">
              <h2 className="details-heading">
                {dict?.property?.description_title || (locale === 'es' ? 'Descripción' : 'Description')}
              </h2>
              <div className="portable-text-wrapper">
                <PortableText value={property.description} />
              </div>
              
              {((quickLinks && quickLinks.length > 0) || useRequestGuidance) && (
                <div className="property-quick-links">
                  {/* Dynamically rendered editorial links */}
                  {quickLinks?.map((ql: any, qIdx: number) => (
                    <Button
                      key={qIdx}
                      label={ql.label}
                      href={ql.link || '#'}
                      onClick={(e) => handleQuickLinkClick(e, ql.link)}
                      variant="link"
                    />
                  ))}

                  {/* Fixed optional guidance direct modal trigger */}
                  {useRequestGuidance && (
                    <Button
                      label={locale === 'es' ? 'SOLICITAR ASESORAMIENTO' : 'REQUEST GUIDANCE'}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsContactModalOpen(true);
                      }}
                      variant="link"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. Basic Meta */}
          <div className="details-block basic-meta-block">
            <h2 className="details-heading">
              {dict?.property?.basics_title || (locale === 'es' ? 'Resumen de la propiedad' : 'Property Overview')}
            </h2>
            <div className="meta-grid-container">
              <div className="meta-info-item info-price">
                <span className="meta-info-label">{dict?.property?.price_label || (locale === 'es' ? 'Precio' : 'Price')}</span>
                <span className="meta-info-value">{price}</span>
              </div>
              <div className="meta-info-item info-type">
                <span className="meta-info-label">{locale === 'es' ? 'Tipo de propiedad' : 'Property Type'}</span>
                <span className="meta-info-value">{property.category?.title || '—'}</span>
              </div>
              <div className="meta-info-item info-address">
                <span className="meta-info-label">{dict?.property?.address_label || (locale === 'es' ? 'Dirección' : 'Address')}</span>
                <span className="meta-info-value">{property.address || '—'}</span>
              </div>
              <div className="meta-info-item info-updated">
                <span className="meta-info-label">{dict?.property?.status_label || (locale === 'es' ? 'Estado' : 'Status')}</span>
                <span className="meta-info-value">{statusLabel}</span>
                <div className="meta-info-subtext">
                  {dict?.property?.updated_label || 'Last Updated'}: {formatDate(property._updatedAt)}
                </div>
              </div>
            </div>
            {property.location?.coordinates?.lat && property.location?.coordinates?.lng && (
              <div style={{ marginTop: '1.5rem' }}>
                <PropertyMap
                  lat={property.location.coordinates.lat}
                  lng={property.location.coordinates.lng}
                  title={property.title}
                />
              </div>
            )}
          </div>

          {/* 3. Dynamic Grouped Meta Sorted by Sanity Display Order */}
          {Object.entries(groupedMeta)
            .sort(([, a]: any, [, b]: any) => a.order - b.order)
            .map(([category, data]: [string, any]) => (
            <div key={category} className="details-block dynamic-meta-block">
              <h3 className="details-subheading">{category}</h3>
              <div className="meta-items-grid">
                {data.items.map((m: any, idx: number) => (
                  <div key={m.metaId || idx} className="meta-item-row">
                    <div className="meta-label-wrap">
                      {m.icon && (
                        <div className="meta-icon-box">
                          <img src={m.icon} alt="" width={18} height={18} />
                        </div>
                      )}
                      <span className="meta-label">{m.longLabel || m.shortLabel}</span>
                    </div>
                    <span className="meta-value">{formatMetaValue(m)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="details-right-col">
          {/* Placeholder for right column content */}
        </div>
      </div>

      {/* Fully synchronized structural contact modal clone */}
      {(() => {
        const handleCloseModal = () => {
          setIsContactModalOpen(false);
          // Exit transition grace delay before wiping state
          setTimeout(() => {
            setSubmitSuccess(null);
            setIsSubmitting(false);
          }, 450);
        };

        return (
          <ContactModal
            isOpen={isContactModalOpen}
            onClose={handleCloseModal}
            title={submitSuccess ? "" : (locale === 'es' ? 'Solicitar Asesoramiento' : 'Request Guidance')}
            subtitle={submitSuccess ? "" : property.title}
            footer={
              submitSuccess ? (
                <Button 
                  type="button" 
                  variant="dark" 
                  label={dict?.contact?.success?.close || (locale === 'es' ? 'Volver al inicio' : 'Back to start')} 
                  className="form-submit-btn"
                  onClick={handleCloseModal}
                />
              ) : (
                <Button 
                  type="submit" 
                  form="contact-modal-general-form"
                  variant="dark" 
                  label={isSubmitting ? (dict?.contact?.sending || (locale === 'es' ? 'Enviando...' : 'Sending...')) : (dict?.contact?.general?.submit || (locale === 'es' ? 'ENVIAR MENSAJE' : 'SEND MESSAGE'))} 
                  className="form-submit-btn" 
                  showArrow={!isSubmitting}
                  disabled={isSubmitting}
                />
              )
            }
          >
        <ContactCard
          dict={dict}
          initialStep="general"
          allowBack={false}
          isInsideExternalModal={true}
          onSubmittingChange={setIsSubmitting}
          onSubmitSuccessChange={setSubmitSuccess}
          submitSuccess={submitSuccess}
          presetMessage={requestGuidancePresetMessage ? requestGuidancePresetMessage.replace(/{{property_title}}/g, property.title).replace(/{{property_link}}/g, pageUrl) : ''}
          whatsappNumber={whatsappNumber}
          whatsappMessageTemplate={whatsappMessageTemplate ? whatsappMessageTemplate.replace(/{{property_title}}/g, property.title).replace(/{{property_link}}/g, pageUrl) : undefined}
          showGeneralWhatsApp={!hideRequestGuidanceWhatsApp}
        />
        </ContactModal>
        );
      })()}
    </section>
  );
}
