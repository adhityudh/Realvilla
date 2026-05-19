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

const spanishTranslations = {
  tagline: 'GUÍA COMPLETA',
  headline: 'COMPRA DE PROPIEDADES EN TENERIFE',
  intro: 'Un viaje claro y transparente para asegurar su paraíso. Nuestro desglose paso a paso garantiza tranquilidad durante el proceso de adquisición.',
  steps: {
    '01': {
      title: 'Estudio Inicial y Presupuesto',
      description: 'Antes de comenzar, analizamos sus necesidades, presupuesto, método de pago y, si requiere financiación, su capacidad real de hipoteca.'
    },
    '02': {
      title: 'Búsqueda de Propiedades',
      description: 'Seleccionamos propiedades que coincidan con sus necesidades basadas en zona, precio, características y objetivo de compra: residencia principal, segunda vivienda o inversión.'
    },
    '03': {
      title: 'Visita y Análisis de la Propiedad',
      description: 'Visitamos la propiedad y revisamos aspectos clave como el estado general, distribución, ubicación, documentación disponible y cualquier posible carga o problema.'
    },
    '04': {
      title: 'Verificación Legal',
      description: 'Solicitamos y revisamos la Nota Simple del Registro de la Propiedad para confirmar la titularidad, cargas, hipotecas, embargos o cualquier limitación legal. La Nota Simple se puede obtener a través del Registro de la Propiedad o de la Asociación de Registradores de España.'
    },
    '05': {
      title: 'Oferta de Compra',
      description: 'Si la propiedad se adapta a sus necesidades, presentamos una oferta formal al propietario incluyendo el precio propuesto, condiciones, plazo de respuesta y condiciones de financiación si aplica.'
    },
    '06': {
      title: 'Contrato de Reserva o Arras',
      description: 'Una vez aceptada la oferta, se firma un acuerdo de reserva o contrato de arras, estableciendo el precio de compra, plazos, cantidades entregadas y condiciones de la transacción.'
    },
    '07': {
      title: 'Hipoteca y Tasación',
      description: 'Si se requiere financiación, el banco estudia la operación, solicita el informe de tasación y, una vez aprobado, emite el documento FEIN. En España, existe un período mínimo obligatorio de 10 días naturales antes de firmar la escritura de hipoteca ante notario.'
    },
    '08': {
      title: 'Preparación para la Firma',
      description: 'Coordinamos con la notaría, el banco, los representantes legales y todas las partes involucradas para preparar la documentación requerida: DNI/NIE, certificados, métodos de pago, cancelación de hipoteca si es necesario y distribución de gastos.'
    },
    '09': {
      title: 'Firma ante Notario',
      description: 'El comprador y el vendedor firman la escritura pública de compraventa ante notario. En ese momento, se completa el pago acordado y la propiedad se transfiere oficialmente al comprador.'
    },
    '10': {
      title: 'Impuestos y Registro',
      description: 'Después de la firma, se pagan los impuestos correspondientes. En las Islas Canarias, el Impuesto de Transmisiones Patrimoniales (ITP) general para propiedades de segunda mano es actualmente del 6,5%, aunque pueden aplicar tipos reducidos según el caso.'
    },
    '11': {
      title: 'Registro y Entrega Final',
      description: 'La escritura se presenta al Registro de la Propiedad y, una vez registrada, el comprador se convierte en el propietario oficial registrado. También se gestionan los cambios de suministros, el registro en la comunidad y los cambios del IBI.'
    }
  }
};

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

async function sync() {
  console.log('🔄 STARTING SYNC FROM ENGLISH TO SPANISH PAGE...');

  // 1. Fetch the latest English page
  console.log('Fetching English buy page...');
  const enPage = await client.getDocument('79c83f1a-580b-46b4-bc88-1cc65cbc5797');
  if (!enPage) {
    console.error('❌ English page not found.');
    return;
  }

  const enSection = (enPage.sections || []).find(s => s._type === 'mortgageProcessSection');
  if (!enSection) {
    console.error('❌ mortgageProcessSection not found on English buy page.');
    return;
  }

  console.log('✅ Successfully loaded English mortgageProcessSection.');

  // 2. Build Spanish section based exactly on English structure & media keys
  const esSteps = enSection.steps.map((step) => {
    const translation = spanishTranslations.steps[step.number];
    if (!translation) {
      console.warn(`⚠️ Warning: No translation found for step number ${step.number}. Using English title.`);
    }

    return {
      _key: step._key,
      number: step.number,
      title: translation ? translation.title : step.title,
      description: blockifyText(translation ? translation.description : step.description[0].children[0].text),
      icon: step.icon,
      image: step.image
    };
  });

  const esSection = {
    _type: 'mortgageProcessSection',
    _key: `mps_buy_es_${Date.now()}`,
    tagline: spanishTranslations.tagline,
    headline: spanishTranslations.headline,
    intro: blockifyText(spanishTranslations.intro),
    timelineMode: enSection.timelineMode,
    steps: esSteps
  };

  // 3. Patch Spanish page b8035107-9a47-45e3-b4ff-7688147cfc0b
  console.log('Fetching Spanish comprar page...');
  const esPage = await client.getDocument('b8035107-9a47-45e3-b4ff-7688147cfc0b');
  if (!esPage) {
    console.error('❌ Spanish page not found.');
    return;
  }

  let sections = (esPage.sections || []).filter(s => s._type !== 'mortgageProcessSection');
  const contactIdx = sections.findIndex(s => s._type === 'contactSection');
  if (contactIdx !== -1) {
    sections.splice(contactIdx, 0, esSection);
  } else {
    sections.push(esSection);
  }

  console.log('Patching Spanish comprar page in Sanity...');
  await client.patch(esPage._id)
    .set({ sections })
    .commit();

  console.log('✅ SUCCESSFULLY SYNCED SPANISH COMPRAR PAGE FROM CUSTOM ENGLISH PAGE!');
}

sync().catch(console.error);
