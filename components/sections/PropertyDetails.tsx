'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PortableText } from 'next-sanity';
import PropertyMap from '@/components/ui/Map';
import Button from '@/components/ui/Button';
import ContactModal from '@/components/ui/ContactModal';
import PropertyContactCard from './PropertyContactCard';
import { smoothScrollToAnchor } from '@/lib/scroll';
import { urlForImage } from '@/sanity/lib/image';
import { useGalleryModal } from '@/components/providers/GalleryModalContext';
import './PropertyDetails.css';

interface PropertyDetailsProps {
  property: any;
  dict?: any;
  locale?: string;
  whatsappNumber?: string;
  whatsappMessageTemplate?: string;
  propertyContactPresetMessage?: string;
  // ── Offer ──
  offerEnabled?: boolean;
  offerDepositAmount?: number;
  offerConditionsTitle?: string;
  offerConditionsIntro?: string;
  offerConditionsTerms?: string[];
  offerConditionsAccept?: string;
  offerPriceHelper?: string;
  offerConditionsHelper?: string;
}

export default function PropertyDetails({ 
  property, 
  dict, 
  locale = 'en',
  whatsappNumber,
  whatsappMessageTemplate,
  propertyContactPresetMessage,
  offerEnabled = false,
  offerDepositAmount = 500,
  offerConditionsTitle,
  offerConditionsIntro,
  offerConditionsTerms,
  offerConditionsAccept,
  offerPriceHelper,
  offerConditionsHelper,
}: PropertyDetailsProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [pageUrl, setPageUrl] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { openModal } = useGalleryModal();

  const descriptionRef = useRef<HTMLDivElement>(null);
  
  const estimatedLength = useMemo(() => {
    if (!property?.description || !Array.isArray(property.description)) return 0;
    return property.description.reduce((acc: number, block: any) => {
      if (block?.children && Array.isArray(block.children)) {
        return acc + block.children.reduce((cAcc: number, child: any) => cAcc + (child?.text?.length || 0), 0);
      }
      return acc;
    }, 0);
  }, [property?.description]);

  const [showToggle, setShowToggle] = useState(estimatedLength > 400);

  useEffect(() => {
    const checkHeight = () => {
      if (descriptionRef.current) {
        setShowToggle(descriptionRef.current.scrollHeight > 200);
      }
    };
    checkHeight();
    
    if (typeof ResizeObserver !== 'undefined' && descriptionRef.current) {
      const observer = new ResizeObserver(checkHeight);
      observer.observe(descriptionRef.current);
      return () => observer.disconnect();
    } else {
      window.addEventListener('resize', checkHeight);
      return () => window.removeEventListener('resize', checkHeight);
    }
  }, [property?.description]);

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
    : dict?.properties?.price_upon_request;

  const statusLabel = (() => {
    const raw = property?.status?.toLowerCase();
    if (raw === 'sold') return dict?.property?.status_sold;
    if (raw === 'reserved') return dict?.property?.status_reserved;
    return dict?.property?.status_for_sale;
  })();

  // Group meta by category
  const finalMeta = property.meta || [];
  const groupedMeta = finalMeta.reduce((acc: any, curr: any) => {
    const cat = curr.category || dict?.property?.other_details;
    const order = curr.overviewCategoryOrder ?? curr.categoryOrder ?? 999;
    const itemsSortOrder = curr.overviewItemsSortOrder ?? 'custom';

    if (!acc[cat]) {
      acc[cat] = { items: [], order, itemsSortOrder };
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
        baseVal = m.booleanValue ? dict?.common?.yes : dict?.common?.no;
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
                {dict?.property?.description_title}
              </h2>
              <div 
                ref={descriptionRef}
                className={`portable-text-wrapper ${(!showToggle || isDescriptionExpanded) ? 'expanded' : 'collapsed'}`}
              >
                <PortableText value={property.description} />
              </div>
              
              {showToggle && (
                <div className="description-toggle-wrapper">
                  <Button
                    label={isDescriptionExpanded ? dict?.property?.see_less : dict?.property?.see_more}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDescriptionExpanded(!isDescriptionExpanded);
                    }}
                    variant="link-dark"
                    size="sm"
                  />
                </div>
              )}
              
              {/* COMMENTED OUT: property-quick-links section
              {((quickLinks && quickLinks.length > 0) || useRequestGuidance) && (
                <div className="property-quick-links">
                  {/* Dynamically rendered editorial links *\/}
                  {quickLinks?.map((ql: any, qIdx: number) => (
                    <Button
                      key={qIdx}
                      label={ql.label}
                      href={ql.link || '#'}
                      onClick={(e) => handleQuickLinkClick(e, ql.link)}
                      variant="link-dark"
                      size="sm"
                    />
                  ))}

                  {/* Fixed optional guidance direct modal trigger *\/}
                  {useRequestGuidance && (
                    <Button
                      label={(dict?.contact?.request_guidance || 'Request Guidance').toUpperCase()}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsContactModalOpen(true);
                      }}
                      variant="link-dark"
                      size="sm"
                    />
                  )}
                </div>
              )}
              */}
            </div>
          )}

          {/* 2. Basic Meta - COMMENTED OUT - New Property Overview below */}
          {/* <div className="details-block basic-meta-block">
            <h2 className="details-heading">
              {dict?.property?.basics_title || 'Property Overview'}
            </h2>
            <div className="meta-grid-container">
              <div className="meta-info-item info-price">
                <span className="meta-info-label">{dict?.property?.price_label || 'Price'}</span>
                <span className="meta-info-value">{price}</span>
              </div>
              <div className="meta-info-item info-type">
                <span className="meta-info-label">{dict?.property?.type_label || 'Property Type'}</span>
                <span className="meta-info-value">{property.category?.title || '—'}</span>
              </div>
              <div className="meta-info-item info-address">
                <span className="meta-info-label">{dict?.property?.address_label || 'Address'}</span>
                <span className="meta-info-value">{property.address || '—'}</span>
              </div>
              <div className="meta-info-item info-updated">
                <span className="meta-info-label">{dict?.property?.status_label || 'Status'}</span>
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
          </div> */}

          {/* 2. NEW Property Overview */}
          <div className="details-block property-overview-block">
            <h2 className="details-heading">
              {dict?.property?.basics_title}
            </h2>
            <div className="property-overview-grid">
              {Object.entries(groupedMeta)
                .sort(([, a]: any, [, b]: any) => a.order - b.order)
                .map(([category, data]: [string, any]) => (
                  <div key={category} className="overview-category">
                    <h3 className="overview-category-title">{category}</h3>
                    <ul className="overview-items-list">
                      {[...data.items]
                        .sort((a: any, b: any) => {
                          if (data.itemsSortOrder === 'alphabetical') {
                            const labelA = (a.shortLabel || a.longLabel || '').toLowerCase();
                            const labelB = (b.shortLabel || b.longLabel || '').toLowerCase();
                            return labelA.localeCompare(labelB);
                          }
                          // Default: custom displayOrder
                          return (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
                        })
                        .map((m: any, idx: number) => {
                        // For boolean values
                        if (m.valueType === 'boolean') {
                          // Only show if true
                          if (m.booleanValue === true) {
                            return (
                              <li key={m.metaId || idx} className="overview-item">
                                {m.shortLabel || m.longLabel}
                              </li>
                            );
                          }
                          return null;
                        }
                        
                        // For non-boolean values
                        const formattedValue = formatMetaValue(m);
                        if (formattedValue === '—') return null;
                        
                        if (m.valueType === 'string') {
                          return (
                            <li key={m.metaId || idx} className="overview-item">
                              {formattedValue}
                            </li>
                          );
                        }
                        
                        const label = m.shortLabel || m.longLabel;
                        
                        return (
                          <li key={m.metaId || idx} className="overview-item">
                            {formattedValue} {label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
            </div>
            
            <div className="property-last-updated">
              {dict?.property?.updated_label}: {formatDate(property._updatedAt)}
            </div>
            
            {property.location?.coordinates?.lat && property.location?.coordinates?.lng && (
              <div className="property-map-container">
                <PropertyMap
                  lat={property.location.coordinates.lat}
                  lng={property.location.coordinates.lng}
                  title={property.title}
                />
                <div className="property-location-info">
                  {property.address && (
                    <p className="property-location-address">
                      {property.address}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.location.coordinates.lat},${property.location.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="property-location-link"
                  >
                    <span>{dict?.contact?.viewOnMap}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -960 960 960"
                      className="property-location-link-icon"
                      fill="currentColor"
                    >
                      <path d="m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
            
            {/* Virtual Tours */}
            {(() => {
              const clean = (str: any) => typeof str === 'string' ? str.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : str;
              const virtualTours = (property.gallery || []).filter((g: any) => 
                g._type === 'galleryGroup' && clean(g.mediaType) === 'virtualTour'
              );
              
              if (virtualTours.length === 0) return null;
              
              return (
                <div className="property-virtual-tours">
                  {virtualTours.map((tour: any, index: number) => (
                    <button
                      key={tour._key || index}
                      onClick={() => openModal(tour)}
                      className="virtual-tour-item"
                      type="button"
                    >
                      {tour.thumbnail?.asset && (
                        <img
                          src={urlForImage(tour.thumbnail).url()}
                          alt={tour.title || 'Virtual Tour'}
                          className="virtual-tour-thumbnail"
                        />
                      )}
                      <div className="virtual-tour-overlay">
                        <div className="virtual-tour-icon">
                          <img src="/icons/360-degrees.svg" alt="Virtual Tour" width="64" height="64" />
                        </div>
                      </div>
                      {tour.title && (
                        <div className="virtual-tour-title">{tour.title}</div>
                      )}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

        </div>

        <div className="property-details-right-col" id="contact">
          {/* Custom PropertyContactCard in right column with optional Offer CTA */}
          <PropertyContactCard
            dict={dict}
            locale={locale}
            whatsappNumber={whatsappNumber}
            showWhatsApp={true}
            presetMessage={propertyContactPresetMessage}
            whatsappMessageTemplate={whatsappMessageTemplate ? whatsappMessageTemplate.replace(/{{property_title}}/g, property.title || '').replace(/{{property_link}}/g, pageUrl) : ''}
            offerEnabled={offerEnabled}
            offerDepositAmount={offerDepositAmount}
            propertyId={property._id || ''}
            propertySlug={property.propertyCode}
            propertyTitle={property.title || ''}
            propertyCode={property.propertyCode}
            propertyPrice={property.price}
            offerConditionsTitle={offerConditionsTitle}
            offerConditionsIntro={offerConditionsIntro}
            offerConditionsTerms={offerConditionsTerms}
            offerConditionsAccept={offerConditionsAccept}
            offerPriceHelper={offerPriceHelper}
            offerConditionsHelper={offerConditionsHelper}
          />
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
            title={submitSuccess ? "" : dict?.contact?.request_guidance}
            subtitle={submitSuccess ? "" : property.title}
            footer={
              submitSuccess ? (
                <Button 
                  type="button" 
                  variant="dark" 
                  label={dict?.contact?.success?.close} 
                  className="form-submit-btn"
                  onClick={handleCloseModal}
                />
              ) : (
                <Button 
                  type="submit" 
                  form="contact-modal-general-form"
                  variant="dark" 
                  label={isSubmitting ? dict?.contact?.sending : dict?.contact?.general?.submit} 
                  className="form-submit-btn" 
                  showArrow={!isSubmitting}
                  disabled={isSubmitting}
                />
              )
            }
          >
        <PropertyContactCard
          dict={dict}
          locale={locale}
          isInsideModal={true}
          onSubmittingChange={setIsSubmitting}
          onSubmitSuccess={setSubmitSuccess}
          submitSuccess={submitSuccess}
          presetMessage={propertyContactPresetMessage}
          whatsappMessageTemplate={whatsappMessageTemplate ? whatsappMessageTemplate.replace(/{{property_title}}/g, property.title || '').replace(/{{property_link}}/g, pageUrl) : ''}
          whatsappNumber={whatsappNumber}
          showWhatsApp={true}
          propertyId={property._id || ''}
          propertySlug={property.propertyCode}
          propertyTitle={property.title || ''}
          propertyCode={property.propertyCode}
          propertyPrice={property.price}
        />
        </ContactModal>
        );
      })()}
    </section>
  );
}
