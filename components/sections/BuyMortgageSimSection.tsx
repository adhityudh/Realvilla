'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/ui/Button';
import StretchArrow from '@/components/ui/StretchArrow';
import Tooltip from '@/components/ui/Tooltip';
import { smoothScrollToAnchor } from '@/lib/scroll';
import './BuyMortgageSimSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Helpers ───────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtDec = (v: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtNum = (v: number) =>
  isNaN(v) || v === 0 ? '0' : v.toLocaleString('en-IE');
const parseNum = (s: string) => { const n = parseFloat(s.replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };

// ─── Slider ──────────────────────────────────────────────────
function Slider({ value, min, max, step, onChange }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="msim-slider-wrap">
      <div className="msim-track-bg">
        <div className="msim-track-fill" style={{ width: `${pct}%` }} />
      </div>
      <input type="range" className="msim-slider" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))} />
    </div>
  );
}

// ─── Tax Costs Modal ──────────────────────────────────────────
function TaxModal({ data, condition, price, isEs, onClose }: { data: any; condition: string; price: number; isEs: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [data]);

  const newBuildTaxRateVal = data.newBuildTaxRate;
  const newBuildStampDutyRateVal = data.newBuildStampDutyRate;
  const resaleTaxRateVal = data.resaleTaxRate;

  const igicAmount = price * (newBuildTaxRateVal / 100);
  const ajdAmount = price * (newBuildStampDutyRateVal / 100);
  const itpAmount = price * (resaleTaxRateVal / 100);

  const taxAmount = condition === 'new' ? igicAmount + ajdAmount : itpAmount;
  const notary = data.notaryCost;
  const registry = data.registryCost;
  const gestoria = data.gestoriaCost;
  const valuation = data.valuationCost;
  const purchaseTotal = taxAmount + notary + registry + gestoria;
  const grandTotal = purchaseTotal + valuation;

  return (
    <div className="msim-modal-overlay-container">
      <div className="msim-modal-bg-overlay" onClick={onClose} />
      <div className="msim-modal-card" onClick={e => e.stopPropagation()} data-lenis-prevent="true">
        {/* Header */}
        <div className="msim-modal-header">
          <div className="msim-modal-header-text">
            <h3 className="msim-modal-title">{data.modalTitle}</h3>
            <p className="msim-modal-subtitle">{data.modalSubtitle}</p>
          </div>
          <button className="msim-modal-close" onClick={onClose} aria-label="Close">
            <img src="/icons/close.svg" alt="Close" width="22" height="22" />
          </button>
        </div>

        {/* Body */}
        <div className="msim-modal-body">
          <div className="msim-modal-group">
            <div className="msim-modal-group-title">{data.modalPurchaseCostsTitle}</div>
            <div className="msim-modal-row"><span>{data.modalLabelNotary}</span><span>{fmt(notary)}</span></div>
            <div className="msim-modal-row"><span>{data.modalLabelRegistry}</span><span>{fmt(registry)}</span></div>
            <div className="msim-modal-row"><span>{data.modalLabelGestoria}</span><span>{fmt(gestoria)}</span></div>
            {condition === 'new' ? (
              <>
                <div className="msim-modal-row">
                  <span>IGIC ({newBuildTaxRateVal}%):</span>
                  <span>{fmt(igicAmount)}</span>
                </div>
                <div className="msim-modal-row">
                  <span>AJD (~{newBuildStampDutyRateVal}%):</span>
                  <span>{fmt(ajdAmount)}</span>
                </div>
              </>
            ) : (
              <div className="msim-modal-row">
                <span>{isEs ? `ITP (${resaleTaxRateVal}%):` : `ITP (Transfer Tax) (${resaleTaxRateVal}%):`}</span>
                <span>{fmt(itpAmount)}</span>
              </div>
            )}
          </div>

          <div className="msim-modal-group">
            <div className="msim-modal-group-title">{data.modalMortgageCostsTitle}</div>
            <div className="msim-modal-row"><span>{data.modalLabelValuation}</span><span>{fmt(valuation)}</span></div>
            {data.modalValuationNote && <p className="msim-modal-note">{data.modalValuationNote}</p>}
          </div>

          <div className="msim-modal-total">
            <span>{data.modalTotalLabel}</span>
            <span>{fmt(grandTotal)}</span>
          </div>

          {data.modalDisclaimer && <p className="msim-modal-disclaimer">{data.modalDisclaimer}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Amortization Modal ───────────────────────────────────────
function AmortModal({ data, principal, rate, term, onClose }: { data: any; principal: number; rate: number; term: number; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [data]);

  const monthlyRate = rate / 100 / 12;
  const n = term * 12;
  const payment = monthlyRate === 0 ? principal / n : (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

  const rows = useMemo(() => {
    const res = [];
    let balance = principal;
    for (let y = 1; y <= term; y++) {
      let yearInterest = 0, yearCapital = 0;
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interestPart = balance * monthlyRate;
        const capitalPart = Math.min(payment - interestPart, balance);
        yearInterest += interestPart;
        yearCapital += capitalPart;
        balance = Math.max(0, balance - capitalPart);
      }
      res.push({ year: y, payment: payment * 12, capital: yearCapital, interest: yearInterest, balance });
    }
    return res;
  }, [principal, rate, term]);

  return (
    <div className="msim-modal-overlay-container">
      <div className="msim-modal-bg-overlay" onClick={onClose} />
      <div className="msim-modal-card msim-modal-card--amort" onClick={e => e.stopPropagation()} data-lenis-prevent="true">
        {/* Header */}
        <div className="msim-modal-header">
          <div className="msim-modal-header-text">
            <h3 className="msim-modal-title">{data.amortTableTitle}</h3>
            <p className="msim-modal-subtitle">{data.amortTableSubtitle}</p>
          </div>
          <button className="msim-modal-close" onClick={onClose} aria-label="Close">
            <img src="/icons/close.svg" alt="Close" width="22" height="22" />
          </button>
        </div>

        {/* Body */}
        <div className="msim-modal-body">
          <div className="msim-amort-scroll" data-lenis-prevent="true">
            <table className="msim-amort-table">
              <thead>
                <tr>
                  <th>{data.amortLabelYear}</th>
                  <th>{data.amortLabelInstallment}</th>
                  <th>{data.amortLabelCapital}</th>
                  <th>{data.amortLabelInterest}</th>
                  <th>{data.amortLabelBalance}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.year}>
                    <td>{r.year}</td>
                    <td>{fmt(r.payment)}</td>
                    <td>{fmt(r.capital)}</td>
                    <td>{fmt(r.interest)}</td>
                    <td>{fmt(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function BuyMortgageSimSection({ data, dict, contextData }: { data?: any; dict?: any; contextData?: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const locale = useMemo(() => {
    const segments = pathname?.split('/') || [];
    return segments[1] || 'en';
  }, [pathname]);

  if (!data) return null;

  // Merge global calculator settings if available, otherwise fallback to local data fields
  const L = { ...data, ...(contextData?.mortgageCalculator || {}) };

  // Strict retrieval without hardcoded fallbacks
  const priceMin = L.priceMin;
  const priceMax = L.priceMax;
  const savingsStep = L.savingsStep;
  const loanTermMin = L.loanTermMin;
  const loanTermMax = L.loanTermMax;
  const rateStep = L.rateStep;
  const rateMin = L.rateMin;
  const rateMax = L.rateMax;

  // State
  const [price, setPrice] = useState<number>(contextData?.propertyPrice ?? L.defaultPrice);
  const initPrice = contextData?.propertyPrice ?? L.defaultPrice;
  const [savings, setSavings] = useState<number>(
    Math.round(initPrice * (L.defaultSavingsPct / 100))
  );
  const [term, setTerm] = useState<number>(L.defaultLoanTerm);
  const [rateType, setRateType] = useState<'fixed' | 'variable'>(L.defaultRateType);
  const [fixedRate, setFixedRate] = useState<number>(L.fixedRate);
  const [variableRate, setVariableRate] = useState<number>(L.variableRate);
  const [condition, setCondition] = useState<string>(L.defaultCondition);
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [amortModalOpen, setAmortModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState(fmtNum(contextData?.propertyPrice ?? L.defaultPrice));
  const [savingsInput, setSavingsInput] = useState(fmtNum(Math.round(initPrice * (L.defaultSavingsPct / 100))));
  const [termInput, setTermInput] = useState(String(L.defaultLoanTerm));

  const activeRate = rateType === 'fixed' ? fixedRate : variableRate;
  const setActiveRate = rateType === 'fixed' ? setFixedRate : setVariableRate;

  // Dynamic minimum savings based on percentage of current property price
  const savingsMin = Math.round(price * (L.minSavingsPct / 100));

  // Clamp savings to price
  const clampedSavings = Math.min(savings, price);

  // Tax calculation
  const newBuildTaxRateVal = L.newBuildTaxRate;
  const newBuildStampDutyRateVal = L.newBuildStampDutyRate;
  const resaleTaxRateVal = L.resaleTaxRate;

  const purchaseTaxRate = condition === 'new'
    ? (newBuildTaxRateVal + newBuildStampDutyRateVal) / 100
    : resaleTaxRateVal / 100;
  const taxAmount = price * purchaseTaxRate;
  const notary = L.notaryCost;
  const registry = L.registryCost;
  const gestoria = L.gestoriaCost;
  const valuation = L.valuationCost;
  const purchaseCosts = taxAmount + notary + registry + gestoria + valuation;
  const totalPropertyCost = price + purchaseCosts;

  // Mortgage calculation
  const principal = Math.max(0, price - clampedSavings);
  const monthlyRate = activeRate / 100 / 12;
  const n = term * 12;
  const monthlyPayment = useMemo(() => {
    if (principal <= 0) return 0;
    if (monthlyRate === 0) return principal / n;
    const p = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    return isFinite(p) ? p : 0;
  }, [principal, monthlyRate, n]);

  const totalRepayment = monthlyPayment * n;
  const totalInterest = totalRepayment - principal;
  const ltvPct = price > 0 ? Math.round((principal / price) * 100) : 0;
  const totalWithMortgage = clampedSavings + totalRepayment;

  // Bottom bar = 100% (savings + mortgage + interest)
  const barTotal = clampedSavings + principal + totalInterest;
  const savingsPct = barTotal > 0 ? (clampedSavings / barTotal) * 100 : 0;
  const principalPct = barTotal > 0 ? (principal / barTotal) * 100 : 0;
  const interestPct = barTotal > 0 ? (totalInterest / barTotal) * 100 : 0;

  // Top bar only extends to the savings+mortgage boundary (= price+costs / barTotal)
  const topBarWidthPct = barTotal > 0 ? ((clampedSavings + principal) / barTotal) * 100 : 0;
  // Inside top bar: brown (costs) and gold (price) proportional to their own total
  const costsPct = totalPropertyCost > 0 ? (purchaseCosts / totalPropertyCost) * 100 : 0;
  const pricePct = totalPropertyCost > 0 ? (price / totalPropertyCost) * 100 : 0;

  // Warning threshold
  const minSavingsWarningPct = L.minSavingsWarning;
  const showWarning = price > 0 && clampedSavings < price * (minSavingsWarningPct / 100);

  // Sync price input
  const handlePriceBlur = () => {
    const v = Math.max(priceMin, parseNum(priceInput));
    setPrice(v);
    setPriceInput(fmtNum(v));
    const minSav = Math.round(v * (L.minSavingsPct / 100));
    if (savings < minSav) {
      setSavings(minSav);
      setSavingsInput(fmtNum(minSav));
    } else if (savings > v) {
      setSavings(v);
      setSavingsInput(fmtNum(v));
    }
  };

  // Sync savings input
  const handleSavingsBlur = () => {
    const v = Math.min(price, Math.max(savingsMin, parseNum(savingsInput)));
    setSavings(v);
    setSavingsInput(fmtNum(v));
  };

  // Sync term input
  const handleTermBlur = () => {
    const raw = parseInt(termInput.replace(/[^0-9]/g, ''), 10);
    const v = isNaN(raw) ? loanTermMin : Math.min(loanTermMax, Math.max(loanTermMin, raw));
    setTerm(v);
    setTermInput(String(v));
  };

  // GSAP entry
  useEffect(() => {
    if (!sectionRef.current) return;

    if (data?.disableEntranceAnimation && data?.disableHeaderEntranceAnimation) return;

    const headerEls = sectionRef.current.querySelectorAll('.msim-header-left, .msim-header-right');
    const contentEls = sectionRef.current.querySelectorAll('.msim-body-card');

    if (!data?.disableHeaderEntranceAnimation) {
      gsap.set(headerEls, { opacity: 0, y: 35, filter: 'blur(10px)' });
    }
    if (!data?.disableEntranceAnimation) {
      gsap.set(contentEls, { opacity: 0, y: 40, filter: 'blur(8px)' });
    }

    const tl = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' } });

    if (!data?.disableHeaderEntranceAnimation) {
      tl.fromTo(headerEls, { y: 35, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.15, ease: 'expo.out' });
    }
    if (!data?.disableEntranceAnimation) {
      const position = !data?.disableHeaderEntranceAnimation ? '-=0.8' : 0;
      tl.fromTo(contentEls, { y: 40, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' }, position);
    }

    ScrollTrigger.refresh();
    return () => { tl.kill(); };
  }, [data]);

  return (
    <section className={`msim-section ${data?.disableEntranceAnimation ? 'no-entrance-anim' : ''} ${data?.disableHeaderEntranceAnimation ? 'no-header-entrance-anim' : ''}`} id={data?.id || 'mortgage-simulator'} ref={sectionRef}>
      <div className="msim-container">
        {/* Header */}
        <div className="msim-header-row">
          <div className="msim-header-left">
            {L.tagline && <div className="msim-tagline">{L.tagline}</div>}
            {L.headline && <h2 className="msim-headline">{L.headline}</h2>}
          </div>
          {(L.body || L.ctaLabel) && (
            <div className="msim-header-right">
              {L.body && <p className="msim-body-text">{L.body}</p>}
              {L.ctaLabel && L.ctaLink && (
                <Button label={L.ctaLabel} href={L.ctaLink} variant="dark" className="msim-header-cta"
                   onClick={(e: any) => smoothScrollToAnchor(e, L.ctaLink)} />
              )}
            </div>
          )}
        </div>

        {/* Body Card */}
        <div className="msim-body-card">
          <div className="msim-inputs-col">

            {/* Price */}
            <div className="msim-field">
              <label className="msim-label">{L.labelPrice}</label>
              <div className="msim-input-group">
                <span className="msim-currency-symbol">€</span>
                <input className="msim-text-input" value={priceInput}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    const num = raw === '' ? 0 : parseInt(raw, 10);
                    setPriceInput(raw === '' ? '' : fmtNum(num));
                    if (num >= priceMin) {
                      setPrice(num);
                      if (savings > num) { setSavings(num); setSavingsInput(fmtNum(num)); }
                    }
                  }}
                  onBlur={handlePriceBlur}
                  onKeyDown={e => e.key === 'Enter' && handlePriceBlur()} />
              </div>
            </div>

            {/* Savings */}
            <div className="msim-field">
              <label className="msim-label">{L.labelSavings}</label>
              <div className="msim-input-group msim-input-group--no-border">
                <span className="msim-currency-symbol">€</span>
                <input className="msim-text-input" value={savingsInput}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    const num = raw === '' ? 0 : parseInt(raw, 10);
                    setSavingsInput(raw === '' ? '' : fmtNum(num));
                    setSavings(Math.min(price, Math.max(savingsMin, num)));
                  }}
                  onBlur={handleSavingsBlur}
                  onKeyDown={e => e.key === 'Enter' && handleSavingsBlur()} />
                <span className="msim-value-pct">{price > 0 ? Math.round((clampedSavings / price) * 100) : 0}%</span>
              </div>
              <Slider value={clampedSavings} min={savingsMin} max={price} step={savingsStep}
                onChange={v => { setSavings(v); setSavingsInput(fmtNum(v)); }} />
              <div className="msim-slider-marks"><span>{fmt(savingsMin)}</span><span>{fmt(price)}</span></div>
              {showWarning && (
                <div className="msim-warning">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                  {L.minSavingsWarningText}
                </div>
              )}
            </div>

            {/* Loan Term */}
            <div className="msim-field">
              <label className="msim-label">{L.labelTerm}</label>
              <div className="msim-input-group msim-input-group--no-border">
                <input className="msim-text-input" value={termInput}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setTermInput(raw);
                    const num = parseInt(raw, 10);
                    if (!isNaN(num) && num >= loanTermMin && num <= loanTermMax) setTerm(num);
                  }}
                  onBlur={handleTermBlur}
                  onKeyDown={e => e.key === 'Enter' && handleTermBlur()} />
                <span className="msim-value-pct">{L.unitYears}</span>
              </div>
              <Slider value={term} min={loanTermMin} max={loanTermMax} step={1}
                onChange={v => { setTerm(v); setTermInput(String(v)); }} />
              <div className="msim-slider-marks"><span>{loanTermMin} yr</span><span>{loanTermMax} yr</span></div>
            </div>

            {/* Interest Type */}
            <div className="msim-field msim-field--row">
              <label className="msim-label">
                {L.labelInterestType}
                {L.interestTooltip && <Tooltip content={L.interestTooltip} />}
              </label>
              <div className="msim-interest-controls">
                <label className={`msim-radio-label ${rateType === 'fixed' ? 'msim-radio-label--active' : ''}`}>
                  <input type="radio" name="rateType" value="fixed" checked={rateType === 'fixed'} onChange={() => setRateType('fixed')} />
                  {L.labelFixed}
                </label>
                <label className={`msim-radio-label ${rateType === 'variable' ? 'msim-radio-label--active' : ''}`}>
                  <input type="radio" name="rateType" value="variable" checked={rateType === 'variable'} onChange={() => setRateType('variable')} />
                  {L.labelVariable}
                </label>
                <div className="msim-rate-stepper">
                  <button className="msim-step-btn" onClick={() => setActiveRate(r => Math.max(rateMin, parseFloat((r - rateStep).toFixed(2))))}>−</button>
                  <div className="msim-rate-input-wrap">
                    <input
                      className="msim-rate-input"
                      type="number"
                      min={rateMin}
                      max={rateMax}
                      step={rateStep}
                      value={activeRate}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setActiveRate(Math.min(rateMax, Math.max(rateMin, parseFloat(v.toFixed(2)))));
                      }}
                    />
                    <span className="msim-rate-unit">%</span>
                  </div>
                  <button className="msim-step-btn" onClick={() => setActiveRate(r => Math.min(rateMax, parseFloat((r + rateStep).toFixed(2))))}>+</button>
                </div>
              </div>
            </div>

            {/* Property Condition */}
            {L.enablePropertyCondition && (
              <div className="msim-field msim-field--row">
                <label className="msim-label">{L.labelCondition}</label>
                <div className="msim-radio-group">
                  <label className={`msim-radio-label ${condition === 'new' ? 'msim-radio-label--active' : ''}`}>
                    <input type="radio" name="condition" value="new" checked={condition === 'new'} onChange={() => setCondition('new')} />
                    {L.labelNew}
                  </label>
                  <label className={`msim-radio-label ${condition === 'resale' ? 'msim-radio-label--active' : ''}`}>
                    <input type="radio" name="condition" value="resale" checked={condition === 'resale'} onChange={() => setCondition('resale')} />
                    {L.labelResale}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="msim-results-col">
            {/* Monthly Payment Hero */}
            <div className="msim-result-hero">
              <div className="msim-label">{L.labelMonthlyInstallment}</div>
              <div className="msim-result-hero-value">{fmtDec(monthlyPayment)}</div>
            </div>

            {/* Top Stats */}
            <div className="msim-result-stats">
              <div className="msim-result-stat-row">
                <span className="msim-stat-label">
                  {L.labelMortgageAmount}
                  {L.tooltipMortgageAmount && <Tooltip content={L.tooltipMortgageAmount} />}
                </span>
                <span className="msim-stat-value">{fmt(principal)}</span>
              </div>
              <div className="msim-result-stat-row">
                <span className="msim-stat-label">
                  {L.labelFinancingPercent}
                  {L.tooltipFinancingPercent && <Tooltip content={L.tooltipFinancingPercent} />}
                </span>
                <span className="msim-stat-value">{ltvPct}%</span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="msim-breakdown">
              <div className="msim-breakdown-row">
                <span className="msim-breakdown-dot msim-dot--gold" />
                <span className="msim-breakdown-label">{L.labelPropertyPrice}</span>
                <span className="msim-breakdown-value">{fmt(price)}</span>
              </div>
              <div className="msim-breakdown-row">
                <span className="msim-breakdown-dot msim-dot--brown" />
                <span className="msim-breakdown-label">
                  <button className="msim-costs-link" onClick={() => setTaxModalOpen(true)}>
                    {L.labelPurchaseCosts}
                    <span className="msim-costs-info-icon">
                      <img src="/icons/info.svg" alt="Info" />
                    </span>
                  </button>
                </span>
                <span className="msim-breakdown-value">{fmt(purchaseCosts)}</span>
              </div>
              <div className="msim-breakdown-row msim-breakdown-row--total">
                <span className="msim-breakdown-label msim-breakdown-label--bold">{L.labelTotalPropertyCost}</span>
                <span className="msim-breakdown-value msim-breakdown-value--bold">{fmt(totalPropertyCost)}</span>
              </div>
            </div>

            {/* Combined stacked bar chart */}
            <div className="msim-bars-combined">
              {/* Top bar: only as wide as savings+mortgage boundary */}
              <div className="msim-bar-track msim-bar-track--top" style={{ width: `${topBarWidthPct}%` }}>
                <div className="msim-bar-seg msim-bar-seg--brown" style={{ width: `${costsPct}%` }} />
                <div className="msim-bar-seg msim-bar-seg--gold" style={{ width: `${pricePct}%` }} />
              </div>

              {/* Bottom bar: 100% width → savings | mortgage | interest */}
              <div className="msim-bar-track msim-bar-track--bottom">
                <div className="msim-bar-seg msim-bar-seg--savings" style={{ width: `${savingsPct}%` }} />
                <div className="msim-bar-seg msim-bar-seg--mortgage" style={{ width: `${principalPct}%` }} />
                <div className="msim-bar-seg msim-bar-seg--interest" style={{ width: `${interestPct}%` }} />
              </div>

              {/* Dashed vertical line at savings/mortgage boundary */}
              <div className="msim-bar-divider" style={{ left: `${savingsPct}%` }} />

              {/* Labels below bottom bar */}
              <div className="msim-bar-labels">
                <span style={{ width: `${savingsPct}%`, minWidth: 0 }}>{L.chartLabelSavings}</span>
                <span style={{ width: `${principalPct}%`, minWidth: 0, textAlign: 'center' }}>{L.chartLabelMortgage}</span>
                <span style={{ width: `${interestPct}%`, minWidth: 0, textAlign: 'right' }}>{L.chartLabelInterest}</span>
              </div>
            </div>

            {/* Bottom Breakdown */}
            <div className="msim-breakdown">
              <div className="msim-breakdown-row">
                <span className="msim-breakdown-dot msim-dot--teal-light" />
                <span className="msim-breakdown-label">{L.labelSavingsResult}</span>
                <span className="msim-breakdown-value">{fmt(clampedSavings)}</span>
              </div>
              <div className="msim-breakdown-row">
                <span className="msim-breakdown-dot msim-dot--teal" />
                <span className="msim-breakdown-label">{L.labelMortgageResult}</span>
                <span className="msim-breakdown-value">{fmt(principal)}</span>
              </div>
              <div className="msim-breakdown-row">
                <span className="msim-breakdown-dot msim-dot--teal-dark" />
                <span className="msim-breakdown-label">{L.labelInterestResult}</span>
                <span className="msim-breakdown-value">{fmt(totalInterest)}</span>
              </div>
              <div className="msim-breakdown-row msim-breakdown-row--total">
                <span className="msim-breakdown-label msim-breakdown-label--bold">{L.labelTotalWithMortgage}</span>
                <span className="msim-breakdown-value msim-breakdown-value--bold">{fmt(totalWithMortgage)}</span>
              </div>
            </div>

            {/* Amortization link */}
            <button className="btn-link-styled msim-amort-link" onClick={() => setAmortModalOpen(true)}>
              {L.labelViewAmortization}
              <StretchArrow className="btn-stretch-arrow" />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        {L.disclaimerText && <p className="msim-disclaimer">{L.disclaimerText}</p>}
      </div>

      {/* Modals */}
      {taxModalOpen && <TaxModal data={L} condition={condition} price={price} isEs={locale === 'es'} onClose={() => setTaxModalOpen(false)} />}
      {amortModalOpen && <AmortModal data={L} principal={principal} rate={activeRate} term={term} onClose={() => setAmortModalOpen(false)} />}
    </section>
  );
}
