'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './FooterSection.css';
import { HEADER_LETTERS } from '@/lib/letters';

interface FooterLink {
  label: string;
  link: string;
  icon?: string;
}

interface FooterSubgroup {
  title?: string;
  links: FooterLink[];
}

interface FooterColumn {
  title: string;
  dynamicSource?: string;
  subgroups: FooterSubgroup[];
}

interface FooterData {
  columns: FooterColumn[];
  legalLinks: FooterLink[];
  copyright: string;
  disclaimer: string;
  socialLinks?: FooterLink[];
}

interface PropertyCategory {
  slug: string;
  title: string;
}

const FooterSection = ({
  data,
  variant,
  propertyCategories,
  locale,
}: {
  data?: FooterData;
  variant?: 'default' | 'compact';
  propertyCategories?: PropertyCategory[];
  locale?: string;
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const pathname = usePathname();

  // If no data, render nothing or a minimal skeleton to avoid layout shifts
  if (!data || !data.columns) return null;

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const isHomepage = !pathname || pathname === '/' || /^\/[a-zA-Z]{2}(\/)?$/.test(pathname);
  const resolvedVariant = variant || (isHomepage ? 'default' : 'compact');

  // Resolve the effective locale from path or prop
  const resolvedLocale = locale || pathname?.split('/')[1] || 'en';
  const propertiesPath = resolvedLocale === 'es' ? 'propiedades' : 'properties';

  // Build resolved columns: replace dynamicSource columns with real data
  const resolvedColumns = data.columns.map((column) => {
    if (column.dynamicSource === 'propertyCategories' && propertyCategories?.length) {
      return {
        ...column,
        subgroups: [{
          title: undefined,
          links: propertyCategories.map((cat) => ({
            label: cat.title,
            link: `/${resolvedLocale}/${propertiesPath}?categories=${encodeURIComponent(cat.slug)}`,
          })),
        }],
      };
    }
    return column;
  });

  return (
    <footer className={`footer-section ${resolvedVariant === 'compact' ? 'compact' : ''}`}>
      <div className="footer-container">
        <div className="footer-grid">
          {resolvedColumns.map((column, colIdx) => (
            <div key={colIdx} className={`footer-column ${openIndex === colIdx ? 'is-open' : ''}`}>
              <h3 className="footer-column-title" onClick={() => toggleAccordion(colIdx)}>
                {column.title}
                <div className="accordion-icon"><span></span><span></span></div>
              </h3>
              <div className="footer-column-content">
                <div className="footer-column-inner">
                  {column.subgroups?.map((subgroup, subIdx) => (
                    <div key={subIdx} className="footer-subgroup">
                      {subgroup.title && <h4 className="footer-subgroup-title">{subgroup.title}</h4>}
                      <ul className="footer-links">
                        {subgroup.links?.map((link, linkIdx) => (
                          <li key={linkIdx}>
                            <Link href={link.link || '#'}>{link.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-top">
            <div className="footer-logo">
              <div className="footer-logo-letters">
                {HEADER_LETTERS.map((letter, i) => (
                  <img key={i} src={letter.svg} alt="" className="footer-logo-letter" />
                ))}
              </div>
            </div>
            <div className="footer-social">
              {data.socialLinks?.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.link || '#'} 
                  className="social-link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  {social.icon ? (
                    <img src={social.icon} alt={social.label} width={20} height={20} />
                  ) : (
                    <span>{social.label}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-legal-row">
            <div className="footer-legal-links">
              {data.legalLinks?.map((link, idx) => (
                <Link key={idx} href={link.link || '#'}>{link.label}</Link>
              ))}
            </div>

            <div className="footer-copyright">
              {data.copyright}
            </div>
          </div>

          <div className="footer-disclaimer">
            {data.disclaimer}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
