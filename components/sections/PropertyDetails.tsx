'use client';

import { PortableText } from 'next-sanity';
import PropertyMap from '@/components/ui/Map';
import './PropertyDetails.css';

interface PropertyDetailsProps {
  property: any;
  dict?: any;
  locale?: string;
}

export default function PropertyDetails({ property, dict, locale = 'en' }: PropertyDetailsProps) {
  if (!property) return null;

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

  // Group dynamic meta by category
  const groupedMeta = (property.meta || []).reduce((acc: any, curr: any) => {
    const cat = curr.category || dict?.property?.other_details || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
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

          {/* 3. Dynamic Grouped Meta */}
          {Object.entries(groupedMeta).map(([category, items]: [string, any]) => (
            <div key={category} className="details-block dynamic-meta-block">
              <h3 className="details-subheading">{category}</h3>
              <div className="meta-items-grid">
                {items.map((m: any, idx: number) => (
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
    </section>
  );
}
