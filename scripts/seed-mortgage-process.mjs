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

// Chosen High-Res Images for Steps (Perfectly matched wood desk & luxury editorial style)
const chosenImages = {
  step1: '/Users/yudha/.gemini/antigravity/brain/d0824f37-4158-4bac-8385-f20b71c84e8b/real_estate_step1_budget_1779122092861.png',
  step2: '/Users/yudha/.gemini/antigravity/brain/d0824f37-4158-4bac-8385-f20b71c84e8b/real_estate_step2_tiny_text_1779147370908.png', // Dynamic angle, open laptop with realistic tiny text document
  step3: '/Users/yudha/.gemini/antigravity/brain/d0824f37-4158-4bac-8385-f20b71c84e8b/real_estate_step3_room_hero_1779148083715.png', // Dynamic over-the-shoulder man viewing cozy apartment with notes (room hero, man soft-focused)
  step4: '/Users/yudha/.gemini/antigravity/brain/d0824f37-4158-4bac-8385-f20b71c84e8b/real_estate_step4_verification_1779148518529.png', // Dynamic side angle, man from step 3 examining legal documents at desk
};

// Associated Icons in public/icons
const icons = [
  'frame_inspect.svg',
  'search.svg',
  'category_search.svg',
  'fingerprint.svg',
  'sell.svg',
  'list_alt_check.svg',
  'account_balance.svg',
  'arrow_upload_ready.svg',
  'contract_edit.svg',
  'attach_money.svg',
  'check_circle-filled.svg',
];

