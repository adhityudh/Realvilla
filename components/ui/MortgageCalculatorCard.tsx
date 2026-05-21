'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import StretchArrow from '@/components/ui/StretchArrow';

// Helper functions
const fmt = (v: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtDec = (v: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtNum = (v: number) =>
  isNaN(v) || v === 0 ? '0' : v.toLocaleString('en-IE');
const parseNum = (s: string) => { const n = parseFloat(s.replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };

// Slider Component
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

interface MortgageCalculatorCardProps {
  data: any;
  dict?: any;
  propertyPrice?: number;
}

export default function MortgageCalculatorCard({ data, dict, propertyPrice }: MortgageCalculatorCardProps) {
  if (!data) return null;

  const L = data;
  const labels = dict?.mortgage || {};
  
  // Labels
  const labelPrice = labels.labelPrice ?? 'Property Price';
  const labelSavings = labels.labelSavings ?? 'Your Savings';
  const labelTerm = labels.labelTerm ?? 'Loan Term';
  const unitYears = labels.unitYears ?? 'years';
  const labelInterestType = labels.labelInterestType ?? 'Interest Type';
  const labelFixed = labels.labelFixed ?? 'Fixed';
  const labelVariable = labels.labelVariable ?? 'Variable';
  const labelCondition = labels.labelCondition ?? 'Property Condition';
  const labelNew = labels.labelNew ?? 'New Build';
  const labelResale = labels.labelResale ?? 'Resale';
  const labelMonthlyInstallment = labels.labelMonthlyInstallment ?? 'Your Monthly Payment';
  const labelMortgageAmount = labels.labelMortgageAmount ?? 'Mortgage amount';
  const labelFinancingPercent = labels.labelFinancingPercent ?? 'Financing percentage';
  const labelPropertyPrice = labels.labelPropertyPrice ?? 'Property price';
  const labelPurchaseCosts = labels.labelPurchaseCosts ?? 'Taxes & purchase costs';
  const labelSavingsResult = labels.labelSavingsResult ?? 'Your savings';
  const labelMortgageResult = labels.labelMortgageResult ?? 'Mortgage amount';
  const labelInterestResult = labels.labelInterestResult ?? 'Mortgage interest';
  const labelTotalWithMortgage = labels.labelTotalWithMortgage ?? 'Property total cost with mortgage';
  const chartLabelSavings = labels.chartLabelSavings ?? 'Your savings';
  const chartLabelMortgage = labels.chartLabelMortgage ?? 'Mortgage';
  const chartLabelInterest = labels.chartLabelInterest ?? 'Interest';

  // Bounds
  const priceMin = L.priceMin;
  const priceMax = L.priceMax;
  const savingsStep = L.savingsStep;
  const loanTermMin = L.loanTermMin;
  const loanTermMax = L.loanTermMax;
  const rateStep = L.rateStep;
  const rateMin = L.rateMin;
  const rateMax = L.rateMax;

  // State
  const initPrice = propertyPrice ?? L.defaultPrice;
  const [price, setPrice] = useState<number>(initPrice);
  const [savings, setSavings] = useState<number>(Math.round(initPrice * (L.defaultSavingsPct / 100)));
  const [term, setTerm] = useState<number>(L.defaultLoanTerm);
  const [rateType, setRateType] = useState<'fixed' | 'variable'>(L.defaultRateType);
  const [fixedRate, setFixedRate] = useState<number>(L.fixedRate);
  const [variableRate, setVariableRate] = useState<number>(L.variableRate);
  const [condition, setCondition] = useState<string>(L.defaultCondition || 'resale');
  const [priceInput, setPriceInput] = useState(fmtNum(initPrice));
  const [savingsInput, setSavingsInput] = useState(fmtNum(Math.round(initPrice * (L.defaultSavingsPct / 100))));
  const [termInput, setTermInput] = useState(String(L.defaultLoanTerm));

  const activeRate = rateType === 'fixed' ? fixedRate : variableRate;
  const setActiveRate = rateType === 'fixed' ? setFixedRate : setVariableRate;

  const savingsMin = 0;
  const clampedSavings = Math.min(savings, price);

  // Tax calculation
  const newBuildTaxRateVal = L.newBuildTaxRate;
  const newBuildStampDutyRateVal = L.newBuildStampDutyRate;
  const resaleTaxRateVal = L.resaleTaxRate;
  const notary = L.notaryCost;
  const registry = L.registryCost;
  const gestoria = L.gestoriaCost;
  const valuation = L.valuationCost;

  const purchaseTaxRate = condition === 'new'
    ? (newBuildTaxRateVal + newBuildStampDutyRateVal) / 100
    : resaleTaxRateVal / 100;
  const taxAmount = price * purchaseTaxRate;
  const purchaseCosts = taxAmount + notary + registry + gestoria + valuation;

  // Mortgage calculations
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
  const savingsPctVal = price > 0 ? Math.round((clampedSavings / price) * 100) : 0;
  const ltvPct = price > 0 ? Math.round((principal / price) * 100) : 0;
  const totalWithMortgage = clampedSavings + totalRepayment;

  // Chart percentages
  const barTotal = price + totalInterest;
  const savingsPct = barTotal > 0 ? Math.round((clampedSavings / barTotal) * 10000) / 100 : 0;
  const principalPct = barTotal > 0 ? Math.round((principal / barTotal) * 10000) / 100 : 0;
  const interestPct = barTotal > 0 ? Math.round((totalInterest / barTotal) * 10000) / 100 : 0;

  // Warning
  const minSavingsWarningPct = L.minSavingsWarning;
  const showWarning = price > 0 && clampedSavings < price * (minSavingsWarningPct / 100);

  // Input handlers
  const handlePriceBlur = () => {
    const v = Math.max(priceMin, parseNum(priceInput));
    setPrice(v);
    setPriceInput(fmtNum(v));
    if (savings > v) {
      setSavings(v);
      setSavingsInput(fmtNum(v));
    }
  };

  const handleSavingsBlur = () => {
    const v = Math.min(price, Math.max(savingsMin, parseNum(savingsInput)));
    setSavings(v);
    setSavingsInput(fmtNum(v));
  };

  const handleTermBlur = () => {
    const raw = parseInt(termInput.replace(/[^0-9]/g, ''), 10);
    const v = isNaN(raw) ? loanTermMin : Math.min(loanTermMax, Math.max(loanTermMin, raw));
    setTerm(v);
    setTermInput(String(v));
  };

  return (
    <div className="msim-body-card">
      <div className="msim-inputs-col">
        {/* Price */}
        <div className="msim-field">
          <label className="msim-label">{labelPrice}</label>
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
          <label className="msim-label">{labelSavings}</label>
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
            <span className="msim-value-pct">{savingsPctVal}%</span>
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
          <label className="msim-label">{labelTerm}</label>
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
            <span className="msim-value-pct">{unitYears}</span>
          </div>
          <Slider value={term} min={loanTermMin} max={loanTermMax} step={1}
            onChange={v => { setTerm(v); setTermInput(String(v)); }} />
          <div className="msim-slider-marks"><span>{loanTermMin} yr</span><span>{loanTermMax} yr</span></div>
        </div>

        {/* Interest Type */}
        <div className="msim-field msim-field--row">
          <label className="msim-label">
            {labelInterestType}
            {L.interestTooltip && <Tooltip content={L.interestTooltip} />}
          </label>
          <div className="msim-interest-controls">
            <label className={`msim-radio-label ${rateType === 'fixed' ? 'msim-radio-label--active' : ''}`}>
              <input type="radio" name="rateType" value="fixed" checked={rateType === 'fixed'} onChange={() => setRateType('fixed')} />
              {labelFixed}
            </label>
            <label className={`msim-radio-label ${rateType === 'variable' ? 'msim-radio-label--active' : ''}`}>
              <input type="radio" name="rateType" value="variable" checked={rateType === 'variable'} onChange={() => setRateType('variable')} />
              {labelVariable}
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
            <label className="msim-label">{labelCondition}</label>
            <div className="msim-radio-group">
              <label className={`msim-radio-label ${condition === 'new' ? 'msim-radio-label--active' : ''}`}>
                <input type="radio" name="condition" value="new" checked={condition === 'new'} onChange={() => setCondition('new')} />
                {labelNew}
              </label>
              <label className={`msim-radio-label ${condition === 'resale' ? 'msim-radio-label--active' : ''}`}>
                <input type="radio" name="condition" value="resale" checked={condition === 'resale'} onChange={() => setCondition('resale')} />
                {labelResale}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Panel */}
      <div className="msim-results-col">
        {/* Monthly Payment Hero */}
        <div className="msim-result-hero">
          <div className="msim-label">{labelMonthlyInstallment}</div>
          <div className="msim-result-hero-value">{fmtDec(monthlyPayment)}</div>
        </div>

        {/* Top Stats */}
        <div className="msim-result-stats">
          <div className="msim-result-stat-row">
            <span className="msim-stat-label">
              {labelMortgageAmount}
              {L.tooltipMortgageAmount && <Tooltip content={L.tooltipMortgageAmount} />}
            </span>
            <span className="msim-stat-value">{fmt(principal)}</span>
          </div>
          <div className="msim-result-stat-row">
            <span className="msim-stat-label">
              {labelFinancingPercent}
              {L.tooltipFinancingPercent && <Tooltip content={L.tooltipFinancingPercent} />}
            </span>
            <span className="msim-stat-value">{ltvPct}%</span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="msim-breakdown">
          <div className="msim-breakdown-row">
            <span className="msim-breakdown-dot msim-dot--gold" />
            <span className="msim-breakdown-label">{labelPropertyPrice}</span>
            <span className="msim-breakdown-value">{fmt(price)}</span>
          </div>
        </div>

        {/* Combined stacked bar chart */}
        <div className="msim-bars-combined">
          <div className="msim-bar-track msim-bar-track--top" style={{ width: `${savingsPct + principalPct}%` }}>
            <div className="msim-bar-seg msim-bar-seg--gold" style={{ width: '100%' }} />
          </div>
          <div className="msim-bar-track msim-bar-track--bottom">
            <div className="msim-bar-seg msim-bar-seg--savings" style={{ width: `${savingsPct}%` }} />
            <div className="msim-bar-seg msim-bar-seg--mortgage" style={{ width: `${principalPct}%` }} />
            <div className="msim-bar-seg msim-bar-seg--interest" style={{ width: `${interestPct}%` }} />
          </div>
          <div className="msim-bar-divider" style={{ left: `${savingsPct}%` }} />
          <div className="msim-bar-labels">
            <span style={{ width: `${savingsPct}%`, minWidth: 0 }}>{chartLabelSavings}</span>
            <span style={{ width: `${principalPct}%`, minWidth: 0, textAlign: 'center' }}>{chartLabelMortgage}</span>
            <span style={{ width: `${interestPct}%`, minWidth: 0, textAlign: 'right' }}>{chartLabelInterest}</span>
          </div>
        </div>

        {/* Bottom Breakdown */}
        <div className="msim-breakdown">
          <div className="msim-breakdown-row">
            <span className="msim-breakdown-dot msim-dot--teal-light" />
            <span className="msim-breakdown-label">{labelSavingsResult}</span>
            <span className="msim-breakdown-value">{fmt(clampedSavings)}</span>
          </div>
          <div className="msim-breakdown-row">
            <span className="msim-breakdown-dot msim-dot--teal" />
            <span className="msim-breakdown-label">{labelMortgageResult}</span>
            <span className="msim-breakdown-value">{fmt(principal)}</span>
          </div>
          <div className="msim-breakdown-row">
            <span className="msim-breakdown-dot msim-dot--teal-dark" />
            <span className="msim-breakdown-label">{labelInterestResult}</span>
            <span className="msim-breakdown-value">{fmt(totalInterest)}</span>
          </div>
          <div className="msim-breakdown-row msim-breakdown-row--total">
            <span className="msim-breakdown-label msim-breakdown-label--bold">{labelTotalWithMortgage}</span>
            <span className="msim-breakdown-value msim-breakdown-value--bold">{fmt(totalWithMortgage)}</span>
          </div>
          <div className="msim-breakdown-row">
            <span className="msim-breakdown-label msim-breakdown-label--bold">
              {labelPurchaseCosts}
            </span>
            <span className="msim-breakdown-value msim-breakdown-value--bold">{fmt(purchaseCosts)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}