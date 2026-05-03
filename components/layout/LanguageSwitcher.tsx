'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, Locale } from '@/lib/i18n';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname
  const segments = pathname.split('/');
  const currentLocale = segments[1] as Locale;

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Replace the first segment with the new locale
    const newSegments = [...segments];
    newSegments[1] = newLocale;
    const newPathname = newSegments.join('/') || '/';
    
    setIsOpen(false);
    router.push(newPathname);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`language-switcher-wrapper ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
      <button 
        className="lang-current-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
      >
        <span className="lang-label">{currentLocale.toUpperCase()}</span>
        <svg 
          className={`lang-chevron ${isOpen ? 'up' : ''}`} 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className="lang-dropdown">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`lang-option ${currentLocale === locale ? 'active' : ''}`}
          >
            {locale === 'en' ? 'English' : 'Español'}
            {currentLocale === locale && (
              <svg className="lang-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