const stepsData = [
  {
    number: '01',
    en: {
      title: 'Initial Study and Budget',
      description: 'Before starting, we analyze your needs, budget, payment method, and, if you require financing, your real mortgage capacity.',
    },
    es: {
      title: 'Estudio Inicial y Presupuesto',
      description: 'Antes de comenzar, analizamos sus necesidades, presupuesto, método de pago y, si requiere financiación, su capacidad real de hipoteca.',
    }
  },
  {
    number: '02',
    en: {
      title: 'Property Search',
      description: 'We select properties that match your needs based on area, price, features, and purchase objective: primary residence, second home, or investment.',
    },
    es: {
      title: 'Búsqueda de Propiedades',
      description: 'Seleccionamos propiedades que coincidan con sus necesidades basadas en zona, precio, características y objetivo de compra: residencia principal, segunda vivienda o inversión.',
    }
  },
  {
    number: '03',
    en: {
      title: 'Property Viewing and Analysis',
      description: 'We visit the property and review key aspects such as general condition, layout, location, available documentation, and any possible charges or issues.',
    },
    es: {
      title: 'Visita y Análisis de la Propiedad',
      description: 'Visitamos la propiedad y revisamos aspectos clave como el estado general, distribución, ubicación, documentación disponible y cualquier posible carga o problema.',
    }
  },
  {
    number: '04',
    en: {
      title: 'Legal Verification',
      description: 'We request and review the Property Registry report (“Nota Simple”) to confirm ownership, charges, mortgages, embargoes, or any legal limitations. The Nota Simple can be obtained through the Property Registry or the Spanish Registrars Association.',
    },
    es: {
      title: 'Verificación Legal',
      description: 'Solicitamos y revisamos la Nota Simple del Registro de la Propiedad para confirmar la titularidad, cargas, hipotecas, embargos o cualquier limitación legal. La Nota Simple se puede obtener a través del Registro de la Propiedad o de la Asociación de Registradores de España.',
    }
  },
  {
    number: '05',
    en: {
      title: 'Purchase Offer',
      description: 'If the property fits your needs, we present a formal offer to the owner including the proposed price, conditions, response deadline, and financing conditions if applicable.',
    },
    es: {
      title: 'Oferta de Compra',
      description: 'Si la propiedad se adapta a sus necesidades, presentamos una oferta formal al propietario incluyendo el precio propuesto, condiciones, plazo de respuesta y condiciones de financiación si aplica.',
    }
  },
  {
    number: '06',
    en: {
      title: 'Reservation or Deposit Contract',
      description: 'Once the offer is accepted, a reservation agreement or deposit contract (“Contrato de Arras”) is signed, establishing the purchase price, deadlines, amounts paid, and conditions of the transaction.',
    },
    es: {
      title: 'Contrato de Reserva o Arras',
      description: 'Una vez aceptada la oferta, se firma un acuerdo de reserva o contrato de arras, estableciendo el precio de compra, plazos, cantidades entregadas y condiciones de la transacción.',
    }
  },
  {
    number: '07',
    en: {
      title: 'Mortgage and Valuation',
      description: 'If financing is required, the bank studies the operation, requests the valuation report, and once approved, issues the FEIN document. In Spain, there is a mandatory minimum period of 10 calendar days before signing the mortgage deed before a notary.',
    },
    es: {
      title: 'Hipoteca y Tasación',
      description: 'Si se requiere financiación, el banco estudia la operación, solicita el informe de tasación y, una vez aprobado, emite el documento FEIN. En España, existe un período mínimo obligatorio de 10 días naturales antes de firmar la escritura de hipoteca ante notario.',
    }
  },
  {
    number: '08',
    en: {
      title: 'Preparation for Completion',
      description: 'We coordinate with the notary, bank, legal representatives, and all parties involved to prepare the required documentation: ID/NIE, certificates, payment methods, mortgage cancellation if necessary, and allocation of expenses.',
    },
    es: {
      title: 'Preparación para la Firma',
      description: 'Coordinamos con la notaría, el banco, the representantes legales y todas las partes involucradas para preparar la documentación requerida: DNI/NIE, certificados, métodos de pago, cancelación de hipoteca si es necesario y distribución de gastos.',
    }
  },
  {
    number: '09',
    en: {
      title: 'Signing at the Notary',
      description: 'The buyer and seller sign the public deed of sale before the notary. At that moment, the agreed payment is completed and the property officially transfers to the buyer.',
    },
    es: {
      title: 'Firma ante Notario',
      description: 'El comprador y el vendedor firman la escritura pública de compraventa ante notario. En ese momento, se completa el pago acordado dan properti berpindah secara resmi kepada pembeli.',
    }
  },
  {
    number: '10',
    en: {
      title: 'Taxes and Registration',
      description: 'After signing, the corresponding taxes are paid. In the Canary Islands, the general Property Transfer Tax (ITP) for resale properties is currently 6.5%, although reduced tax rates may apply depending on the case.',
    },
    es: {
      title: 'Impuestos y Registro',
      description: 'Después de la firma, se pagan los impuestos correspondientes. En las Islas Canarias, el Impuesto de Transmisiones Patrimoniales (ITP) general para propiedades de segunda mano es actualmente del 6,5%, aunque pueden aplicar tipos reducidos según el caso.',
    }
  },
  {
    number: '11',
    en: {
      title: 'Registration and Final Handover',
      description: 'The deed is submitted to the Property Registry and, once registered, the buyer becomes the official registered owner. Utility transfers, community registration, and local property tax (IBI) changes are also managed.',
    },
    es: {
      title: 'Registro y Entrega Final',
      description: 'La escritura se presenta al Registro de la Propiedad y, una vez registrada, el comprador se convierte en el propietario oficial registrado. También se gestionan los cambios de suministros, registro en la comunidad y cambios del IBI.',
    }
  }
];

function blockifyText(text) {
  return [
    {
      _key: `b_${Math.random().toString(36).slice(2, 9)}`,
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _key: `s_${Math.random().toString(36).slice(2, 9)}`,
          _type: 'span',
          text: text,
          marks: []
        }
      ]
    }
  ];
}

