'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { client } from '@/sanity/lib/client';
import { PROPERTY_META_QUERY, PROPERTY_CARD_FIELDS } from '@/sanity/lib/queries';
import { sanitizeSanityData } from '@/lib/sanitize';
import PropertyCard from '../ui/PropertyCard';
import Button from '../ui/Button';
import FilterSidebar from './FilterSidebar';
import PropertiesMap from '../ui/PropertiesMap';
import { fetchMunicipalities } from '@/lib/geonames';
import './SearchModal.css';
import './BuyPropertiesSection.css';
import './PropertiesArchivePage.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface PropertiesArchivePageProps {
  dict?: any;
  initialMeta?: any;
  initialProperties?: any[];
  initialTotalCount?: number;
}

export default function PropertiesArchivePage({ 
  dict, 
  initialMeta,
  initialProperties,
  initialTotalCount
}: PropertiesArchivePageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const hasRunInitialFetch = useRef<boolean>(false);

  const [properties, setProperties] = useState<any[]>(initialProperties || []);
  const [mapProperties, setMapProperties] = useState<any[]>([]);
  const [mapLoading, setMapLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount || 0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(!initialProperties);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [filterMeta, setFilterMeta] = useState<any>(initialMeta || null);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(searchParams.get('search') || '');

  const [orderBy, setOrderBy] = useState<string>(searchParams.get('orderBy') || '_createdAt desc');
  const [activeFilters, setActiveFilters] = useState<{
    priceMin: number;
    priceMax: number;
    municipalities: string[];
    categories: string[];
    metaFilters: Record<string, any>;
  }>(() => {
    const municipalities = searchParams.get('municipalities')?.split(',').filter(Boolean) || [];
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const priceMin = Number(searchParams.get('priceMin')) || 0;
    const priceMax = Number(searchParams.get('priceMax')) || (initialMeta?.maxPrice || 5000000);
    
    let metaFilters = {};
    const metaStr = searchParams.get('meta');
    if (metaStr) {
      try {
        metaFilters = JSON.parse(metaStr);
      } catch (e) {
        console.error('Failed to parse meta filters from URL', e);
      }
    }

    return {
      priceMin,
      priceMax,
      municipalities,
      categories,
      metaFilters
    };
  });

  const [municipalitiesList, setMunicipalitiesList] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/geo/tenerife');
        const data = await res.json();
        if (data.municipalities) {
          setMunicipalitiesList(data.municipalities);
        }
      } catch (err) {
        console.error('Error loading municipalities:', err);
      }
    }
    load();
  }, []);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const mapQueryIdRef = useRef<number>(0);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const sortPillsWrapperRef = useRef<HTMLDivElement>(null);
  const sortPillsInnerRef = useRef<HTMLDivElement>(null);
  const [wrapperScrollClass, setWrapperScrollClass] = useState('');

  // Detect scroll state for sort pills wrapper gradient overlays
  useEffect(() => {
    const el = sortPillsInnerRef.current;
    const wrapper = sortPillsWrapperRef.current;
    if (!el || !wrapper) return;

    const updateScrollState = () => {
      const canScroll = el.scrollWidth > el.clientWidth;
      if (!canScroll) {
        setWrapperScrollClass('');
        return;
      }
      const atStart = el.scrollLeft <= 2;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
      const classes: string[] = [];
      if (!atStart) classes.push('is-scrollable-left');
      if (!atEnd) classes.push('is-scrollable-right');
      setWrapperScrollClass(classes.join(' '));
    };

    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    
    const matchedMuns = (municipalitiesList || [])
      .filter(mun => mun.toLowerCase().includes(query) && mun.toLowerCase() !== query)
      .slice(0, 4)
      .map(m => ({ type: 'municipality', label: m, icon: '/icons/location_pin.svg' }));

    const enabledDefs = (filterMeta?.definitions || []).filter((d: any) => d.showOnSearchModal === true);
    const matchedMetaOpts: any[] = [];
    
    enabledDefs.forEach((def: any) => {
      const opts = def.filter?.selectOptions || [];
      opts.forEach((opt: any) => {
        const lbl = opt.label || "";
        if (lbl.toLowerCase().includes(query) && !matchedMetaOpts.some(exist => exist.label === lbl)) {
          matchedMetaOpts.push({
            type: 'meta',
            label: lbl,
            icon: opt.icon || '/icons/search.svg'
          });
        }
      });
    });

    const matchedCats: any[] = [];
    (filterMeta?.standaloneCategories || []).forEach((cat: any) => {
      const lbl = cat.label || "";
      if (lbl.toLowerCase().includes(query) && !matchedCats.some(e => e.label === lbl)) {
        matchedCats.push({
          type: 'category',
          label: lbl,
          icon: cat.icon || '/icons/search.svg'
        });
      }
    });

    return [...matchedMuns, ...matchedCats, ...matchedMetaOpts.slice(0, 5)];
  }, [searchQuery, municipalitiesList, filterMeta]);

  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] || 'en';
  }, [pathname]);

  useEffect(() => {
    document.body.classList.remove('header-light-mode');
    document.body.classList.remove('header-black-bg');
    document.body.classList.add('header-dark-mode');
    document.body.classList.add('properties-archive-gold');
    return () => {
      document.body.classList.remove('header-dark-mode');
      document.body.classList.remove('properties-archive-gold');
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'map') {
      document.body.classList.add('properties-archive-map-mode');
    } else {
      document.body.classList.remove('properties-archive-map-mode');
    }
    return () => {
      document.body.classList.remove('properties-archive-map-mode');
    };
  }, [viewMode]);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    if (search !== debouncedSearchQuery) {
      setSearchQuery(search);
      setDebouncedSearchQuery(search);
    }

    const sort = searchParams.get('orderBy') || '_createdAt desc';
    if (sort !== orderBy) setOrderBy(sort);

    const priceMin = Number(searchParams.get('priceMin')) || 0;
    const priceMax = Number(searchParams.get('priceMax')) || (filterMeta?.maxPrice || 5000000);
    const municipalities = searchParams.get('municipalities')?.split(',').filter(Boolean) || [];
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    
    let metaFilters = {};
    const metaStr = searchParams.get('meta');
    if (metaStr) {
      try {
        metaFilters = JSON.parse(metaStr);
      } catch (e) {
        console.error('Failed to parse meta filters from URL', e);
      }
    }

    const isMunDiff = municipalities.length !== activeFilters.municipalities.length || !municipalities.every(m => activeFilters.municipalities.includes(m));
    const isCatDiff = categories.length !== (activeFilters.categories || []).length || !categories.every(c => (activeFilters.categories || []).includes(c));
    const isMetaDiff = JSON.stringify(metaFilters) !== JSON.stringify(activeFilters.metaFilters);
    
    if (priceMin !== activeFilters.priceMin || priceMax !== activeFilters.priceMax || isMunDiff || isCatDiff || isMetaDiff) {
      setActiveFilters({
        priceMin,
        priceMax,
        municipalities,
        categories,
        metaFilters
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      
      const maxLimit = filterMeta?.maxPrice || 5000000;
      if (searchQuery) params.set('search', searchQuery);
      if (activeFilters.priceMin > 0) params.set('priceMin', activeFilters.priceMin.toString());
      if (activeFilters.priceMax < maxLimit) params.set('priceMax', activeFilters.priceMax.toString());
      if (activeFilters.municipalities.length > 0) params.set('municipalities', activeFilters.municipalities.join(','));
      if (activeFilters.categories && activeFilters.categories.length > 0) params.set('categories', activeFilters.categories.join(','));
      if (Object.keys(activeFilters.metaFilters).length > 0) params.set('meta', JSON.stringify(activeFilters.metaFilters));
      if (orderBy !== '_createdAt desc') params.set('orderBy', orderBy);

      const newQuery = params.toString();
      const currentQuery = window.location.search.replace('?', '');

      if (newQuery !== currentQuery) {
        const url = newQuery ? `${pathname}?${newQuery}` : pathname;
        window.history.replaceState(null, '', url);
      }
      
      setDebouncedSearchQuery(prev => prev !== searchQuery ? searchQuery : prev);
      
      if (searchQuery !== debouncedSearchQuery) {
        setCurrentPage(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters, orderBy, filterMeta?.maxPrice, pathname, router]);

  useEffect(() => {
    if (initialMeta) {
      setFilterMeta(initialMeta);
      return;
    }
    const fetchFilterMeta = async () => {
      try {
        const rawRes = await client.fetch(PROPERTY_META_QUERY, { language: locale }, { stega: false });
        setFilterMeta(sanitizeSanityData(rawRes));
      } catch (err) {
        console.error('Error fetching filter meta:', err);
      }
    };
    fetchFilterMeta();
  }, [locale, initialMeta]);

  useEffect(() => {
    if (filterMeta?.maxPrice !== undefined) {
      setActiveFilters((prev) => ({
        ...prev,
        priceMax: prev.priceMax === 5000000 ? filterMeta.maxPrice : prev.priceMax
      }));
    }
  }, [filterMeta?.maxPrice]);

  const [isMobile, setIsMobile] = useState(false);
  const [mapBtnOpacity, setMapBtnOpacity] = useState(1);

  // Fade out map-toggle-btn-mobile before it reaches the bottom of archive-properties-wrapper
  useEffect(() => {
    const wrapper = sectionRef.current?.querySelector('.archive-properties-wrapper');
    if (!wrapper || !isMobile) return;

    const handleScroll = () => {
      const wrapperRect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const wrapperBottom = wrapperRect.bottom;
      const distanceFromViewportBottom = wrapperBottom - viewportHeight;
      const fadeZone = 600; // pixels before hitting bottom to start fading
      
      if (distanceFromViewportBottom < fadeZone) {
        const opacity = Math.max(0, distanceFromViewportBottom / fadeZone);
        setMapBtnOpacity(opacity);
      } else {
        setMapBtnOpacity(1);
      }
    };

    // Use passive scroll for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = isMobile ? 6 : 12;

  useEffect(() => {
    let isMounted = true;

    const isInitialDefaultState = 
      currentPage === 1 &&
      debouncedSearchQuery === '' &&
      orderBy === '_createdAt desc' &&
      activeFilters.municipalities.length === 0 &&
      (activeFilters.categories?.length || 0) === 0 &&
      activeFilters.priceMin === 0 &&
      Object.keys(activeFilters.metaFilters).length === 0;

    if (initialProperties && isInitialDefaultState && !hasRunInitialFetch.current) {
      hasRunInitialFetch.current = true;
      setLoading(false);
      return;
    }

    hasRunInitialFetch.current = true;
    setLoading(true);

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const fetchProperties = async () => {
      try {
        let baseFilter = `_type == "property" && (language == $language || (!defined(language) && $language == "en"))`;
        baseFilter += ` && price >= $priceMin && price <= $priceMax`;

        if (activeFilters.municipalities.length > 0) {
          baseFilter += ` && location.municipality in $municipalities`;
        }

        if (activeFilters.categories && activeFilters.categories.length > 0) {
          baseFilter += ` && category._ref in $categories`;
        }

        const searchNorm = debouncedSearchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const searchEnabledDefs = (filterMeta?.definitions || []).filter((d: any) => d.showOnSearchModal === true);
        const matchedMetaValues = searchEnabledDefs.flatMap((def: any) => {
          const opts = def.filter?.selectOptions || [];
          return opts
            .filter((opt: any) => (opt.label || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchNorm))
            .map((opt: any) => opt.value);
        });

        if (debouncedSearchQuery.trim().length > 0) {
          baseFilter += ` && (
            title match $search || 
            title[$language] match $search ||
            location.streetAddress match $search || 
            location.complexName match $search || 
            location.municipality match $search ||
            category->title match $search ||
            category->title[$language] match $search ||
            count(meta[
              selectValue in $matchedMetaValues || 
              count(selectArrayValue[@ in $matchedMetaValues]) > 0
            ]) > 0
          )`;
        }

        Object.entries(activeFilters.metaFilters).forEach(([metaId, val]) => {
          if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) return;

          const cleanMetaId = metaId.replace('drafts.', '');
          const def = filterMeta?.definitions?.find((d: any) => d._id.replace('drafts.', '') === cleanMetaId);
          if (!def) return;

          const type = def.filter?.filterType;
          if ((type === 'boolean' || type === 'checkbox') && val === true) {
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && booleanValue == true]) > 0`;
          } else if (type === 'rangeSlider') {
            const isDouble = def.filter?.isDoubleSlider === true;
            if (isDouble && typeof val === 'object' && val !== null) {
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue >= ${val.min} && numberValue <= ${val.max}]) > 0`;
            } else {
              const maxVal = (typeof val === 'object' && val !== null) ? val.max : val;
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue <= ${maxVal}]) > 0`;
            }
          } else if (type === 'prefixRange') {
            const prefixOptions = def.filter?.prefixOptions || [];
            const opt = prefixOptions.find((o: any) => String(o.value) === String(val));
            if (opt?.isAny === true) return;
            if (val === undefined || val === null || val === '') return;
            let groqOperator = '==';
            if (opt) {
              if (opt.operator === 'gte' || opt.operator === '>=') groqOperator = '>=';
              else if (opt.operator === 'lte' || opt.operator === '<=') groqOperator = '<=';
              else if (opt.operator === 'equals' || opt.operator === '==') groqOperator = '==';
            }
            const num = parseInt(val);
            if (!isNaN(num)) {
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue ${groqOperator} ${num}]) > 0`;
            }
          } else if (type === 'select') {
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && (stringValue == "${val}" || selectValue == "${val}" || "${val}" in selectArrayValue)]) > 0`;
          } else if (type === 'multiSelect' && Array.isArray(val) && val.length > 0) {
            const joinedOptions = val.map(v => `"${v}"`).join(', ');
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && (stringValue in [${joinedOptions}] || selectValue in [${joinedOptions}] || count(selectArrayValue[@ in [${joinedOptions}]]) > 0)]) > 0`;
          }
        });

        const query = `
          {
            "items": *[${baseFilter}] | order(select(status == "reserved" => 1, status == "sold" => 2, 0) asc, ${orderBy}) [$start...$end] {
              ${PROPERTY_CARD_FIELDS}
            },
            "total": count(*[${baseFilter}])
          }
        `;

        const res = await client.fetch(query, {
          language: locale,
          start,
          end,
          priceMin: activeFilters.priceMin,
          priceMax: activeFilters.priceMax,
          municipalities: activeFilters.municipalities,
          categories: activeFilters.categories || [],
          search: `*${debouncedSearchQuery}*`,
          matchedMetaValues: matchedMetaValues
        });

        if (isMounted) {
          if (currentPage === 1) {
            setProperties(res.items || []);
            if (sectionRef.current) {
              const rect = sectionRef.current.getBoundingClientRect();
              if (rect.top < -100) {
                const lenis = (window as any).lenis;
                if (lenis) {
                  lenis.scrollTo(sectionRef.current, { offset: -20, duration: 1.2 });
                } else {
                  sectionRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }
          } else {
            setProperties(prev => [...prev, ...(res.items || [])]);
          }
          setTotalCount(res.total || 0);
          setLoading(false);
          setTimeout(() => { ScrollTrigger.refresh(); }, 100);
        }
      } catch (err) {
        console.error('Error fetching properties archive:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchProperties();

    return () => { isMounted = false; };
  }, [currentPage, locale, itemsPerPage, JSON.stringify(activeFilters), debouncedSearchQuery, filterMeta?._id, orderBy]);

  // Fetch all properties for map view (no pagination) — uses query ID to avoid race conditions
  useEffect(() => {
    if (viewMode !== 'map') return;

    const queryId = ++mapQueryIdRef.current;
    setMapLoading(true);

    const fetchAllForMap = async () => {
      try {
        let baseFilter = `_type == "property" && (language == $language || (!defined(language) && $language == "en"))`;
        baseFilter += ` && price >= $priceMin && price <= $priceMax`;

        if (activeFilters.municipalities.length > 0) {
          baseFilter += ` && location.municipality in $municipalities`;
        }
        if (activeFilters.categories && activeFilters.categories.length > 0) {
          baseFilter += ` && category._ref in $categories`;
        }

        if (debouncedSearchQuery.trim().length > 0) {
          baseFilter += ` && (title match $search || title[$language] match $search || location.streetAddress match $search || location.complexName match $search || location.municipality match $search || category->title match $search || category->title[$language] match $search)`;
        }

        Object.entries(activeFilters.metaFilters).forEach(([metaId, val]) => {
          if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) return;
          const cleanMetaId = metaId.replace('drafts.', '');
          const def = filterMeta?.definitions?.find((d: any) => d._id.replace('drafts.', '') === cleanMetaId);
          if (!def) return;
          const type = def.filter?.filterType;
          if ((type === 'boolean' || type === 'checkbox') && val === true) {
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && booleanValue == true]) > 0`;
          } else if (type === 'rangeSlider') {
            const isDouble = def.filter?.isDoubleSlider === true;
            if (isDouble && typeof val === 'object' && val !== null) {
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue >= ${val.min} && numberValue <= ${val.max}]) > 0`;
            } else {
              const maxVal = (typeof val === 'object' && val !== null) ? val.max : val;
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue <= ${maxVal}]) > 0`;
            }
          } else if (type === 'prefixRange') {
            const prefixOptions = def.filter?.prefixOptions || [];
            const opt = prefixOptions.find((o: any) => String(o.value) === String(val));
            if (opt?.isAny === true) return;
            if (val === undefined || val === null || val === '') return;
            let groqOperator = '==';
            if (opt) {
              if (opt.operator === 'gte' || opt.operator === '>=') groqOperator = '>=';
              else if (opt.operator === 'lte' || opt.operator === '<=') groqOperator = '<=';
              else if (opt.operator === 'equals' || opt.operator === '==') groqOperator = '==';
            }
            const num = parseInt(val);
            if (!isNaN(num)) {
              baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && numberValue ${groqOperator} ${num}]) > 0`;
            }
          } else if (type === 'select') {
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && (stringValue == "${val}" || selectValue == "${val}" || "${val}" in selectArrayValue)]) > 0`;
          } else if (type === 'multiSelect' && Array.isArray(val) && val.length > 0) {
            const joinedOptions = val.map(v => `"${v}"`).join(', ');
            baseFilter += ` && count(meta[(metaKey._ref == "${cleanMetaId}" || metaKey._ref == "drafts.${cleanMetaId}") && (stringValue in [${joinedOptions}] || selectValue in [${joinedOptions}] || count(selectArrayValue[@ in [${joinedOptions}]]) > 0)]) > 0`;
          }
        });

        const query = `*[${baseFilter}] | order(select(status == "reserved" => 1, status == "sold" => 2, 0) asc, _createdAt desc) { ${PROPERTY_CARD_FIELDS} }`;

        const res = await client.fetch(query, {
          language: locale,
          priceMin: activeFilters.priceMin,
          priceMax: activeFilters.priceMax,
          municipalities: activeFilters.municipalities,
          categories: activeFilters.categories || [],
          search: `*${debouncedSearchQuery}*`,
        });

        // Only apply result if this query is still the latest one
        if (queryId === mapQueryIdRef.current) {
          setMapProperties(res || []);
          setMapLoading(false);
        }
      } catch (err) {
        console.error('Error fetching map properties:', err);
        if (queryId === mapQueryIdRef.current) {
          setMapLoading(false);
        }
      }
    };

    fetchAllForMap();
  }, [viewMode, locale, JSON.stringify(activeFilters), debouncedSearchQuery, filterMeta?._id]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeFilters.priceMin > 0) count++;
    if (activeFilters.priceMax < (filterMeta?.maxPrice || 5000000)) count++;
    if (activeFilters.municipalities.length > 0) count++;
    if (activeFilters.categories && activeFilters.categories.length > 0) count++;
    Object.values(activeFilters.metaFilters).forEach((val: any) => {
      if (val !== undefined && val !== '') {
        if (Array.isArray(val)) count += val.length;
        else count += 1;
      }
    });
    return count;
  }, [activeFilters, filterMeta]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    const maxVisible = 4;
    if (totalPages <= maxVisible + 1) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
      return range;
    }
    range.push(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) range.push("...");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < totalPages - 1) range.push("...");
    range.push(totalPages);
    return range;
  };

  const handlePageChange = (pageNum: number) => { setCurrentPage(pageNum); };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveFilters({ priceMin: 0, priceMax: filterMeta?.maxPrice || 5000000, municipalities: [], categories: [], metaFilters: {} });
    setCurrentPage(1);
  };

  const handleClearMunicipalities = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveFilters(prev => ({ ...prev, municipalities: [] }));
    setCurrentPage(1);
  };

  const isMunicipalityFocused = useMemo(() => {
    if (activeFilters.municipalities.length > 0) return true;
    if (searchQuery.length > 2 && municipalitiesList.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      return municipalitiesList.some((name: string) => {
        const lowerName = name.toLowerCase();
        return lowerName === query || lowerName.includes(query) || query.includes(lowerName);
      });
    }
    return false;
  }, [activeFilters.municipalities, searchQuery, municipalitiesList]);

  const municipalityFocus = useMemo(() => {
    if (viewMode === 'map' && activeFilters.municipalities.length > 0) {
      return activeFilters.municipalities[0];
    }
    return undefined;
  }, [viewMode, activeFilters.municipalities]);

  const handlePropertyClick = useCallback((slug: string) => {
    const targetPath = `/${locale}/${locale === 'es' ? 'propiedades' : 'properties'}/${slug}`;
    window.open(targetPath, '_blank');
  }, [locale]);

  return (
    <section className="archive-properties-section" ref={sectionRef}>
      {/* Search bar — always same position */}
      <div className="archive-page-padder">
        <div className="archive-search-container" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <div className="search-modal-header-row">
            <div className="search-input-wrapper" ref={suggestionsRef}>
              <span className="search-input-icon">
                <Image src="/icons/search.svg" alt="Search" width={22} height={22} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={dict?.archive?.search_placeholder}
                className="search-input-real"
              />
              {searchQuery && (
                <button className="archive-search-clear" onClick={() => { setSearchQuery(''); setShowSuggestions(false); }} aria-label="Clear Search">✕</button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                  {suggestions.map((item: any, idx) => (
                    <div key={`${item.type}-${item.label}-${idx}`} className="suggestion-item-row" onClick={() => { setSearchQuery(item.label); setShowSuggestions(false); }}>
                      <img src={item.icon} alt="" width={14} height={14} className="suggestion-icon" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="archive-properties-wrapper">
          <div className="archive-main-layout">
            {!isMobile && (
              <div className="archive-filter-column filter-sidebar-inline">
                <FilterSidebar isOpen={true} onClose={() => { }} locale={locale} dict={dict} meta={filterMeta} activeFilters={activeFilters} onApplyFilters={(filters) => { setActiveFilters(filters); setCurrentPage(1); }} isInline={true} />
              </div>
            )}
            <div className="archive-listings-column">
              <div className="archive-results-header">
                <div className={`archive-sort-pills-wrapper ${wrapperScrollClass}`} ref={sortPillsWrapperRef}>
                  <div className="archive-sort-pills" ref={sortPillsInnerRef}>
                    <span className="sort-label">{dict?.archive?.sort_label}</span>
                    <button className={`suggestion-item ${orderBy === '_createdAt desc' ? 'active' : ''}`} onClick={() => { setOrderBy('_createdAt desc'); setCurrentPage(1); }}>{dict?.archive?.sort_newest}</button>
                    <button className={`suggestion-item ${orderBy === 'price desc' ? 'active' : ''}`} onClick={() => { setOrderBy('price desc'); setCurrentPage(1); }}>{dict?.archive?.sort_price_desc}</button>
                    <button className={`suggestion-item ${orderBy === 'price asc' ? 'active' : ''}`} onClick={() => { setOrderBy('price asc'); setCurrentPage(1); }}>{dict?.archive?.sort_price_asc}</button>
                  </div>
                </div>
                {!isMobile && (
                  <button className="map-toggle-btn-desktop btn-pill" onClick={() => setViewMode('map')}>
                    <Image src="/icons/map.svg" alt="Map" width={18} height={18} />
                    <span>{dict?.archive?.map_view}</span>
                  </button>
                )}
                {isMobile && (
                  <div className='archive-mobile-filter-btn-container'>
                    <button className="archive-mobile-filter-btn btn-pill" onClick={() => setIsSidebarOpen(true)}>
                      <span>{dict?.archive?.filter_button}</span>
                      {activeFiltersCount > 0 && <span className="filter-count-badge">{activeFiltersCount}</span>}
                      <Image src="/icons/tune.svg" alt="Filter" width={18} height={18} className="filter-icon btn-icon" />
                    </button>
                  </div>
                )}
              </div>

              <div className={`archive-grid-container ${loading && currentPage === 1 ? 'is-loading' : ''}`}>
                {loading && currentPage === 1 && <div className="archive-loader-overlay"><div className="spinner"></div></div>}
                {properties.length === 0 ? (!loading && (
                  <div className="archive-empty">
                    <div className="smart-empty-state">
                      <div className="smart-empty-icon"><img src="/icons/info.svg" alt="No results" /></div>
                      <h3>{isMunicipalityFocused ? dict?.archive?.no_properties_in_area : dict?.archive?.no_results}</h3>
                      <p>{isMunicipalityFocused ? dict?.archive?.explore_others : dict?.archive?.no_results_subtitle}</p>
                      {isMunicipalityFocused && <Button label={dict?.archive?.explore_other_areas} variant="dark" showArrow={true} onClick={handleClearMunicipalities} className="empty-state-cta" />}
                    </div>
                  </div>
                )) : (
                  <div className="archive-grid" ref={gridRef} style={{ opacity: loading && currentPage === 1 ? 0.45 : 1, pointerEvents: loading && currentPage === 1 ? 'none' : 'auto', transition: 'opacity 0.3s ease-in-out' }}>
                    {properties.map((prop) => (<PropertyCard key={prop._id} prop={prop} dict={dict} />))}
                  </div>
                )}
              </div>

              {properties.length < totalCount && (
                <div className="archive-load-more-container">
                  <Button label={loading ? (dict?.archive?.loading || "Loading...") : (dict?.archive?.load_more || "Load More")} onClick={() => handlePageChange(currentPage + 1)} variant="dark" showArrow={false} className="load-more-btn" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAP VIEW */}
      {viewMode === 'map' && (
        <div className="archive-map-container-archive">
          <PropertiesMap properties={mapProperties} municipalityFocus={municipalityFocus} onPropertyClick={handlePropertyClick} />
          {!mapLoading && mapProperties.length === 0 && (
            <div className="archive-map-empty-state">
              <div className="smart-empty-state">
                <div className="smart-empty-icon"><img src="/icons/info.svg" alt="No results" /></div>
                <h3>{isMunicipalityFocused ? dict?.archive?.no_properties_in_area : dict?.archive?.no_results}</h3>
                <p>{isMunicipalityFocused ? dict?.archive?.explore_others : dict?.archive?.no_results_subtitle}</p>
                {isMunicipalityFocused && (
                  <button className="empty-state-reset" onClick={handleClearMunicipalities}>{dict?.archive?.explore_other_areas || "Explore Other Areas"}</button>
                )}
              </div>
            </div>
          )}
          {!isMobile && (
            <div className="map-desktop-controls-archive">
              <button className="map-filter-btn-archive btn-pill" onClick={() => setIsSidebarOpen(true)}>
                <span>{dict?.archive?.filter_button}</span>
                {activeFiltersCount > 0 && <span className="filter-count-badge">{activeFiltersCount}</span>}
                <Image src="/icons/tune.svg" alt="Filter" width={18} height={18} className="btn-icon" />
              </button>
              <button className="map-list-toggle-btn-archive btn-pill" onClick={() => setViewMode('list')}>
                <Image src="/icons/map.svg" alt="List" width={18} height={18} />
                <span>{dict?.archive?.list_view}</span>
              </button>
            </div>
          )}
          {isMobile && (
            <div className="map-mobile-controls-archive">
              <button className="map-toggle-btn-mobile-map btn-pill btn-dark" onClick={() => setViewMode('list')}>
                <Image src="/icons/map.svg" alt="List" width={18} height={18} />
                <span>{dict?.archive?.list_view}</span>
              </button>
            </div>
          )}
          {isMobile && (
            <div className="map-mobile-filter-top">
              <button className="archive-mobile-filter-btn btn-pill" onClick={() => setIsSidebarOpen(true)}>
                <span>{dict?.archive?.filter_button}</span>
                {activeFiltersCount > 0 && <span className="filter-count-badge">{activeFiltersCount}</span>}
                <Image src="/icons/tune.svg" alt="Filter" width={18} height={18} className="filter-icon btn-icon" />
              </button>
            </div>
          )}
          <FilterSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} locale={locale} dict={dict} meta={filterMeta} municipalities={municipalitiesList} activeFilters={activeFilters} onApplyFilters={(filters) => { setActiveFilters(filters); setCurrentPage(1); setIsSidebarOpen(false); }} isInline={false} />
        </div>
      )}

      {viewMode === 'list' && isMobile && (
        <button
          className="map-toggle-btn-mobile btn-pill btn-dark"
          onClick={() => setViewMode('map')}
          style={{
            opacity: mapBtnOpacity,
            pointerEvents: mapBtnOpacity < 0.01 ? 'none' as const : 'auto' as const
          }}
        >
          <Image src="/icons/map.svg" alt="Map" width={18} height={18} />
          <span>{dict?.archive?.map_view}</span>
        </button>
      )}

      {viewMode === 'list' && isMobile && (
        <FilterSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} locale={locale} dict={dict} meta={filterMeta} municipalities={municipalitiesList} activeFilters={activeFilters} onApplyFilters={(filters) => { setActiveFilters(filters); setCurrentPage(1); setIsSidebarOpen(false); }} isInline={false} />
      )}
    </section>
  );
}