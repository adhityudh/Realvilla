'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/ui/Button';
import './BuyMortgageSimSection.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BuyMortgageSimSection({ data, dict, contextData }: { data?: any; dict?: any; contextData?: any }) {
  const sectionRef = useRef<HTMLElement>(null);

  // Logic based on dictionary presence (Realvilla standard convention)
  const labels = {
    title: dict?.mortgage?.result_title,
    installments: dict?.mortgage?.result_installments,
    duration: dict?.mortgage?.result_duration,
    interest: dict?.mortgage?.result_interest,
    total: dict?.mortgage?.result_total,
    unitInstallments: dict?.mortgage?.unit_installments,
    unitYears: dict?.mortgage?.unit_years,
    unitYear: dict?.mortgage?.unit_year,
    price: dict?.mortgage?.field_price,
    down: dict?.mortgage?.field_down,
    term: dict?.mortgage?.field_term,
    disclaimer: data?.disclaimerText
  };

  // --- Dynamic Limits from CMS ---
  const minDP = data?.downPaymentMin ?? 20;
  const maxDP = data?.downPaymentMax ?? 100;
  const minTerm = data?.loanTermMin ?? 1;
  const maxTerm = data?.loanTermMax ?? 30;

  // --- Simulator State ---
  const [price, setPrice] = useState<number>(contextData?.propertyPrice ?? data?.defaultPrice ?? 500000);
  // Initialize with dynamic minimum bounded correctly
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(Math.max(minDP, Math.min(maxDP, 20)));
  const [loanTerm, setLoanTerm] = useState<number>(Math.max(minTerm, Math.min(maxTerm, 25)));

  // Rate comes from CMS or falls back to 3.5%
  const annualInterestRate = data?.defaultInterestRate || 3.5;

  // --- Dynamic Calculations ---
  const downPaymentAmount = useMemo(() => {
    return (price * downPaymentPercent) / 100;
  }, [price, downPaymentPercent]);

  const loanPrincipal = useMemo(() => {
    return Math.max(0, price - downPaymentAmount);
  }, [price, downPaymentAmount]);

  const monthlyPayment = useMemo(() => {
    if (loanPrincipal <= 0) return 0;

    const monthlyRate = annualInterestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      return loanPrincipal / numberOfPayments;
    }

    const payment = (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return isFinite(payment) ? payment : 0;
  }, [loanPrincipal, annualInterestRate, loanTerm]);

  const totalRepayment = useMemo(() => {
    return monthlyPayment * 12 * loanTerm;
  }, [monthlyPayment, loanTerm]);

  // Helper to format typed price input with dynamic thousand commas
  const formatNumberWithCommas = (num: number): string => {
    if (isNaN(num)) return '';
    if (num === 0) return '0';
    return num.toLocaleString('en-IE'); // Matches core site comma formatting
  };

  // Helper to parse back to raw number safely
  const parseCommasToNumber = (val: string): number => {
    // Remove currency, spaces, commas and letters to isolate numeric sequence
    const clean = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Helper for Currency Formatting - using site-standard 'en-IE' for correct EUR placement and comma separation
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format with Cents
  const formatEuroDec = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // --- GSAP Entry Animations (Same as Valuation) ---
  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const elements = section.querySelectorAll(
      '.mortgage-sim-header-left, .mortgage-sim-header-right, .mortgage-sim-card'
    );

    gsap.set(elements, { opacity: 0, y: 25, filter: 'blur(6px)' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'restart none none reverse'
      }
    });

    tl.fromTo(elements,
      { y: 25, opacity: 0, filter: 'blur(6px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2, ease: 'power3.out' }
    );

    // Force layout recalculation after setting triggers
    ScrollTrigger.refresh();

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(st => st.kill());
    };
  }, [data]);

  if (!data) return null;

  return (
    <section className="mortgage-sim-section" ref={sectionRef}>
      <div className="mortgage-sim-container">

        {/* ── Top Row: Split Header ── */}
        <div className="mortgage-sim-header-row">
          <div className="mortgage-sim-header-left">
            {data.tagline && <div className="mortgage-sim-tagline">{data.tagline}</div>}
            <h2 className="mortgage-sim-headline">{data.headline}</h2>
          </div>

          <div className="mortgage-sim-header-right">
            <p className="mortgage-sim-body">{data.body}</p>
            {data.ctaLabel && (
              <div className="mortgage-sim-cta-wrap">
                <Button
                  label={data.ctaLabel}
                  href={data.ctaLink || '#'}
                  variant="dark"
                  className="mortgage-sim-cta"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Row: Wide Split Card ── */}
        <div className="mortgage-sim-card-wrapper">
          <div className="mortgage-sim-card">

            {/* Left Side: Inputs Collection */}
            <div className="mortgage-sim-inputs-col">
              {/* Field 1: Price */}
              <div className="calc-field">
                <div className="calc-label-row">
                  <label className="calc-label">{labels.price}</label>
                </div>
                <div className="calc-input-group">
                  <span className="calc-currency-symbol">€</span>
                  <input
                    type="text"
                    className="calc-text-input"
                    value={formatNumberWithCommas(price)}
                    onChange={(e) => setPrice(parseCommasToNumber(e.target.value))}
                  />
                </div>
              </div>

              <div className="calc-sliders-row">
                {/* Field 2: Down Payment */}
                <div className="calc-field slider-field">
                  <div className="calc-label-row">
                    <label className="calc-label">{labels.down}</label>
                    <span className="calc-value-display">{downPaymentPercent}% ({formatEuro(downPaymentAmount)})</span>
                  </div>
                  <div className="calc-slider-wrapper">
                    <input
                      type="range"
                      min={minDP}
                      max={maxDP}
                      step="5"
                      className="calc-slider"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    />
                    <div className="range-track-bar">
                      <div
                        className="range-active-fill"
                        style={{ width: `${((downPaymentPercent - minDP) / Math.max(1, maxDP - minDP)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="slider-marks">
                    <span>{minDP}% (Min)</span>
                    <span>{maxDP}%</span>
                  </div>
                </div>

                {/* Field 3: Loan Term */}
                <div className="calc-field slider-field">
                  <div className="calc-label-row">
                    <label className="calc-label">{labels.term}</label>
                    <span className="calc-value-display">{loanTerm} {labels.unitYears}</span>
                  </div>
                  <div className="calc-slider-wrapper">
                    <input
                      type="range"
                      min={minTerm}
                      max={maxTerm}
                      step="1"
                      className="calc-slider"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                    />
                    <div className="range-track-bar">
                      <div
                        className="range-active-fill"
                        style={{ width: `${((loanTerm - minTerm) / Math.max(1, maxTerm - minTerm)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="slider-marks">
                    <span>{minTerm} {minTerm === 1 ? labels.unitYear : labels.unitYears}</span>
                    <span>{maxTerm} {labels.unitYears}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Solid Gold Output Banner */}
            <div className="calc-results-col">
              <div className="calc-results-inner">

                <div className="results-hero">
                  <div className="result-label">{labels.title}</div>
                  <div className="result-value">{formatEuroDec(monthlyPayment)}</div>
                </div>

                <div className="result-summary-box">
                  <div className="summary-row">
                    <span className="summary-label">{labels.installments}</span>
                    <span className="summary-value">{loanTerm * 12} {labels.unitInstallments}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">{labels.duration}</span>
                    <span className="summary-value">{loanTerm} {labels.unitYears}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">{labels.interest}</span>
                    <span className="summary-value">{annualInterestRate}%</span>
                  </div>
                  <div className="summary-row total-row">
                    <span className="summary-label">{labels.total}</span>
                    <span className="summary-value">{formatEuroDec(totalRepayment)}</span>
                  </div>
                </div>

                <div className="result-note">
                  {labels.disclaimer}
                </div>

                {data?.ctaLabel && data?.ctaLink && (
                  <div className="result-cta">
                    <Link href={data.ctaLink} className="result-cta-link">
                      {data.ctaLabel}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