async function seed() {
  console.log('🚀 SEEDING MORTGAGE PROCESS SECTION (IMAGE FOR STEP 1 AND STEP 2 MATCHED PERFECTLY)...');

  // 1. Upload Chosen Images dynamically
  const imageRefs = {};
  for (const [stepKey, imagePath] of Object.entries(chosenImages)) {
    console.log(`Uploading ${stepKey} matching high-res image from ${imagePath}...`);
    const imgStream = fs.createReadStream(imagePath);
    const asset = await client.assets.upload('image', imgStream, {
      filename: `luxury_${stepKey}_chosen.png`
    });
    console.log(`Uploaded ${stepKey} image:`, asset._id);
    imageRefs[stepKey] = {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id }
    };
  }

  // 3. Upload SVG Icons
  console.log('Uploading SVG Icons...');
  const iconRefs = [];
  for (let i = 0; i < icons.length; i++) {
    const iconName = icons[i];
    const iconPath = path.resolve(__dirname, `../public/icons/${iconName}`);
    const stream = fs.createReadStream(iconPath);
    const asset = await client.assets.upload('image', stream, {
      filename: iconName,
      contentType: 'image/svg+xml'
    });
    console.log(`Uploaded icon ${iconName}:`, asset._id);
    iconRefs.push({
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id }
    });
  }

  // 4. Build steps array for English and Spanish
  const enSteps = stepsData.map((step, index) => {
    const stepKey = `step${index + 1}`;
    const payload = {
      _key: `step_${index + 1}`,
      number: step.number,
      title: step.en.title,
      description: blockifyText(step.en.description),
      icon: iconRefs[index]
    };
    if (imageRefs[stepKey]) {
      payload.image = imageRefs[stepKey];
    }
    return payload;
  });

  const esSteps = stepsData.map((step, index) => {
    const stepKey = `step${index + 1}`;
    const payload = {
      _key: `step_${index + 1}`,
      number: step.number,
      title: step.es.title,
      description: blockifyText(step.es.description),
      icon: iconRefs[index]
    };
    if (imageRefs[stepKey]) {
      payload.image = imageRefs[stepKey];
    }
    return payload;
  });

  // Create sections
  const enSection = {
    _type: 'mortgageProcessSection',
    _key: `mps_buy_en_${Date.now()}`,
    tagline: 'STEP-BY-STEP PROCESS',
    headline: 'Our Step-by-Step Purchase & Mortgage Process',
    intro: blockifyText('We accompany you through every phase of the acquisition. From the initial study of your financial profile to the final registration of your property, ensuring complete legal and financial transparency.'),
    steps: enSteps
  };

  const esSection = {
    _type: 'mortgageProcessSection',
    _key: `mps_buy_es_${Date.now()}`,
    tagline: 'PROCESO PASO A PASO',
    headline: 'Nuestro Proceso de Compra e Hipoteca Paso a Paso',
    intro: blockifyText('Le acompañamos en cada fase de la adquisición. Desde el estudio inicial de su perfil financiero hasta el registro final de su propiedad, garantizando total transparencia legal y financiera.'),
    steps: esSteps
  };

  // English Buy Page patch (insert right before contactSection)
  console.log('Fetching English buy page...');
  const enPage = await client.getDocument('79c83f1a-580b-46b4-bc88-1cc65cbc5797');
  if (enPage) {
    let sections = (enPage.sections || []).filter(s => s._type !== 'mortgageProcessSection');
    const contactIdx = sections.findIndex(s => s._type === 'contactSection');
    if (contactIdx !== -1) {
      sections.splice(contactIdx, 0, enSection);
    } else {
      sections.push(enSection);
    }
    await client.patch(enPage._id)
      .set({ sections })
      .commit();
    console.log('✅ Successfully seeded English Mortgage Process Section.');
  }

  // Spanish Comprar Page patch (insert right before contactSection)
  console.log('Fetching Spanish comprar page...');
  const esPage = await client.getDocument('b8035107-9a47-45e3-b4ff-7688147cfc0b');
  if (esPage) {
    let sections = (esPage.sections || []).filter(s => s._type !== 'mortgageProcessSection');
    const contactIdx = sections.findIndex(s => s._type === 'contactSection');
    if (contactIdx !== -1) {
      sections.splice(contactIdx, 0, esSection);
    } else {
      sections.push(esSection);
    }
    await client.patch(esPage._id)
      .set({ sections })
      .commit();
    console.log('✅ Successfully seeded Spanish Mortgage Process Section.');
  }

  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
}

seed().catch(console.error);
