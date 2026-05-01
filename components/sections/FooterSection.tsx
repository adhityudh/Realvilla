import React from 'react';
import Image from 'next/image';
import './FooterSection.css';
import { HEADER_LETTERS } from '@/lib/letters';

const FooterSection = () => {
  const totalWidth = HEADER_LETTERS.reduce((acc, l) => acc + l.width, 0);

  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-links-container">
          <div className="footer-link-row">
            <div className="footer-link-category">Properties</div>
            <div className="footer-link-dots"></div>
            <div className="footer-link-items">
              <a href="#" className="footer-link-item">Buy</a>
              <span className="footer-link-slash">/</span>
              <a href="#" className="footer-link-item">Sell</a>
              <span className="footer-link-slash">/</span>
              <a href="#" className="footer-link-item">Invest</a>
              <span className="footer-link-slash">/</span>
              <a href="#" className="footer-link-item">Mortgage</a>
            </div>
          </div>
          <div className="footer-link-row">
            <div className="footer-link-category">Company</div>
            <div className="footer-link-dots"></div>
            <div className="footer-link-items">
              <a href="#" className="footer-link-item">About</a>
              <span className="footer-link-slash">/</span>
              <a href="#" className="footer-link-item">Contact</a>
              <span className="footer-link-slash">/</span>
              <a href="#" className="footer-link-item">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-big-logo-wrapper">
          <div className="footer-big-logo">
            {HEADER_LETTERS.map((letter, i) => (
              <img
                key={i}
                src={letter.svg}
                alt=""
                className="footer-big-letter"
                style={{ width: `${(letter.width / totalWidth) * 100}%` }}
              />
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-left">
            <div className="footer-logo">
              <div className="footer-logo-letters">
                {HEADER_LETTERS.map((letter, i) => (
                  <img key={i} src={letter.svg} alt="" className="footer-logo-letter" />
                ))}
              </div>
            </div>
            <div className="footer-copyright">
              RealVilla 2026. All Rights Reserved
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-social">
              <a href="mailto:luis.villarreal@realvilla.es" className="social-link email-link" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/logo-email-light.svg" alt="Email" width={18} height={18} />
                <span className="email-text">luis.villarreal@realvilla.es</span>
              </a>
              <span className="social-separator">/</span>
              <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/logo-ig-light.svg" alt="Instagram" width={18} height={18} />
              </a>
              <span className="social-separator">/</span>
              <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/logo-linkedin-light.svg" alt="LinkedIn" width={18} height={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
