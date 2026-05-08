'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import Button from '../ui/Button';
import { getMunicipalities } from '../../lib/municipalities';
import './FilterSidebar.css';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
  dict?: any;
  meta?: any;
  activeFilters?: {
    priceMin: number;
    priceMax: number;
    municipalities: string[];
    metaFilters: Record<string, any>;
  };
  onApplyFilters?: (filters: {
    priceMin: number;
    priceMax: number;
    municipalities: string[];
    metaFilters: Record<string, any>;
  }) => void;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  locale = 'en',
  dict,
  meta,
  activeFilters,
  onApplyFilters
}: FilterSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Mandatory Price Range State (reads highest price dynamically from meta)
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(3500000);

  // 2. Dynamic Sanity-driven Filter Values State
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // Helper to format numeric values with thousand commas (e.g., 2,000,000)
  const formatNumberWithCommas = (num: number): string => {
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('en-US');
  };

  // Helper to parse comma-separated string back to raw number
  const parseCommasToNumber = (val: string): number => {
    const clean = val.replace(/,/g, '');
    const num = Number(clean);
    return isNaN(num) ? 0 : num;
  };

  // Sync priceMax once meta is loaded
  const dbMaxPrice = meta?.maxPrice ?? 5000000;
  useEffect(() => {
    if (meta?.maxPrice !== undefined) {
      setPriceMax(meta.maxPrice);
    }
  }, [meta?.maxPrice]);

  // 3. Searchable Multi-Select Municipality States
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>([]);
  const [municipalitiesList, setMunicipalitiesList] = useState<string[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState<boolean>(true);
  const [municipalitySearch, setMunicipalitySearch] = useState<string>('');
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);

  // Load municipalities from GeoNames on component mount
  useEffect(() => {
    async function load() {
      try {
        const list = await getMunicipalities();
        setMunicipalitiesList(list);
      } catch (err) {
        console.error('Error loading municipalities from GeoNames:', err);
      } finally {
        setLoadingMunicipalities(false);
      }
    }
    load();
  }, []);

  // Sync with activeFilters from parent when sidebar is opened
  useEffect(() => {
    if (isOpen && activeFilters) {
      setPriceMin(activeFilters.priceMin);
      setPriceMax(activeFilters.priceMax);
      setSelectedMunicipalities(activeFilters.municipalities);
      setFilterValues(activeFilters.metaFilters);
    }
  }, [isOpen, activeFilters]);

  useEffect(() => {
    if (isAccordionOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isAccordionOpen]);

  const filteredMunicipalities = municipalitiesList.filter((mun) =>
    mun.toLowerCase().includes(municipalitySearch.toLowerCase())
  );

  const toggleMunicipality = (mun: string) => {
    setSelectedMunicipalities((prev) =>
      prev.includes(mun) ? prev.filter((m) => m !== mun) : [...prev, mun]
    );
  };

  // Parse Sanity filter definitions dynamically
  const filterableDefs = (meta?.definitions || [])
    .filter((def: any) => def?.filter?.isFilterable === true)
    .sort((a: any, b: any) => (a?.filter?.filterOrder || 0) - (b?.filter?.filterOrder || 0));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const tl = gsap.timeline();
      tl.set(sidebarRef.current, { display: 'flex' });
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0);
      tl.fromTo(
        contentRef.current,
        { x: '100%', filter: 'blur(10px)' },
        { x: '0%', filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' },
        0.05
      );
    } else {
      document.body.style.overflow = '';

      const tl = gsap.timeline({
        onComplete: () => {
          if (sidebarRef.current) sidebarRef.current.style.display = 'none';
        }
      });
      tl.to(contentRef.current, { x: '100%', filter: 'blur(5px)', duration: 0.4, ease: 'power2.in' });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.1);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        priceMin,
        priceMax,
        municipalities: selectedMunicipalities,
        metaFilters: filterValues
      });
    }
    onClose();
  };

  const handleResetAll = () => {
    setPriceMin(0);
    setPriceMax(dbMaxPrice);
    setSelectedMunicipalities([]);
    setFilterValues({});
    if (onApplyFilters) {
      onApplyFilters({
        priceMin: 0,
        priceMax: dbMaxPrice,
        municipalities: [],
        metaFilters: {}
      });
    }
  };

  return (
    <div className="filter-sidebar-container" ref={sidebarRef} style={{ display: 'none' }}>
      <div className="filter-sidebar-overlay global-overlay" ref={overlayRef} onClick={handleOverlayClick} />
      
      <div className="filter-sidebar-content" ref={contentRef} data-lenis-prevent="true">
        {/* Header */}
        <div className="filter-sidebar-header">
          <div>
            <h3 className="filter-sidebar-title">
              {dict?.filter?.title}
            </h3>
            <p className="filter-sidebar-subtitle">
              {dict?.filter?.subtitle}
            </p>
          </div>
          <button className="filter-sidebar-close" onClick={onClose} aria-label="Close">
            <img src="/icons/close.svg" alt="Close" width="20" height="20" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="filter-sidebar-body" data-lenis-prevent="true">

          {/* ─── A. MANDATORY PRICE RANGE (NON-SANITY) ─── */}
          <div className="filter-group">
            <p className="filter-group-label">
              {dict?.filter?.price_range}
            </p>
            <div className="price-inputs-row">
              <div className="price-input-box">
                <span className="price-currency">€</span>
                <input 
                  type="text" 
                  value={formatNumberWithCommas(priceMin)} 
                  onChange={(e) => setPriceMin(parseCommasToNumber(e.target.value))}
                  placeholder="Min"
                />
              </div>
              <div className="price-divider">—</div>
              <div className="price-input-box">
                <span className="price-currency">€</span>
                <input 
                  type="text" 
                  value={formatNumberWithCommas(priceMax)} 
                  onChange={(e) => setPriceMax(parseCommasToNumber(e.target.value))}
                  placeholder="Max"
                />
              </div>
            </div>
            
            <div className="range-slider-wrapper">
              <input 
                type="range" 
                min="0" 
                max={dbMaxPrice} 
                step="50000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="range-slider-input"
              />
              <div className="range-track-bar">
                <div 
                  className="range-active-fill" 
                  style={{ width: `${Math.min(100, (priceMax / dbMaxPrice) * 100)}%` }}
                />
              </div>
              <div className="slider-value-display">
                {dict?.filter?.up_to} €{priceMax.toLocaleString()}
              </div>
            </div>
          </div>

          {/* ─── ACCORDION MUNICIPALITIES FILTER ─── */}
          <div className="filter-group municipality-accordion-group">
            <button 
              type="button"
              className={`accordion-trigger ${isAccordionOpen ? 'active' : ''}`}
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <div className="accordion-trigger-left">
                <span className="filter-group-label" style={{ margin: 0 }}>
                  {dict?.filter?.municipalities}
                </span>
                {selectedMunicipalities.length > 0 && (
                  <span className="accordion-selected-count">
                    {selectedMunicipalities.length === 1 
                      ? selectedMunicipalities[0] 
                      : `${selectedMunicipalities.length} ${dict?.filter?.selected}`
                    }
                  </span>
                )}
              </div>
              <div className="accordion-arrow-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {isAccordionOpen && (
              <div className="accordion-content-panel" data-lenis-prevent="true">
                <div className="accordion-search-box">
                  <span className="search-box-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </span>
                  <input 
                    ref={searchInputRef}
                    type="text"
                    value={municipalitySearch}
                    onChange={(e) => setMunicipalitySearch(e.target.value)}
                    placeholder={dict?.filter?.search_placeholder}
                  />
                  {municipalitySearch && (
                    <button 
                      type="button" 
                      className="search-box-clear" 
                      onClick={() => setMunicipalitySearch('')}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="accordion-options-list" data-lenis-prevent="true">
                  {filteredMunicipalities.length === 0 ? (
                    <div className="accordion-empty">
                      {dict?.filter?.no_results}
                    </div>
                  ) : (
                    filteredMunicipalities.map((mun) => {
                      const isChecked = selectedMunicipalities.includes(mun);
                      return (
                        <div 
                          key={mun} 
                          className={`accordion-option-row ${isChecked ? 'selected' : ''}`}
                          onClick={() => toggleMunicipality(mun)}
                        >
                          <div className="custom-checkbox-wrapper">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => {}}
                              className="accordion-checkbox-hidden"
                            />
                            <span className="custom-checkbox-box">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                          </div>
                          <span className="accordion-option-label">{mun}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── B. DYNAMIC SANITY METADATA FILTERS ─── */}
          {filterableDefs.map((def: any) => {
            const filterId = def._id;
            const type = def.filter?.filterType;
            const label = def.shortLabel || def.longLabel || 'Filter';
            const unit = def.unit ? ` ${def.unit}` : '';

            // 1. RANGE SLIDER WITH MANUAL AND AUTOMATIC MAX MODES
            if (type === 'rangeSlider') {
              const min = def.filter?.rangeMin ?? 0;
              // Determine dynamic max based on useAutomaticMax setting
              const max = def.filter?.useAutomaticMax === true
                ? (def.autoMax ?? def.filter?.rangeMax ?? 1000)
                : (def.filter?.rangeMax ?? 1000);
              const step = def.filter?.rangeStep ?? 1;
              const currentValue = filterValues[filterId] ?? max;

              return (
                <div className="filter-group" key={filterId}>
                  <p className="filter-group-label">{label}</p>
                  <div className="range-slider-wrapper">
                    <input 
                      type="range" 
                      min={min} 
                      max={max} 
                      step={step}
                      value={currentValue}
                      onChange={(e) => setFilterValues(prev => ({ ...prev, [filterId]: Number(e.target.value) }))}
                      className="range-slider-input"
                    />
                    <div className="range-track-bar">
                      <div 
                        className="range-active-fill" 
                        style={{ width: `${Math.min(100, ((currentValue - min) / (max - min)) * 100)}%` }}
                      />
                    </div>
                    <div className="slider-value-display">
                      {locale === 'es' ? 'Hasta' : 'Up to'} {def.filter?.rangePrefix || ''}{currentValue.toLocaleString()}{unit || def.filter?.rangeSuffix || ''}
                    </div>
                  </div>
                </div>
              );
            }

            // 2. PREFIX RANGE (No hardcoded Any, reads entirely from prefixOptions)
            if (type === 'prefixRange') {
              const options = def.filter?.prefixOptions || [];
              const currentValue = filterValues[filterId] ?? options[0]?.value ?? '';

              return (
                <div className="filter-group" key={filterId}>
                  <p className="filter-group-label">{label}</p>
                  <div className="segment-control">
                    {options.map((opt: any, index: number) => {
                      const active = currentValue === opt.value;
                      return (
                        <button 
                          key={`${filterId}-${index}`}
                          className={`segment-btn ${active ? 'active' : ''}`}
                          onClick={() => setFilterValues(prev => ({ ...prev, [filterId]: opt.value }))}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // 3. BOOLEAN SWITCH TOGGLE
            if (type === 'boolean') {
              const currentValue = !!filterValues[filterId];

              return (
                <div className="filter-group" key={filterId}>
                  <div className="toggles-container">
                    <label className="toggle-row">
                      <span className="toggle-label">{label}</span>
                      <div className="toggle-switch-wrapper">
                        <input 
                          type="checkbox" 
                          checked={currentValue}
                          onChange={(e) => setFilterValues(prev => ({ ...prev, [filterId]: e.target.checked }))}
                          className="toggle-checkbox"
                        />
                        <span className="toggle-switch-slider" />
                      </div>
                    </label>
                  </div>
                </div>
              );
            }

            // 4. SINGLE OR MULTI-SELECT CHIPS
            if (type === 'select' || type === 'multiSelect') {
              const options = def.filter?.selectOptions || [];
              const selected = filterValues[filterId] || (type === 'multiSelect' ? [] : '');

              const toggleOption = (opt: string) => {
                if (type === 'multiSelect') {
                  const arr = Array.isArray(selected) ? selected : [];
                  const next = arr.includes(opt) ? arr.filter((x: string) => x !== opt) : [...arr, opt];
                  setFilterValues(prev => ({ ...prev, [filterId]: next }));
                } else {
                  setFilterValues(prev => ({ ...prev, [filterId]: selected === opt ? '' : opt }));
                }
              };

              return (
                <div className="filter-group" key={filterId}>
                  <p className="filter-group-label">{label}</p>
                  <div className="chips-container">
                    {options.map((opt: string) => {
                      const active = type === 'multiSelect' 
                        ? (Array.isArray(selected) && selected.includes(opt))
                        : selected === opt;
                      return (
                        <button 
                          key={`${filterId}-${opt}`} 
                          className={`filter-chip ${active ? 'active' : ''}`}
                          onClick={() => toggleOption(opt)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return null;
          })}

        </div>

        {/* Footer Actions */}
        <div className="filter-sidebar-footer">
          <button 
            className="filter-reset-btn"
            onClick={handleResetAll}
          >
            {dict?.filter?.reset_all}
          </button>
          <Button 
            label={dict?.filter?.apply_filters}
            variant="dark"
            showArrow={true}
            onClick={handleApply}
            className="filter-apply-btn"
          />
        </div>
      </div>
    </div>
  );
}
