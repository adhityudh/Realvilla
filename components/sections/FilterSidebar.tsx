'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import Button from '../ui/Button';
import { getMunicipalities } from '../../lib/municipalities';
import { client } from '@/sanity/lib/client';
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
    categories?: string[];
    metaFilters: Record<string, any>;
  };
  onApplyFilters?: (filters: {
    priceMin: number;
    priceMax: number;
    municipalities: string[];
    categories: string[];
    metaFilters: Record<string, any>;
  }) => void;
  isInline?: boolean;
  municipalities?: string[];
}

const AccordionWrapper = ({ title, isOpen, onToggle, children, countLabel }: any) => (
  <div className={`filter-group filter-accordion-group ${isOpen ? 'active' : ''}`}>
    <button
      type="button"
      className={`accordion-trigger ${isOpen ? 'active' : ''}`}
      onClick={onToggle}
    >
      <div className="accordion-trigger-left">
        <span className="accordion-title">
          {title}
        </span>
        {countLabel && (
          <span className="accordion-active-count">{countLabel}</span>
        )}
      </div>
      <div className="accordion-arrow-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
    {isOpen && (
      <div className="accordion-content-panel" data-lenis-prevent="true">
        {children}
      </div>
    )}
  </div>
);

export default function FilterSidebar({
  isOpen,
  onClose,
  locale = 'en',
  dict,
  meta,
  activeFilters,
  onApplyFilters,
  isInline = false,
  municipalities: externalMunicipalities
}: FilterSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dynamic Sidebar texts from global Sanity settings
  const [sanityFilterTexts, setSanityFilterTexts] = useState<{ title?: string; subtitle?: string }>({});
  useEffect(() => {
    const fetchTexts = async () => {
      try {
        const query = `*[_type == "settings" && (language == $language || (!defined(language) && $language == "en"))][0].filterSidebar`;
        const data = await client.fetch(query, { language: locale });
        if (data) {
          setSanityFilterTexts(data);
        }
      } catch (e) {
        console.error('Failed fetching dynamic filter texts:', e);
      }
    };
    fetchTexts();
  }, [locale]);

  // 1. Mandatory Price Range State (reads highest price dynamically from meta)
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(3500000);

  // 2. Dynamic Standalone Categories State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 3. Dynamic Sanity-driven Filter Values State
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleParentExpanded = (parentId: string) => {
    setExpandedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isGroupOpen = (key: string, defaultOpen = true) => {
    return openGroups[key] !== undefined ? openGroups[key] : defaultOpen;
  };

  const toggleGroup = (key: string, defaultOpen = true) => {
    setOpenGroups(prev => ({
      ...prev,
      [key]: prev[key] !== undefined ? !prev[key] : !defaultOpen
    }));
  };

  // Sync municipalities list from prop or Geo-proxy
  useEffect(() => {
    if (externalMunicipalities && externalMunicipalities.length > 0) {
      setMunicipalitiesList(externalMunicipalities);
      setLoadingMunicipalities(false);
      return;
    }

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
  }, [externalMunicipalities]);

  // Sync with activeFilters from parent when sidebar is opened or rendering inline on desktop
  useEffect(() => {
    if ((isOpen || isInline) && activeFilters) {
      setPriceMin(activeFilters.priceMin);
      setPriceMax(activeFilters.priceMax);
      setSelectedMunicipalities(activeFilters.municipalities);
      setSelectedCategories(activeFilters.categories || []);
      setFilterValues(activeFilters.metaFilters);
    }
  }, [isOpen, isInline, activeFilters]);

  useEffect(() => {
    if (isGroupOpen('municipalities', false)) {
      // Avoid auto-focusing on mobile devices to prevent the virtual keyboard from jumping up
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (!isMobile) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    }
  }, [openGroups]);

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
    .filter((def: any) => def?.filter?.isFilterable === true && def?.valueType !== 'string')
    .sort((a: any, b: any) => (a?.filter?.filterOrder || 0) - (b?.filter?.filterOrder || 0));

  const parentMap = useMemo(() => {
    const map = new Map<string, any[]>();
    filterableDefs.forEach((def: any) => {
      if (def.valueType === 'boolean' && Array.isArray(def.children) && def.children.length > 0) {
        const cleanParent = def._id.replace('drafts.', '');
        const resolvedChildren: any[] = [];
        def.children.forEach((childRef: string) => {
          const cleanChildId = childRef.replace('drafts.', '');
          const childDef = filterableDefs.find((d: any) => d._id.replace('drafts.', '') === cleanChildId);
          if (childDef) {
            resolvedChildren.push(childDef);
          }
        });
        map.set(cleanParent, resolvedChildren);
      }
    });
    return map;
  }, [filterableDefs]);

  const rootFilterableDefs = useMemo(() => {
    const childIds = new Set<string>();
    filterableDefs.forEach((def: any) => {
      if (def.valueType === 'boolean' && Array.isArray(def.children)) {
        def.children.forEach((childRef: string) => {
          childIds.add(childRef.replace('drafts.', ''));
        });
      }
    });

    return filterableDefs.filter((def: any) => {
      const cleanId = def._id.replace('drafts.', '');
      return !childIds.has(cleanId);
    });
  }, [filterableDefs]);

  const categorizedFilters = useMemo(() => {
    const blocks: any[] = [];
    const uncategorized: any[] = [];

    // Create a map of category by title
    const categoryMap = new Map();
    meta?.categories?.forEach((c: any) => categoryMap.set(c.title, c));

    // Sort categories by filterGroupDisplayOrder
    const sortedCategories = [...(meta?.categories || [])].sort((a: any, b: any) =>
      (a.filterGroupDisplayOrder || 0) - (b.filterGroupDisplayOrder || 0)
    );

    const groups: Record<string, any[]> = {};

    rootFilterableDefs.forEach((def: any) => {
      const catTitle = def.category;
      if (catTitle) {
        if (!groups[catTitle]) groups[catTitle] = [];
        groups[catTitle].push(def);
      } else {
        uncategorized.push(def);
      }
    });

    sortedCategories.forEach((cat: any) => {
      if (groups[cat.title]) {
        const sortOrder: string = cat.filterSortOrder || 'default';
        const defs = [...groups[cat.title]].sort((a: any, b: any) => {
          if (sortOrder === 'alphabetical') {
            const aLabel = (a.shortLabel || a.longLabel || '').toLowerCase();
            const bLabel = (b.shortLabel || b.longLabel || '').toLowerCase();
            return aLabel.localeCompare(bLabel);
          }
          // Default: sort by filterOrder
          return (a?.filter?.filterOrder || 0) - (b?.filter?.filterOrder || 0);
        });

        if (cat.ungroupFilters) {
          blocks.push({ type: 'ungrouped', defs, title: cat.title });
        } else {
          blocks.push({ type: 'group', title: cat.title, defs });
        }
        delete groups[cat.title]; // Mark as processed
      }
    });

    Object.keys(groups).forEach(catTitle => {
      blocks.push({ type: 'group', title: catTitle, defs: groups[catTitle] });
    });

    return { blocks, uncategorized };
  }, [rootFilterableDefs, meta?.categories]);

  useEffect(() => {
    if (isInline) {
      if (sidebarRef.current) {
        sidebarRef.current.style.display = 'block';
      }
      return;
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const tl = gsap.timeline();
      tl.set(sidebarRef.current, { display: 'flex' });
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0);
      tl.fromTo(
        contentRef.current,
        { y: 50, opacity: 0, scale: 0.95, filter: 'blur(10px)' },
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' },
        0.1
      );
    } else {
      document.body.style.overflow = '';

      const tl = gsap.timeline({
        onComplete: () => {
          if (sidebarRef.current) sidebarRef.current.style.display = 'none';
        }
      });
      tl.to(contentRef.current, { y: 30, opacity: 0, scale: 0.98, filter: 'blur(5px)', duration: 0.4, ease: 'power2.in' });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.1);
    }
  }, [isOpen, isInline]);

  // 6. Auto-apply filters when in inline/desktop mode (loop-free & debounced to prevent slider jump and endless loading)
  useEffect(() => {
    if (isInline && onApplyFilters && activeFilters) {
      const isPriceMinDiff = priceMin !== activeFilters.priceMin;
      const isPriceMaxDiff = priceMax !== activeFilters.priceMax;

      const isMunDiff =
        selectedMunicipalities.length !== activeFilters.municipalities.length ||
        !selectedMunicipalities.every(m => activeFilters.municipalities.includes(m));

      const isCatDiff =
        selectedCategories.length !== (activeFilters.categories || []).length ||
        !selectedCategories.every(c => (activeFilters.categories || []).includes(c));

      const isMetaDiff = JSON.stringify(filterValues) !== JSON.stringify(activeFilters.metaFilters);

      if (isPriceMinDiff || isPriceMaxDiff || isMunDiff || isCatDiff || isMetaDiff) {
        // Debounce by 500ms to allow smooth dragging and prevent rapid API fetching
        const timer = setTimeout(() => {
          onApplyFilters({
            priceMin,
            priceMax,
            municipalities: selectedMunicipalities,
            categories: selectedCategories,
            metaFilters: filterValues
          });
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [priceMin, priceMax, selectedMunicipalities, selectedCategories, filterValues, isInline, onApplyFilters, activeFilters]);

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
        categories: selectedCategories,
        metaFilters: filterValues
      });
    }
    onClose();
  };

  const handleResetAll = () => {
    setPriceMin(0);
    setPriceMax(dbMaxPrice);
    setSelectedMunicipalities([]);
    setSelectedCategories([]);
    setFilterValues({});
    if (onApplyFilters) {
      onApplyFilters({
        priceMin: 0,
        priceMax: dbMaxPrice,
        municipalities: [],
        categories: [],
        metaFilters: {}
      });
    }
  };

  const renderFilterDef = (def: any, hideLabel = false) => {
    const filterId = def._id;
    const type = def.filter?.filterType;
    const label = def.shortLabel || def.longLabel || dict?.archive?.filter;
    const unit = def.unit ? ` ${def.unit}` : '';

    const cleanId = filterId.replace('drafts.', '');
    const children = parentMap.get(cleanId) || [];
    const hasChildren = children.length > 0;

    if (hasChildren) {
      const isExpanded = !!expandedParents[cleanId];
      const allChecked = children.every(child => !!filterValues[child._id]);
      const someChecked = !allChecked && children.some(child => !!filterValues[child._id]);

      const handleParentToggle = () => {
        setFilterValues(prev => {
          const next = { ...prev };
          children.forEach(child => {
            if (allChecked) {
              delete next[child._id];
            } else {
              next[child._id] = true;
            }
          });
          return next;
        });
      };

      return (
        <div className="filter-parent-group" key={filterId}>
          {/* Parent Header Row */}
          <div className="filter-parent-header-row">
            <div
              className={`filter-parent-checkbox-row ${allChecked ? 'selected' : ''}`}
              onClick={() => toggleParentExpanded(cleanId)}
            >
              <div 
                className="custom-checkbox-wrapper"
                onClick={(e) => {
                  e.stopPropagation();
                  handleParentToggle();
                }}
              >
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = someChecked;
                    }
                  }}
                  onChange={() => { }}
                  className="accordion-checkbox-hidden"
                />
                <span className={`custom-checkbox-box ${someChecked ? 'indeterminate' : ''}`}>
                  {someChecked ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </span>
              </div>

              <span className="accordion-option-label parent-label">
                {label}
              </span>
            </div>

            <button
              type="button"
              className={`filter-parent-expand-btn ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleParentExpanded(cleanId)}
              aria-label="Toggle children"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Children Container */}
          {isExpanded && (
            <div className="filter-children-list">
              {children.map((child: any) => {
                const childId = child._id;
                const childChecked = !!filterValues[childId];
                const childLabel = child.shortLabel || child.longLabel || '';

                return (
                  <div
                    key={childId}
                    className={`accordion-option-row child-row ${childChecked ? 'selected' : ''}`}
                    onClick={() => setFilterValues(prev => {
                      const next = { ...prev };
                      if (childChecked) {
                        delete next[childId];
                      } else {
                        next[childId] = true;
                      }
                      return next;
                    })}
                  >
                    <div className="custom-checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={childChecked}
                        onChange={() => { }}
                        className="accordion-checkbox-hidden"
                      />
                      <span className="custom-checkbox-box">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    </div>
                    <span className="accordion-option-label child-label">
                      {childLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (type === 'rangeSlider') {
      const isDouble = def.filter?.isDoubleSlider === true;
      const min = def.filter?.rangeMin ?? 0;
      const max = def.filter?.useAutomaticMax === true
        ? (def.autoMax ?? def.filter?.rangeMax ?? 1000)
        : (def.filter?.rangeMax ?? 1000);
      const step = def.filter?.rangeStep ?? 1;

      const currentValue = filterValues[filterId];
      let currentMin = min;
      let currentMax = max;

      if (isDouble) {
        currentMin = currentValue?.min ?? min;
        currentMax = currentValue?.max ?? max;
      } else {
        currentMax = currentValue ?? max;
      }

      return (
        <div className="filter-group" key={filterId} style={hideLabel ? { paddingTop: '0.5rem' } : undefined}>
          {!hideLabel && <p className="filter-group-label" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>{label}</p>}
          {isDouble && (
            <div className="price-inputs-row" style={{ marginBottom: '1.25rem' }}>
              <div className="price-input-box">
                {def.filter?.rangePrefix && (
                  <span className="price-currency">{def.filter.rangePrefix}</span>
                )}
                <input
                  type="text"
                  value={formatNumberWithCommas(currentMin)}
                  onChange={(e) => {
                    const parsed = parseCommasToNumber(e.target.value);
                    setFilterValues(prev => ({
                      ...prev,
                      [filterId]: { min: parsed, max: currentMax }
                    }));
                  }}
                  placeholder={dict?.archive?.min || 'Min'}
                />
                {(unit || def.filter?.rangeSuffix) && (
                  <span className="price-currency" style={{ marginLeft: '0.25rem', marginRight: 0 }}>
                    {unit || def.filter.rangeSuffix}
                  </span>
                )}
              </div>
              <div className="price-divider">—</div>
              <div className="price-input-box">
                {def.filter?.rangePrefix && (
                  <span className="price-currency">{def.filter.rangePrefix}</span>
                )}
                <input
                  type="text"
                  value={formatNumberWithCommas(currentMax)}
                  onChange={(e) => {
                    const parsed = parseCommasToNumber(e.target.value);
                    setFilterValues(prev => ({
                      ...prev,
                      [filterId]: { min: currentMin, max: parsed }
                    }));
                  }}
                  placeholder={dict?.archive?.max || 'Max'}
                />
                {(unit || def.filter?.rangeSuffix) && (
                  <span className="price-currency" style={{ marginLeft: '0.25rem', marginRight: 0 }}>
                    {unit || def.filter.rangeSuffix}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="range-slider-wrapper">
            {isDouble && (
              <input
                type="range"
                min={min}
                max={max}
                step="any"
                value={currentMin}
                onChange={(e) => {
                  const rawVal = Number(e.target.value);
                  let val = Math.round(rawVal / step) * step;
                  if (rawVal < min + step / 2) val = min;
                  if (val > currentMax) val = currentMax;
                  setFilterValues(prev => ({ ...prev, [filterId]: { min: val, max: currentMax } }));
                }}
                className="range-slider-input"
              />
            )}
            <input
              type="range"
              min={min}
              max={max}
              step="any"
              value={currentMax}
              onChange={(e) => {
                const rawVal = Number(e.target.value);
                let val = Math.round(rawVal / step) * step;
                if (rawVal > max - step / 2) val = max;

                if (!isDouble) {
                  if (val < min) val = min;
                  setFilterValues(prev => ({ ...prev, [filterId]: val }));
                } else {
                  if (val < currentMin) val = currentMin;
                  setFilterValues(prev => ({ ...prev, [filterId]: { min: currentMin, max: val } }));
                }
              }}
              className="range-slider-input"
            />
            <div className="range-track-bar">
              {isDouble ? (
                <div
                  className="range-active-fill"
                  style={{
                    left: `${((currentMin - min) / (max - min)) * 100}%`,
                    width: `${((currentMax - currentMin) / (max - min)) * 100}%`
                  }}
                />
              ) : (
                <div
                  className="range-active-fill"
                  style={{ width: `${Math.min(100, ((currentMax - min) / (max - min)) * 100)}%` }}
                />
              )}
            </div>
          </div>
          <div className="slider-value-display">
            {isDouble
              ? (currentMin > min
                ? `${def.filter?.rangePrefix || ''}${currentMin.toLocaleString()}${unit || def.filter?.rangeSuffix || ''} - ${def.filter?.rangePrefix || ''}${currentMax.toLocaleString()}${unit || def.filter?.rangeSuffix || ''}`
                : `${dict?.filter?.up_to} ${def.filter?.rangePrefix || ''}${currentMax.toLocaleString()}${unit || def.filter?.rangeSuffix || ''}`)
              : `${dict?.filter?.up_to} ${def.filter?.rangePrefix || ''}${currentMax.toLocaleString()}${unit || def.filter?.rangeSuffix || ''}`
            }
          </div>
        </div>
      );
    }

    if (type === 'prefixRange') {
      const options = def.filter?.prefixOptions || [];
      const val = filterValues[filterId];

      // Find which option is currently active
      const activeOpt = options.find((o: any) =>
        o.isAny ? (val === undefined || val === null || val === '') : (String(o.value) === String(val))
      ) || options[0];

      return (
        <div className="filter-group" key={filterId} style={hideLabel ? { paddingTop: '0.5rem' } : undefined}>
          {!hideLabel && <p className="filter-group-label" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>{label}</p>}
          <div className="segment-control">
            {options.map((opt: any, index: number) => {
              const active = activeOpt === opt;
              return (
                <button
                  key={`${filterId}-${index}`}
                  className={`segment-btn ${active ? 'active' : ''}`}
                  onClick={() => setFilterValues(prev => ({ ...prev, [filterId]: opt.isAny ? '' : opt.value }))}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (type === 'boolean') {
      const currentValue = !!filterValues[filterId];

      return (
        <div className="filter-group" key={filterId} style={{ marginTop: '0.5rem' }}>
          <div className="toggles-container">
            <label className="toggle-row" style={hideLabel ? { justifyContent: 'flex-start' } : undefined}>
              {!hideLabel && <span className="toggle-label">{label}</span>}
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

    if (type === 'checkbox') {
      const currentValue = !!filterValues[filterId];

      return (
        <div className="filter-group" key={filterId}>
          <div
            className={`accordion-option-row ${currentValue ? 'selected' : ''}`}
            onClick={() => setFilterValues(prev => ({ ...prev, [filterId]: !currentValue }))}
          >
            <div className="custom-checkbox-wrapper">
              <input
                type="checkbox"
                checked={currentValue}
                onChange={() => { }}
                className="accordion-checkbox-hidden"
              />
              <span className="custom-checkbox-box">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </div>
            <span className="accordion-option-label" style={{ fontWeight: 500 }}>
              {label}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'select' || type === 'multiSelect') {
      const options = def.filter?.selectOptions || [];
      const selected = filterValues[filterId] || (type === 'multiSelect' ? [] : '');
      const displayStyle = def.selectDisplayType || 'pill';

      const toggleOption = (optVal: string) => {
        if (type === 'multiSelect') {
          const arr = Array.isArray(selected) ? selected : [];
          const next = arr.includes(optVal) ? arr.filter((x: string) => x !== optVal) : [...arr, optVal];
          setFilterValues(prev => ({ ...prev, [filterId]: next }));
        } else {
          setFilterValues(prev => ({ ...prev, [filterId]: selected === optVal ? '' : optVal }));
        }
      };

      const isGrid = displayStyle === 'grid';

      return (
        <div className="filter-group" key={filterId} style={hideLabel ? { paddingTop: '0.5rem' } : undefined}>
          {!hideLabel && <p className="filter-group-label" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>{label}</p>}
          <div className={isGrid ? "chips-grid-wrapper" : "chips-container"}>
            {options.map((opt: any) => {
              const optVal = typeof opt === 'object' && opt !== null ? opt.value : opt;
              const optLabel = typeof opt === 'object' && opt !== null ? opt.label : opt;
              const optIcon = typeof opt === 'object' && opt !== null ? opt.icon : null;

              const active = type === 'multiSelect'
                ? (Array.isArray(selected) && selected.includes(optVal))
                : selected === optVal;

              return (
                <button
                  key={`${filterId}-${optVal}`}
                  className={isGrid ? `filter-grid-btn ${active ? 'active' : ''}` : `filter-chip ${active ? 'active' : ''}`}
                  onClick={() => toggleOption(optVal)}
                >
                  {isGrid && optIcon && (
                    <div className="filter-grid-icon-box">
                      <img src={optIcon} alt={optLabel} className="filter-grid-icon" />
                    </div>
                  )}
                  <span className={isGrid ? "filter-grid-text" : ""}>{optLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const isDefActive = (def: any) => {
    const filterId = def._id;
    const cleanId = filterId.replace('drafts.', '');
    if (parentMap.has(cleanId)) {
      const children = parentMap.get(cleanId) || [];
      return children.some((child: any) => !!filterValues[child._id]);
    }

    const type = def.filter?.filterType;
    const val = filterValues[filterId];

    if (val === undefined) return false;

    if (type === 'rangeSlider') {
      const isDouble = def.filter?.isDoubleSlider === true;
      const max = def.filter?.useAutomaticMax === true
        ? (def.autoMax ?? def.filter?.rangeMax ?? 1000)
        : (def.filter?.rangeMax ?? 1000);
      const min = def.filter?.rangeMin ?? 0;

      if (isDouble) {
        if (!val || typeof val !== 'object') return false;
        return val.min > min || val.max < max;
      }
      return val !== max;
    }
    if (type === 'prefixRange') {
      const options = def.filter?.prefixOptions || [];
      const defaultVal = options[0]?.value ?? '';
      return val !== defaultVal;
    }
    if (type === 'boolean' || type === 'checkbox') {
      return !!val;
    }
    if (type === 'select') {
      return !!val;
    }
    if (type === 'multiSelect') {
      return Array.isArray(val) && val.length > 0;
    }
    return false;
  };

  const getDefActiveCount = (def: any) => {
    const filterId = def._id;
    const cleanId = filterId.replace('drafts.', '');
    if (parentMap.has(cleanId)) {
      const children = parentMap.get(cleanId) || [];
      return children.reduce((sum: number, child: any) => sum + (filterValues[child._id] ? 1 : 0), 0);
    }

    const type = def.filter?.filterType;
    const val = filterValues[filterId];

    if (val === undefined || val === null || val === '') return 0;

    if (type === 'rangeSlider') {
      return isDefActive(def) ? 1 : 0;
    }
    if (type === 'prefixRange') {
      const options = def.filter?.prefixOptions || [];
      const defaultVal = options[0]?.value ?? '';
      return val !== defaultVal ? 1 : 0;
    }
    if (type === 'boolean' || type === 'checkbox') {
      return val ? 1 : 0;
    }
    if (type === 'select') {
      return val ? 1 : 0;
    }
    if (type === 'multiSelect') {
      return Array.isArray(val) ? val.length : 0;
    }
    return 0;
  };

  const getGroupActiveCount = (defs: any[]) => {
    return defs.reduce((sum, def) => sum + getDefActiveCount(def), 0);
  };

  const renderContent = () => {
    const orderedElements: Array<{ order: number; node: React.ReactNode; key: string }> = [];

    // A0. STANDALONE PROPERTY CATEGORIES
    const categoriesList = meta?.standaloneCategories || [];
    if (categoriesList.length > 0) {
      orderedElements.push({
        key: 'categories',
        order: -10, // Forced top location to match legacy behavior
        node: (
          <AccordionWrapper
            key="categories"
            title={locale === 'es' ? 'Tipo de propiedad' : 'Property Type'}
            isOpen={isGroupOpen('categories')}
            onToggle={() => toggleGroup('categories')}
            countLabel={selectedCategories.length > 0 ? selectedCategories.length : undefined}
          >
            <div className="filter-group" style={{ paddingTop: '0.5rem' }}>
              <div className="chips-grid-wrapper">
                {categoriesList.map((cat: any) => {
                  const active = selectedCategories.includes(cat._id);
                  return (
                    <button
                      key={cat._id}
                      className={`filter-grid-btn ${active ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(cat._id)
                            ? prev.filter(c => c !== cat._id)
                            : [...prev, cat._id]
                        );
                      }}
                    >
                      {cat.icon && (
                        <div className="filter-grid-icon-box">
                          <img src={cat.icon} alt={cat.label} className="filter-grid-icon" />
                        </div>
                      )}
                      <span className="filter-grid-text">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </AccordionWrapper>
        )
      });
    }

    // A. PRICE RANGE
    orderedElements.push({
      key: 'price',
      order: 0, // Default reference order
      node: (
        <AccordionWrapper
          key="price"
          title={dict?.filter?.price_range}
          isOpen={isGroupOpen('price')}
          onToggle={() => toggleGroup('price')}
          countLabel={(priceMin > 0 || priceMax < dbMaxPrice) ? 1 : undefined}
        >
          <div className="price-inputs-row">
            <div className="price-input-box">
              <span className="price-currency">€</span>
              <input
                type="text"
                value={formatNumberWithCommas(priceMin)}
                onChange={(e) => setPriceMin(parseCommasToNumber(e.target.value))}
                placeholder={dict?.archive?.min}
              />
            </div>
            <div className="price-divider">—</div>
            <div className="price-input-box">
              <span className="price-currency">€</span>
              <input
                type="text"
                value={formatNumberWithCommas(priceMax)}
                onChange={(e) => setPriceMax(parseCommasToNumber(e.target.value))}
                placeholder={dict?.archive?.max}
              />
            </div>
          </div>
          <div className='filter-group'>
            <div className="range-slider-wrapper">
              <input
                type="range"
                min="0"
                max={dbMaxPrice}
                step="any"
                value={priceMin}
                onChange={(e) => {
                  const rawVal = Number(e.target.value);
                  let val = Math.round(rawVal / 50000) * 50000;
                  if (rawVal < 25000) val = 0;
                  if (val > priceMax) val = priceMax;
                  setPriceMin(val);
                }}
                className="range-slider-input"
              />
              <input
                type="range"
                min="0"
                max={dbMaxPrice}
                step="any"
                value={priceMax}
                onChange={(e) => {
                  const rawVal = Number(e.target.value);
                  let val = Math.round(rawVal / 50000) * 50000;
                  if (rawVal > dbMaxPrice - 25000) val = dbMaxPrice;
                  if (val < priceMin) val = priceMin;
                  setPriceMax(val);
                }}
                className="range-slider-input"
              />
              <div className="range-track-bar">
                <div
                  className="range-active-fill"
                  style={{
                    left: `${(priceMin / dbMaxPrice) * 100}%`,
                    width: `${((priceMax - priceMin) / dbMaxPrice) * 100}%`
                  }}
                />
              </div>
            </div>
            <div className="slider-value-display">
              {priceMin > 0
                ? `€${priceMin.toLocaleString()} - €${priceMax.toLocaleString()}`
                : `${dict?.filter?.up_to} €${priceMax.toLocaleString()}`
              }
            </div>
          </div>
        </AccordionWrapper>
      )
    });

    // B. MUNICIPALITIES
    orderedElements.push({
      key: 'municipalities',
      order: 1, // Default reference order
      node: (
        <AccordionWrapper
          key="municipalities"
          title={dict?.filter?.municipalities}
          isOpen={isGroupOpen('municipalities', false)}
          onToggle={() => toggleGroup('municipalities', false)}
          countLabel={selectedMunicipalities.length > 0 ? selectedMunicipalities.length : undefined}
        >
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
                        onChange={() => { }}
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
        </AccordionWrapper>
      )
    });

    // C. DYNAMIC SANITY METADATA FILTERS
    categorizedFilters.blocks.forEach((block: any) => {
      if (block.type === 'ungrouped') {
        // Push each individual element from the ungrouped category so they can float independently by order
        block.defs.forEach((def: any) => {
          orderedElements.push({
            key: `meta-${def._id}`,
            order: def.filter?.filterOrder ?? 10,
            node: (
              <AccordionWrapper
                key={def._id}
                title={def.shortLabel || def.longLabel}
                isOpen={isGroupOpen(def._id)}
                onToggle={() => toggleGroup(def._id)}
                countLabel={getDefActiveCount(def) || undefined}
              >
                {renderFilterDef(def, true)}
              </AccordionWrapper>
            )
          });
        });
      } else {
        // Standard Grouped block
        const catObj = meta?.categories?.find((c: any) => c.title === block.title);
        const blockOrder = catObj?.filterGroupDisplayOrder ?? 10;
        const count = getGroupActiveCount(block.defs);

        orderedElements.push({
          key: `cat-${block.title}`,
          order: blockOrder,
          node: (
            <AccordionWrapper
              key={block.title}
              title={block.title}
              isOpen={isGroupOpen(block.title)}
              onToggle={() => toggleGroup(block.title)}
              countLabel={count > 0 ? count : undefined}
            >
              {block.defs.map((def: any) => renderFilterDef(def))}
            </AccordionWrapper>
          )
        });
      }
    });

    // D. UNCATEGORIZED
    if (categorizedFilters.uncategorized.length > 0) {
      // Let individual uncategorized items flow with their specific orders as well!
      categorizedFilters.uncategorized.forEach((def: any) => {
        orderedElements.push({
          key: `uncat-${def._id}`,
          order: def.filter?.filterOrder ?? 10,
          node: (
            <AccordionWrapper
              key={def._id}
              title={def.shortLabel || def.longLabel}
              isOpen={isGroupOpen(def._id)}
              onToggle={() => toggleGroup(def._id)}
              countLabel={getDefActiveCount(def) || undefined}
            >
              {renderFilterDef(def, true)}
            </AccordionWrapper>
          )
        });
      });
    }

    // Perform Final Collective Sorting
    orderedElements.sort((a, b) => a.order - b.order);

    return (
      <div className={`filter-sidebar-container ${isInline ? 'is-inline' : ''}`} ref={sidebarRef} style={{ display: isInline ? 'block' : 'none' }}>
        {!isInline && (
          <div
            className="filter-sidebar-overlay global-overlay"
            ref={overlayRef}
            onClick={handleOverlayClick}
            style={{ backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }}
          />
        )}

        <div className="filter-sidebar-content" ref={contentRef} data-lenis-prevent="true">
          {/* Header */}
          <div className="filter-sidebar-header">
            <div>
              <h3 className="filter-sidebar-title">
                {sanityFilterTexts.title || dict?.filter?.title}
              </h3>
              <p className="filter-sidebar-subtitle">
                {sanityFilterTexts.subtitle || dict?.filter?.subtitle}
              </p>
            </div>
            <button className="filter-sidebar-close" onClick={onClose} aria-label="Close">
              <img src="/icons/close.svg" alt="Close" width="20" height="20" />
            </button>
          </div>

          {/* Scrollable Filters Body (Now Sorted Verbally) */}
          <div className="filter-sidebar-body" data-lenis-prevent="true">
            {orderedElements.map(el => el.node)}
          </div>

          {/* Footer Actions */}
          {!isInline && (
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
          )}
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  if (isInline) {
    return renderContent();
  }

  return createPortal(renderContent(), document.body);
}
