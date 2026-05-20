import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-05-02',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const enDefaults = {
  priceMin: 0,
  priceMax: 3000000,
  defaultPrice: 500000,
  minSavingsPct: 0,
  savingsStep: 5000,
  defaultSavingsPct: 30,
  minSavingsWarning: 10,
  minSavingsWarningText: 'Banks typically require a minimum 10% down payment plus costs.',
  loanTermMin: 5,
  loanTermMax: 30,
  defaultLoanTerm: 25,
  fixedRate: 3.5,
  variableRate: 3.06,
  rateStep: 0.05,
  rateMin: 0.1,
  rateMax: 15,
  defaultRateType: 'variable',
  interestTooltip: 'Select fixed rate for stable monthly payments or variable rate linked to Euribor.',
  enablePropertyCondition: true,
  defaultCondition: 'resale',
  newBuildTaxRate: 7,
  newBuildStampDutyRate: 1,
  resaleTaxRate: 6.5,
  notaryCost: 1000,
  registryCost: 500,
  gestoriaCost: 350,
  valuationCost: 400,
  unitYears: 'years',
  labelPrice: 'Property Price',
  labelSavings: 'Your Savings',
  labelTerm: 'Loan Term',
  labelInterestType: 'Interest Type',
  labelFixed: 'Fixed',
  labelVariable: 'Variable',
  labelCondition: 'Property Condition',
  labelNew: 'New Build',
  labelResale: 'Resale',
  labelMonthlyInstallment: 'Your Monthly Payment',
  labelMortgageAmount: 'Mortgage amount',
  labelFinancingPercent: 'Financing percentage',
  labelPropertyPrice: 'Property price',
  labelPurchaseCosts: 'Taxes & purchase costs',
  labelTotalPropertyCost: 'Total property cost',
  labelSavingsResult: 'Your savings',
  labelMortgageResult: 'Mortgage amount',
  labelInterestResult: 'Mortgage interest',
  labelTotalWithMortgage: 'Total cost with mortgage',
  labelViewAmortization: 'View amortization table',
  tooltipMortgageAmount: 'The total amount of money borrowed from the bank.',
  tooltipFinancingPercent: 'Loan-to-Value (LTV) ratio: the mortgage amount divided by the property price.',
  tooltipPurchaseCosts: 'Estimated taxes and expenses associated with buying a property in Tenerife.',
  modalTitle: 'Taxes & Costs',
  modalSubtitle: 'Based on Tenerife (Canary Islands) rates.',
  modalPurchaseCostsTitle: 'Purchase Costs',
  modalMortgageCostsTitle: 'Mortgage Costs',
  modalLabelNotary: 'Notary:',
  modalLabelRegistry: 'Land Registry:',
  modalLabelGestoria: 'Gestoria:',
  modalLabelTax: 'Transfer Tax:',
  modalLabelValuation: 'Valuation (Tasación):',
  modalValuationNote: 'Required by the bank to approve the mortgage.',
  modalTotalLabel: 'Total estimated costs:',
  modalDisclaimer: 'Note: These costs are estimates based on regional standard rates. Actual costs may vary depending on the notary and your specific mortgage terms.',
  chartLabelSavings: 'Your savings',
  chartLabelMortgage: 'Mortgage',
  chartLabelInterest: 'Interest',
  amortTableTitle: 'Amortization Table',
  amortTableSubtitle: 'Yearly payment breakdown',
  amortLabelYear: 'Year',
  amortLabelInstallment: 'Annual Payment',
  amortLabelCapital: 'Capital',
  amortLabelInterest: 'Interest',
  amortLabelBalance: 'Balance',
};

