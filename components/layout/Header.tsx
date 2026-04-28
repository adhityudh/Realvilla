'use client';

import { HEADER_LETTERS, NAV_LINKS } from '@/lib/letters';
import StretchArrow from '@/components/ui/StretchArrow';

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <a href="/" className="header-logo">
          {HEADER_LETTERS.map((letter, i) => (
            <div key={i} className="header-letter" style={{ '--letter-svg': `url('${letter.svg}')`, '--letter-w': letter.width } as React.CSSProperties} />
          ))}
        </a>
        <nav className="header-nav">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="nav-link">{link.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <a href="#" className="btn-book">
            <span>Speak to an Expert</span>
            <StretchArrow />
          </a>
        </div>
        <button className="hamburger" id="hamburgerBtn" aria-label="Menu">
          <span></span><span></span>
        </button>
      </div>
    </header>
  );
}
