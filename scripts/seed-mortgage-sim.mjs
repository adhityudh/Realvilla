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

async function seed() {
  // ── English Payload ──
  const enSection = {
    _type: 'buyMortgageSimSection',
    _key: `ms_${Date.now()}`,
    tagline: 'MORTGAGE CALCULATOR',
    headline: 'Estimate Your Monthly Installments Instantly',
    body: 'Use our high-fidelity simulator to visualize and project your fiscal requirements based on standard local bank parameters.',
    trustText: 'Calculation includes general bank estimates, 3.5% fixed rate.',
    defaultInterestRate: 3.5,
    ctaLabel: 'Start Financing Consultation',
    linkType: 'external',
    externalLink: '#contact'
  };

  // ── Spanish Payload ──
  const esSection = {
    _type: 'buyMortgageSimSection',
    _key: `ms_${Date.now()}_es`,
    tagline: 'CALCULADORA HIPOTECARIA',
    headline: 'Estime sus Cuotas Mensuales Al Instante',
    body: 'Utilice nuestro simulador de alta fidelidad para visualizar y proyectar sus requisitos fiscales basados en parámetros bancarios locales estándar.',
    trustText: 'El cálculo incluye estimaciones generales, tasa fija del 3,5%.',
    defaultInterestRate: 3.5,
    ctaLabel: 'Iniciar Consulta de Financiación',
    linkType: 'external',
    externalLink: '#contact'
  };

  console.log('Injecting payload to pages...');
  
  // 1. English "Buy" Page
  await client.patch('79c83f1a-580b-46b4-bc88-1cc65cbc5797')
    .setIfMissing({ sections: [] })
    .append('sections', [enSection])
    .commit();
  console.log('Successfully Seeded English Mortgage Sim.');

  // 2. Spanish "Comprar" Page
  await client.patch('b8035107-9a47-45e3-b4ff-7688147cfc0b')
    .setIfMissing({ sections: [] })
    .append('sections', [esSection])
    .commit();
  console.log('Successfully Seeded Spanish Mortgage Sim.');
}

seed().catch(console.error);