const esDefaults = {
  priceMin: 0,
  priceMax: 3000000,
  defaultPrice: 500000,
  minSavingsPct: 0,
  savingsStep: 5000,
  defaultSavingsPct: 30,
  minSavingsWarning: 10,
  minSavingsWarningText: 'Los bancos suelen exigir un pago inicial mínimo del 10% más los gastos.',
  loanTermMin: 5,
  loanTermMax: 30,
  defaultLoanTerm: 25,
  fixedRate: 3.5,
  variableRate: 3.06,
  rateStep: 0.05,
  rateMin: 0.1,
  rateMax: 15,
  defaultRateType: 'variable',
  interestTooltip: 'Seleccione tipo fijo para cuotas mensuales estables o variable vinculado al Euríbor.',
  enablePropertyCondition: true,
  defaultCondition: 'resale',
  newBuildTaxRate: 7,
  newBuildStampDutyRate: 1,
  resaleTaxRate: 6.5,
  notaryCost: 1000,
  registryCost: 500,
  gestoriaCost: 350,
  valuationCost: 400,
  unitYears: 'años',
  labelPrice: 'Precio de la Propiedad',
  labelSavings: 'Tus Ahorros',
  labelTerm: 'Plazo del Préstamo',
  labelInterestType: 'Tipo de Interés',
  labelFixed: 'Fijo',
  labelVariable: 'Variable',
  labelCondition: 'Estado de la Propiedad',
  labelNew: 'Obra Nueva',
  labelResale: 'Segunda Mano',
  labelMonthlyInstallment: 'Tu Cuota Mensual',
  labelMortgageAmount: 'Importe de la hipoteca',
  labelFinancingPercent: 'Porcentaje de financiación',
  labelPropertyPrice: 'Precio de la propiedad',
  labelPurchaseCosts: 'Impuestos y gastos de compra',
  labelTotalPropertyCost: 'Coste total de la propiedad',
  labelSavingsResult: 'Tus ahorros',
  labelMortgageResult: 'Importe de la hipoteca',
  labelInterestResult: 'Intereses de la hipoteca',
  labelTotalWithMortgage: 'Coste total con hipoteca',
  labelViewAmortization: 'Ver tabla de amortización',
  tooltipMortgageAmount: 'El importe total prestado por el banco.',
  tooltipFinancingPercent: 'Relación Préstamo-Valor (LTV): el importe de la hipoteca dividido por el precio de la propiedad.',
  tooltipPurchaseCosts: 'Impuestos y gastos estimados asociados a la compra de una propiedad en Tenerife.',
  modalTitle: 'Impuestos y Gastos',
  modalSubtitle: 'Basado en las tasas de Tenerife (Islas Canarias).',
  modalPurchaseCostsTitle: 'Gastos de Compra',
  modalMortgageCostsTitle: 'Gastos de la Hipoteca',
  modalLabelNotary: 'Notaría:',
  modalLabelRegistry: 'Registro de la Propiedad:',
  modalLabelGestoria: 'Gestoría:',
  modalLabelTax: 'Impuesto de Transmisiones:',
  modalLabelValuation: 'Tasación:',
  modalValuationNote: 'Requerido por el banco para aprobar la hipoteca.',
  modalTotalLabel: 'Total gastos estimados:',
  modalDisclaimer: 'Nota: Estos gastos son estimaciones basadas en tasas regionales estándar. Los costes reales pueden variar según la notaría y las condiciones de su hipoteca.',
  chartLabelSavings: 'Tus ahorros',
  chartLabelMortgage: 'Hipoteca',
  chartLabelInterest: 'Intereses',
  amortTableTitle: 'Tabla de Amortización',
  amortTableSubtitle: 'Desglose de pagos anuales',
  amortLabelYear: 'Año',
  amortLabelInstallment: 'Pago Anual',
  amortLabelCapital: 'Capital',
  amortLabelInterest: 'Interés',
  amortLabelBalance: 'Balance Pendiente',
};

async function seed() {
  console.log('🔄 Fetching all settings documents...');
  const settingsDocs = await client.fetch(`*[_type == "settings"] { _id, language }`);
  console.log(`🔎 Found ${settingsDocs.length} settings documents.`);

  for (const doc of settingsDocs) {
    const isEs = doc.language === 'es';
    const defaults = isEs ? esDefaults : enDefaults;
    console.log(`🌱 Seeding global settings document ${doc._id} (${doc.language || 'en'})...`);
    await client.patch(doc._id)
      .set({ mortgageCalculator: defaults })
      .commit();
    console.log(`✅ Seeded settings document ${doc._id} successfully.`);
  }

  console.log('🔄 Fetching all page documents with mortgage sections...');
  const pages = await client.fetch(`*[_type == "page" && count(sections[_type == "buyMortgageSimSection"]) > 0] { _id, language, sections }`);
  console.log(`🔎 Found ${pages.length} page documents.`);

  for (const page of pages) {
    const isEs = page.language === 'es';
    const defaults = isEs ? esDefaults : enDefaults;
    const mortgageSections = page.sections.filter(s => s._type === 'buyMortgageSimSection');

    for (const section of mortgageSections) {
      console.log(`🌱 Seeding section ${section._key} in page ${page._id} (${page.language || 'en'})...`);
      // Build updated section with defaults merged in, page-specific text is preserved
      const updatedSection = {
        ...section,
        ...defaults,
        // Make sure we keep the page's original IDs and main copy fields if they exist
        tagline: section.tagline || defaults.tagline,
        headline: section.headline || defaults.headline,
        body: section.body || defaults.body,
        disclaimerText: section.disclaimerText || defaults.disclaimerText,
        ctaLabel: section.ctaLabel || defaults.ctaLabel,
      };

      await client.patch(page._id)
        .set({ [`sections[_key=="${section._key}"]`]: updatedSection })
        .commit();
      console.log(`✅ Seeded section ${section._key} in page ${page._id} successfully.`);
    }
  }

  console.log('🎉 Seeding successfully completed!');
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
