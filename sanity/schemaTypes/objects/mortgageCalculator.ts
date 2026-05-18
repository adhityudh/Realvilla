import { defineField, defineType } from 'sanity'

export const mortgageCalculator = defineType({
  name: 'mortgageCalculator',
  title: 'Mortgage Calculator Settings',
  type: 'object',
  groups: [
    { name: 'simulator', title: '🔢 Simulator Settings' },
    { name: 'rates', title: '📈 Interest Rates' },
    { name: 'taxes', title: '🏛️ Taxes & Costs (Tenerife)' },
    { name: 'labels', title: '🏷️ Labels & Tooltips' },
  ],
  fields: [
    // ── Property Price Range ──────────────────────────────────────
    defineField({
      name: 'defaultPrice',
      title: 'Default Property Price (€)',
      type: 'number',
      group: 'simulator',
    }),

    // ── Savings / Down Payment Range ──────────────────────────────────────
    defineField({
      name: 'minSavingsPct',
      title: 'Min Savings / Down Payment (% of property price)',
      type: 'number',
      description: 'Minimum down payment percentage required by banks (e.g. 10 or 20).',
      group: 'simulator',
    }),
    defineField({
      name: 'savingsStep',
      title: 'Savings Slider Step (€)',
      type: 'number',
      group: 'simulator',
    }),
    defineField({
      name: 'defaultSavingsPct',
      title: 'Default Savings (% of property price)',
      type: 'number',
      description: 'e.g. 30 = 30% of the property price as default savings.',
      group: 'simulator',
    }),
    defineField({
      name: 'minSavingsWarning',
      title: 'Min Savings Warning (% of price)',
      type: 'number',
      description: 'Show a warning if savings < this % of property price. In Tenerife banks require 10% min + costs.',
      group: 'simulator',
    }),
    defineField({
      name: 'minSavingsWarningText',
      title: 'Min Savings Warning Text',
      type: 'string',
      description: 'Informational text shown when savings are below the minimum threshold.',
      group: 'simulator',
    }),

    // ── Loan Term ──────────────────────────────────────
    defineField({
      name: 'loanTermMin',
      title: 'Minimum Loan Term (Years)',
      type: 'number',
      group: 'simulator',
    }),
    defineField({
      name: 'loanTermMax',
      title: 'Maximum Loan Term (Years)',
      type: 'number',
      group: 'simulator',
    }),
    defineField({
      name: 'defaultLoanTerm',
      title: 'Default Loan Term (Years)',
      type: 'number',
      group: 'simulator',
    }),

    // ── Interest Rates ──────────────────────────────────────
    defineField({
      name: 'fixedRate',
      title: 'Fixed Interest Rate (%)',
      type: 'number',
      description: 'Default fixed interest rate for Tenerife (e.g. 3.5).',
      group: 'rates',
    }),
    defineField({
      name: 'variableRate',
      title: 'Variable Interest Rate (%)',
      type: 'number',
      description: 'Default variable interest rate for Tenerife (e.g. 3.06).',
      group: 'rates',
    }),
    defineField({
      name: 'rateStep',
      title: 'Rate Adjustment Step (%)',
      type: 'number',
      description: 'Increment/decrement amount when user clicks +/- on rate.',
      group: 'rates',
    }),
    defineField({
      name: 'rateMin',
      title: 'Minimum Rate (%)',
      type: 'number',
      group: 'rates',
    }),
    defineField({
      name: 'rateMax',
      title: 'Maximum Rate (%)',
      type: 'number',
      group: 'rates',
    }),
    defineField({
      name: 'defaultRateType',
      title: 'Default Rate Type',
      type: 'string',
      options: {
        list: [
          { title: 'Fixed', value: 'fixed' },
          { title: 'Variable', value: 'variable' },
        ],
        layout: 'radio',
      },
      group: 'rates',
    }),
    defineField({
      name: 'interestTooltip',
      title: 'Interest Rate Tooltip',
      type: 'text',
      description: 'Informational tooltip shown next to the interest type label.',
      group: 'rates',
    }),

    // ── Property Condition & Taxes (Tenerife specific) ──────────────────────────────────────
    defineField({
      name: 'enablePropertyCondition',
      title: 'Enable Property Condition Toggle',
      type: 'boolean',
      description: 'Show New / Resale property toggle that affects tax calculation.',
      group: 'taxes',
    }),
    defineField({
      name: 'defaultCondition',
      title: 'Default Property Condition',
      type: 'string',
      options: {
        list: [
          { title: 'New Build (IVA)', value: 'new' },
          { title: 'Resale (ITP)', value: 'resale' },
        ],
        layout: 'radio',
      },
      hidden: ({ parent }) => !parent?.enablePropertyCondition,
      group: 'taxes',
    }),

    // Tenerife taxes for NEW BUILD (IVA 7% in Canary Islands - IGIC)
    defineField({
      name: 'newBuildTaxRate',
      title: 'New Build Tax Rate (%) — IGIC in Canary Islands',
      type: 'number',
      description: 'In Tenerife/Canary Islands, new builds pay IGIC (7%) instead of IVA (10%).',
      group: 'taxes',
    }),
    defineField({
      name: 'newBuildStampDutyRate',
      title: 'New Build Stamp Duty / AJD Rate (%)',
      type: 'number',
      description: 'Actos Jurídicos Documentados for new builds in Canary Islands.',
      group: 'taxes',
    }),

    // Tenerife taxes for RESALE (ITP)
    defineField({
      name: 'resaleTaxRate',
      title: 'Resale Transfer Tax Rate (%) — ITP in Canary Islands',
      type: 'number',
      description: 'ITP rate for resale properties in Tenerife. Standard is 6.5%.',
      group: 'taxes',
    }),

    // Fixed purchase costs (same for both conditions)
    defineField({
      name: 'notaryCost',
      title: 'Notary Cost (€)',
      type: 'number',
      description: 'Estimated notary cost. This is a fixed estimate.',
      group: 'taxes',
    }),
    defineField({
      name: 'registryCost',
      title: 'Land Registry Cost (€)',
      type: 'number',
      description: 'Estimated land registry cost.',
      group: 'taxes',
    }),
    defineField({
      name: 'gestoriaCost',
      title: 'Gestoria Cost (€)',
      type: 'number',
      description: 'Estimated administrative/gestoria cost.',
      group: 'taxes',
    }),
    defineField({
      name: 'valuationCost',
      title: 'Mortgage Valuation Cost (€)',
      type: 'number',
      description: 'Tasación — cost paid by buyer to value the property for the mortgage.',
      group: 'taxes',
    }),

    // ── UI Labels & Tooltip Texts (Fully Customizable) ──────────────────────────────────────
    defineField({
      name: 'labelPrice',
      title: 'Label: Property Price',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelSavings',
      title: 'Label: Savings / Down Payment',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelTerm',
      title: 'Label: Loan Term',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelInterestType',
      title: 'Label: Interest Type',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelFixed',
      title: 'Label: Fixed Rate',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelVariable',
      title: 'Label: Variable Rate',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelCondition',
      title: 'Label: Property Condition',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelNew',
      title: 'Label: New Build',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelResale',
      title: 'Label: Resale',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelMonthlyInstallment',
      title: 'Label: Monthly Installment (Result Title)',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelMortgageAmount',
      title: 'Label: Mortgage Amount',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelFinancingPercent',
      title: 'Label: Financing Percentage',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelPropertyPrice',
      title: 'Label: Property Price (in results)',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelPurchaseCosts',
      title: 'Label: Purchase Costs',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelTotalPropertyCost',
      title: 'Label: Total Property Cost',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelSavingsResult',
      title: 'Label: Savings (in results)',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelMortgageResult',
      title: 'Label: Mortgage (in results)',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelInterestResult',
      title: 'Label: Total Interest (in results)',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelTotalWithMortgage',
      title: 'Label: Total Cost with Mortgage',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'labelViewAmortization',
      title: 'Label: View Amortization Table Link',
      type: 'string',
      group: 'labels',
    }),

    // ── Tooltip texts ──────────────────────────────────────
    defineField({
      name: 'tooltipMortgageAmount',
      title: 'Tooltip: Mortgage Amount',
      type: 'text',
      group: 'labels',
    }),
    defineField({
      name: 'tooltipFinancingPercent',
      title: 'Tooltip: Financing Percentage (LTV)',
      type: 'text',
      group: 'labels',
    }),
    defineField({
      name: 'tooltipPurchaseCosts',
      title: 'Tooltip: Purchase Costs (Taxes & Fees)',
      type: 'text',
      group: 'labels',
    }),

    // ── Tax Breakdown Modal Labels ──────────────────────────────────────
    defineField({
      name: 'modalTitle',
      title: 'Modal Title: Taxes & Costs',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalSubtitle',
      title: 'Modal Subtitle',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalPurchaseCostsTitle',
      title: 'Modal: Purchase Costs Group Title',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalMortgageCostsTitle',
      title: 'Modal: Mortgage Costs Group Title',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalLabelNotary',
      title: 'Modal: Label — Notary',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalLabelRegistry',
      title: 'Modal: Label — Land Registry',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalLabelGestoria',
      title: 'Modal: Label — Gestoria',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalLabelTax',
      title: 'Modal: Label — Tax (IGIC/ITP)',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalLabelValuation',
      title: 'Modal: Label — Valuation',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalValuationNote',
      title: 'Modal: Valuation Note',
      type: 'text',
      group: 'labels',
    }),
    defineField({
      name: 'modalTotalLabel',
      title: 'Modal: Total Label',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'modalDisclaimer',
      title: 'Modal: Disclaimer',
      type: 'text',
      group: 'labels',
    }),

    // ── Chart labels ──────────────────────────────────────
    defineField({
      name: 'chartLabelSavings',
      title: 'Chart Label: Your Savings',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'chartLabelMortgage',
      title: 'Chart Label: Mortgage',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'chartLabelInterest',
      title: 'Chart Label: Interest',
      type: 'string',
      group: 'labels',
    }),

    // ── Amortization Table Labels ──────────────────────────────────────
    defineField({
      name: 'amortTableTitle',
      title: 'Amortization Table: Title',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'amortLabelYear',
      title: 'Amortization Table: Year',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'amortLabelInstallment',
      title: 'Amortization Table: Monthly Installment',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'amortLabelCapital',
      title: 'Amortization Table: Capital Repaid',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'amortLabelInterest',
      title: 'Amortization Table: Interest Paid',
      type: 'string',
      group: 'labels',
    }),
    defineField({
      name: 'amortLabelBalance',
      title: 'Amortization Table: Remaining Balance',
      type: 'string',
      group: 'labels',
    }),
  ],
})
