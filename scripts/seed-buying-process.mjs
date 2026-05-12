import { createClient } from '@sanity/client';
import fs from 'fs';
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

const imagePath = '/Users/yudha/.gemini/antigravity/brain/8a7f1fec-e0e0-46bf-b0df-65fb9c701823/process_doc_1_1778592442783.png';

async function seed() {
  console.log('Uploading sample image asset...');
  const imgStream = fs.createReadStream(imagePath);
  const imageAsset = await client.assets.upload('image', imgStream, {
    filename: 'process_step_generic.png',
  });
  console.log('Image uploaded:', imageAsset._id);

  const imageRef = {
    _type: 'image',
    asset: { _type: 'reference', _ref: imageAsset._id },
  };

  // ── English Payload ──
  const enSection = {
    _type: 'buyingProcessSection',
    _key: `bp_${Date.now()}`,
    tagline: 'COMPREHENSIVE GUIDE',
    headline: 'Buying Property in Tenerife',
    intro: [{
      _key: 'i1',
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [{
        _key: 'c1',
        _type: 'span',
        text: 'A clear, transparent journey to securing your paradise. Our step-by-step breakdown ensures peace of mind during the acquisition process.',
        marks: []
      }]
    }],
    steps: [
      {
        _key: 's1',
        number: '01',
        title: 'Financial Assessment & Budgeting',
        image: imageRef,
        description: [{
          _key: 'd1',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{
            _key: 'c1',
            _type: 'span',
            text: 'Understanding the true cost of entry is pivotal. Separate from the bank financing, you should calculate auxiliary cash required to cover the transaction administrative layers.',
            marks: []
          }]
        }],
        quickFacts: [
          { _key: 'f1', label: 'CASH RESERVE NEEDED', value: '8% – 9%' },
          { _key: 'f2', label: 'EXCLUDES', value: 'Bank Mortgage' },
        ]
      },
      {
        _key: 's2',
        number: '02',
        title: 'Taxes & Notary Protocol',
        image: imageRef,
        description: [{
          _key: 'd1',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{
            _key: 'c1',
            _type: 'span',
            text: 'Tenerife provides specific regional rates for Property Transfer Taxes (ITP). Additionally, notary fees fluctuate based on complex regulations and choice of professional representives.',
            marks: []
          }]
        }],
        quickFacts: [
          { _key: 'f1', label: 'PROPERTY TRANSFER TAX (ITP)', value: '6.5%' },
          { _key: 'f2', label: 'NOTARY COSTS', value: 'Variable Scale' },
        ]
      },
      {
        _key: 's3',
        number: '03',
        title: 'Closing & Documentation Support',
        image: imageRef,
        description: [{
          _key: 'd1',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{
            _key: 'c1',
            _type: 'span',
            text: 'Handing over keys, filing registration at the land registry, and formalizing ownership transfer effortlessly through dedicated legal representation.',
            marks: []
          }]
        }],
        quickFacts: [
          { _key: 'f1', label: 'TRANSPARENCY', value: '100%' },
          { _key: 'f2', label: 'CLIENT SUPPORT', value: 'Full Lifetime' },
        ]
      }
    ]
  };

  // ── Spanish Payload ──
  const esSection = JSON.parse(JSON.stringify(enSection));
  esSection.tagline = 'GUÍA COMPLETA';
  esSection.headline = 'Proceso de Compra en Tenerife';
  esSection.intro[0].children[0].text = 'Un viaje claro y transparente para asegurar tu paraíso. Nuestro desglose paso a paso garantiza tranquilidad durante el proceso.';
  esSection.steps[0].title = 'Evaluación Financiera y Presupuesto';
  esSection.steps[0].description[0].children[0].text = 'Comprender el coste real de entrada es fundamental. Aparte de la financiación bancaria, debe calcular el efectivo auxiliar necesario.';
  esSection.steps[0].quickFacts[0].label = 'RESERVA EFECTIVO';
  esSection.steps[0].quickFacts[1].label = 'EXCLUYE';
  esSection.steps[1].title = 'Impuestos y Protocolo Notarial';
  esSection.steps[1].description[0].children[0].text = 'Tenerife ofrece tipos regionales específicos para el Impuesto de Transmisiones Patrimoniales (ITP).';
  esSection.steps[1].quickFacts[0].label = 'IMPUESTO ITP';
  esSection.steps[1].quickFacts[1].label = 'GASTOS NOTARIALES';
  esSection.steps[2].title = 'Cierre y Soporte Documental';
  esSection.steps[2].description[0].children[0].text = 'Entrega de llaves y formalización de la transferencia de propiedad sin esfuerzo.';
  esSection.steps[2].quickFacts[0].label = 'TRANSPARENCIA';
  esSection.steps[2].quickFacts[1].label = 'SOPORTE CLIENTE';

  console.log('Pushing payload to pages...');
  
  // 1. English "Buy" Page
  await client.patch('79c83f1a-580b-46b4-bc88-1cc65cbc5797')
    .setIfMissing({ sections: [] })
    .append('sections', [enSection])
    .commit();
  console.log('Updated English Buy Page.');

  // 2. Spanish "Comprar" Page
  await client.patch('b8035107-9a47-45e3-b4ff-7688147cfc0b')
    .setIfMissing({ sections: [] })
    .append('sections', [esSection])
    .commit();
  console.log('Updated Spanish Comprar Page.');
}

seed().catch(console.error);
