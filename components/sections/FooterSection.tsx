'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './FooterSection.css';
import { HEADER_LETTERS } from '@/lib/letters';

const FooterSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1 */}
          <div className={`footer-column ${openIndex === 0 ? 'is-open' : ''}`}>
            <h3 className="footer-column-title" onClick={() => toggleAccordion(0)}>
              Properties for Sale
              <div className="accordion-icon"><span></span><span></span></div>
            </h3>
            <div className="footer-column-content">
              <div className="footer-column-inner">
                <ul className="footer-links">
                  <li><Link href="/properties?type=penthouse">Penthouses with Terrace</Link></li>
                  <li><Link href="/properties?type=apartment">Apartments</Link></li>
                  <li><Link href="/properties?type=villa">Villas</Link></li>
                  <li><Link href="/properties?type=rustic">Rustic Homes</Link></li>
                  <li><Link href="/properties?type=investment">Investment Properties</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className={`footer-column ${openIndex === 1 ? 'is-open' : ''}`}>
            <h3 className="footer-column-title" onClick={() => toggleAccordion(1)}>
              Main Services
              <div className="accordion-icon"><span></span><span></span></div>
            </h3>

            <div className="footer-column-content">
              <div className="footer-column-inner">
                <div className="footer-subgroup">
                  <h4 className="footer-subgroup-title">Sellers</h4>
                  <ul className="footer-links">
                    <li><Link href="/valuation">Free Property Valuation</Link></li>
                    <li><Link href="/selling-process">Selling Process</Link></li>
                  </ul>
                </div>

                <div className="footer-subgroup">
                  <h4 className="footer-subgroup-title">Buyers</h4>
                  <ul className="footer-links">
                    <li><Link href="/mortgages">Mortgages & Financing</Link></li>
                    <li><Link href="/buying-guide">Buying Guide</Link></li>
                  </ul>
                </div>

                <div className="footer-subgroup">
                  <h4 className="footer-subgroup-title">Investors</h4>
                  <ul className="footer-links">
                    <li><Link href="/investment-opportunities">Investment Opportunities</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className={`footer-column ${openIndex === 2 ? 'is-open' : ''}`}>
            <h3 className="footer-column-title" onClick={() => toggleAccordion(2)}>
              Market & Resources
              <div className="accordion-icon"><span></span><span></span></div>
            </h3>

            <div className="footer-column-content">
              <div className="footer-column-inner">
                <div className="footer-subgroup">
                  <h4 className="footer-subgroup-title">Market Data</h4>
                  <ul className="footer-links">
                    <li><Link href="/insights">Tenerife Insights</Link></li>
                    <li><Link href="/euribor">Current Euribor Rate</Link></li>
                  </ul>
                </div>

                <div className="footer-subgroup">
                  <h4 className="footer-subgroup-title">Resources</h4>
                  <ul className="footer-links">
                    <li><Link href="/faqs">FAQs</Link></li>
                    <li><Link href="/news">News & Blog</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4 */}
          <div className={`footer-column ${openIndex === 3 ? 'is-open' : ''}`}>
            <h3 className="footer-column-title" onClick={() => toggleAccordion(3)}>
              About REALVILLA
              <div className="accordion-icon"><span></span><span></span></div>
            </h3>

            <div className="footer-column-content">
              <div className="footer-column-inner">
                <div className="footer-subgroup">
                  <h4 className="footer-subgroup-title">The Agency</h4>
                  <ul className="footer-links">
                    <li><Link href="/about">About Us</Link></li>
                    <li><Link href="/reviews">Client Reviews</Link></li>
                  </ul>
                </div>

                <div className="footer-subgroup">
                  <h4 className="footer-subgroup-title">Support</h4>
                  <ul className="footer-links">
                    <li><Link href="/contact">Contact Us</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
              <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/logo-ig-light.svg" alt="Instagram" width={20} height={20} />
              </a>
              <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/logo-linkedin-light.svg" alt="LinkedIn" width={20} height={20} />
              </a>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-legal-links">
            <Link href="/legal-notice">Aviso legal</Link>
            <Link href="/privacy-policy">Consulta nuestra política de privacidad</Link>
            <Link href="/cookie-policy">Política de cookies</Link>
          </div>

          <div className="footer-copyright">
            © REALVILLA 2026. ALL RIGHTS RESERVED

          </div>

          <div className="footer-disclaimer">
            RealVilla, una marca registrada en Europa, es propiedad exclusiva de REALVILLA INVERSIONES SLU. Con el número de presentación 018875215, esta marca individual de tipo figurativa se fundamenta en MUE e pertenece a la Clase(s) de Niza 36 con clasificación de Viena 27.05.01. El uso no autorizado del nombre o la imagen de RealVilla puede constituir un delito contra la propiedad intelektual, conforme a la legislación vigente. REALVILLA INVERSIONES SLU con CIF B76305887 es una empresa autorizada para la intermediación y gestión inmobiliaria con registros en el RAIC y RAIN. RealVilla, además cuenta con seguros de responsabilidad civil y de caución.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
