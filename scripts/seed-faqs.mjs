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

function rk() {
  return Math.random().toString(36).substring(2, 14);
}

// ─── FAQ CONTENT ─────────────────────────────────────────────────────────────

const groupsEN = [
  {
    _key: rk(),
    _type: 'faqGroup',
    title: 'Buying a Property',
    items: [
      { _key: rk(), _type: 'faqItem', question: 'How much money do I need to buy a property in Tenerife?', answer: 'In addition to the property price, it is generally recommended to have an additional 8% to 10% available to cover taxes, notary fees, property registration, administrative costs, and other expenses related to the purchase process. Buyers should also consider the initial contribution not financed by the bank.' },
      { _key: rk(), _type: 'faqItem', question: 'How much financing do banks offer in Spain?', answer: 'Banks typically finance up to 80% of the purchase price or valuation for primary residences, although certain buyer profiles may qualify for higher financing percentages.' },
      { _key: rk(), _type: 'faqItem', question: 'What are the costs involved in buying a property in the Canary Islands?', answer: 'The main purchase costs are: ITP (6.5%) for resale properties, IGIC + AJD for new-build properties, notary fees, Property Registry fees, administrative/processing fees, and mortgage valuation fees.' },
      { _key: rk(), _type: 'faqItem', question: 'What is a "Nota Simple"?', answer: 'A Nota Simple is an official document issued by the Spanish Property Registry showing ownership information as well as any charges, mortgages, embargoes, or legal limitations affecting the property.' },
      { _key: rk(), _type: 'faqItem', question: 'What is an easement on a property?', answer: 'An easement is a legal right that may affect the use of a property. For example, there may be a right of way allowing third parties access through part of the land, or easements related to utilities, electricity, or access to neighboring properties. It is essential to review these before purchasing, as they may limit certain uses of the property or land.' },
      { _key: rk(), _type: 'faqItem', question: 'What is the difference between a reservation agreement and a deposit contract ("Contrato de Arras")?', answer: 'A reservation agreement is usually used to temporarily hold a property while the necessary documentation is prepared. A deposit contract ("Contrato de Arras") establishes a legally binding commitment between buyer and seller.' },
      { _key: rk(), _type: 'faqItem', question: 'What documents are required to apply for a mortgage?', answer: 'The following documents are usually required: ID/NIE, payslips, tax return, employment history report ("Vida Laboral"), employment contract, and bank statements.' },
      { _key: rk(), _type: 'faqItem', question: 'What is the FEIN?', answer: 'The FEIN is the official binding mortgage offer issued by the bank before signing the mortgage deed.' },
      { _key: rk(), _type: 'faqItem', question: 'What does it mean if a property has charges?', answer: 'It means the property may have a mortgage, embargo, community debt, or another pending legal obligation attached to it. Before completing the purchase, it is essential to verify that these charges can be properly cancelled.' },
      { _key: rk(), _type: 'faqItem', question: 'How long does the buying process take?', answer: 'The timeline depends on each transaction, but generally ranges between 30 and 90 days when mortgage financing is involved.' },
      { _key: rk(), _type: 'faqItem', question: 'What should I check before buying a property?', answer: 'It is recommended to review the following: Property Registry status, urban planning situation, community debts, outstanding property tax (IBI), utility status, possible easements or legal limitations, and energy efficiency certificate.' },
      { _key: rk(), _type: 'faqItem', question: 'Can foreigners buy property in Spain?', answer: 'Yes. Foreign buyers can purchase property in Spain without any issue. They simply need to obtain an NIE number and comply with the relevant legal and banking requirements.' },
      { _key: rk(), _type: 'faqItem', question: 'Can I buy a property as an investment?', answer: 'Yes. Tenerife has strong residential and holiday rental demand, making it a highly attractive location for real estate investment.' },
    ],
  },
  {
    _key: rk(),
    _type: 'faqGroup',
    title: 'Selling a Property',
    items: [
      { _key: rk(), _type: 'faqItem', question: 'How much is my property worth?', answer: "A property's value depends on factors such as location, condition, demand, size, views, documentation, and the current market situation." },
      { _key: rk(), _type: 'faqItem', question: 'Is the valuation free?', answer: 'Yes. At REALVILLA we offer a free, no-obligation property valuation service.' },
      { _key: rk(), _type: 'faqItem', question: 'How long does it take to sell a property?', answer: 'The selling time depends on the price, area, and marketing strategy used. A correct valuation usually helps speed up the process considerably.' },
      { _key: rk(), _type: 'faqItem', question: 'What documents do I need to sell a property?', answer: 'The following documents are usually required: ID, title deed, Nota Simple, IBI receipt, energy certificate, and latest utility and community receipts.' },
      { _key: rk(), _type: 'faqItem', question: 'Can I sell a property with an existing mortgage?', answer: 'Yes. The mortgage can be cancelled during the sale process.' },
      { _key: rk(), _type: 'faqItem', question: 'What happens if the property has a pending inheritance?', answer: 'In most cases, the inheritance must first be accepted and registered before the property can be sold. Depending on the situation, both processes can sometimes be managed simultaneously.' },
      { _key: rk(), _type: 'faqItem', question: 'Do you advertise properties on Idealista and other portals?', answer: 'Yes. We publish properties on both national and international portals to maximize visibility. On our website you can see all the portals we collaborate with.' },
      { _key: rk(), _type: 'faqItem', question: 'Do you work with buyers already pre-approved by banks?', answer: 'Yes. We pre-screen buyer profiles and work with buyers who have already undergone financial analysis in order to avoid unnecessary viewings.' },
    ],
  },
  {
    _key: rk(),
    _type: 'faqGroup',
    title: 'Mortgages & Financing',
    items: [
      { _key: rk(), _type: 'faqItem', question: 'What is the difference between a fixed and variable mortgage?', answer: 'A fixed mortgage maintains the same monthly payment throughout the life of the loan, while a variable mortgage fluctuates depending on the Euribor rate.' },
      { _key: rk(), _type: 'faqItem', question: 'What is the Euribor?', answer: 'The Euribor is the benchmark interest rate used by most variable mortgages in Spain.' },
      { _key: rk(), _type: 'faqItem', question: 'Can I obtain 90% financing?', answer: "In certain cases, yes. It depends on the buyer's financial profile, age, type of property, and the bank's conditions." },
      { _key: rk(), _type: 'faqItem', question: 'Does my employment contract affect mortgage approval?', answer: 'Yes. Banks place significant importance on job stability and differentiate between permanent, seasonal permanent, and temporary contracts.' },
      { _key: rk(), _type: 'faqItem', question: 'What percentage of my income should go toward the mortgage?', answer: 'Financial institutions generally recommend that the mortgage payment should not exceed 30% to 35% of monthly net income.' },
      { _key: rk(), _type: 'faqItem', question: 'Can I calculate my mortgage on the website?', answer: 'Yes. We provide a mortgage calculator designed to help you estimate monthly payments, expenses, and approximate financing conditions.' },
    ],
  },
  {
    _key: rk(),
    _type: 'faqGroup',
    title: 'REALVILLA',
    items: [
      { _key: rk(), _type: 'faqItem', question: 'Why work with REALVILLA?', answer: 'Because we combine real estate advisory, financial analysis, and strategic marketing to provide a complete, professional, and personalized service.' },
      { _key: rk(), _type: 'faqItem', question: 'Do you only operate in Tenerife?', answer: 'Mainly yes, although we also work with national and international clients interested in buying or investing in the Canary Islands.' },
      { _key: rk(), _type: 'faqItem', question: 'What are the advantages of buying with professional real estate advice?', answer: 'Professional guidance helps identify legal risks, review documentation, negotiate more effectively, and avoid common mistakes during the purchase process.' },
      { _key: rk(), _type: 'faqItem', question: 'Do the properties include video and virtual tours?', answer: 'Yes. Many of our properties include professional photography, video, and 360° virtual tours.' },
      { _key: rk(), _type: 'faqItem', question: 'Can I submit an offer online?', answer: 'Yes. Some properties allow offers to be submitted directly through the website using the "Make an Offer" system.' },
    ],
  },
];

const groupsES = [
  {
    _key: rk(),
    _type: 'faqGroup',
    title: 'Comprar una propiedad',
    items: [
      { _key: rk(), _type: 'faqItem', question: '¿Cuánto dinero necesito para comprar una propiedad en Tenerife?', answer: 'Además del precio de la propiedad, se recomienda disponer de un 8% a un 10% adicional para cubrir impuestos, gastos de notaría, registro de la propiedad, costes administrativos y otros gastos relacionados con el proceso de compra. Los compradores también deben considerar el capital inicial no financiado por el banco.' },
      { _key: rk(), _type: 'faqItem', question: '¿Cuánta financiación ofrecen los bancos en España?', answer: 'Los bancos financian habitualmente hasta el 80% del precio de compra o de tasación para vivienda habitual, aunque determinados perfiles de comprador pueden acceder a porcentajes de financiación superiores.' },
      { _key: rk(), _type: 'faqItem', question: '¿Cuáles son los gastos de compra de una propiedad en Canarias?', answer: 'Los principales gastos de compra son: ITP (6,5%) para propiedades de segunda mano, IGIC + AJD para obra nueva, honorarios de notaría, gastos del Registro de la Propiedad, honorarios de gestoría y tasación hipotecaria.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué es la Nota Simple?', answer: 'La Nota Simple es un documento oficial emitido por el Registro de la Propiedad que muestra la información de titularidad, así como las cargas, hipotecas, embargos o limitaciones legales que afectan a la propiedad.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué es una servidumbre sobre una propiedad?', answer: 'Una servidumbre es un derecho real que puede afectar al uso de una propiedad. Por ejemplo, puede existir un derecho de paso que permita a terceros acceder a través de parte del terreno, o servidumbres relacionadas con suministros, electricidad o acceso a propiedades colindantes. Es fundamental revisarlas antes de comprar, ya que pueden limitar determinados usos de la propiedad o el terreno.' },
      { _key: rk(), _type: 'faqItem', question: '¿Cuál es la diferencia entre un contrato de reserva y un contrato de arras?', answer: 'El contrato de reserva se utiliza habitualmente para reservar temporalmente una propiedad mientras se prepara la documentación necesaria. El contrato de arras establece un compromiso legalmente vinculante entre comprador y vendedor.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué documentos se necesitan para solicitar una hipoteca?', answer: 'Habitualmente se requieren los siguientes documentos: DNI/NIE, nóminas, declaración de la renta, vida laboral, contrato de trabajo y extractos bancarios.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué es el FEIN?', answer: 'El FEIN es la oferta hipotecaria vinculante oficial emitida por el banco antes de la firma de la escritura de hipoteca.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué significa que una propiedad tenga cargas?', answer: 'Significa que la propiedad puede tener una hipoteca, embargo, deuda comunitaria u otra obligación legal pendiente. Antes de formalizar la compra, es fundamental verificar que dichas cargas puedan ser correctamente canceladas.' },
      { _key: rk(), _type: 'faqItem', question: '¿Cuánto tiempo dura el proceso de compra?', answer: 'El plazo depende de cada operación, pero generalmente oscila entre 30 y 90 días cuando existe financiación hipotecaria.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué debo comprobar antes de comprar una propiedad?', answer: 'Se recomienda revisar lo siguiente: situación registral, situación urbanística, deudas comunitarias, recibo del IBI pendiente, estado de suministros, posibles servidumbres o limitaciones legales, y certificado de eficiencia energética.' },
      { _key: rk(), _type: 'faqItem', question: '¿Pueden los extranjeros comprar una propiedad en España?', answer: 'Sí. Los compradores extranjeros pueden adquirir una propiedad en España sin ningún problema. Únicamente necesitan obtener el número NIE y cumplir con los requisitos legales y bancarios correspondientes.' },
      { _key: rk(), _type: 'faqItem', question: '¿Puedo comprar una propiedad como inversión?', answer: 'Sí. Tenerife cuenta con una sólida demanda residencial y vacacional, lo que la convierte en un destino altamente atractivo para la inversión inmobiliaria.' },
    ],
  },
  {
    _key: rk(),
    _type: 'faqGroup',
    title: 'Vender una propiedad',
    items: [
      { _key: rk(), _type: 'faqItem', question: '¿Cuánto vale mi propiedad?', answer: 'El valor de una propiedad depende de factores como la ubicación, el estado, la demanda, la superficie, las vistas, la documentación y la situación actual del mercado.' },
      { _key: rk(), _type: 'faqItem', question: '¿La valoración es gratuita?', answer: 'Sí. En REALVILLA ofrecemos un servicio de valoración gratuita y sin compromiso.' },
      { _key: rk(), _type: 'faqItem', question: '¿Cuánto tiempo se tarda en vender una propiedad?', answer: 'El tiempo de venta depende del precio, la zona y la estrategia de marketing utilizada. Una valoración correcta suele acelerar considerablemente el proceso.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué documentos necesito para vender una propiedad?', answer: 'Habitualmente se requieren los siguientes documentos: DNI, escritura de propiedad, Nota Simple, recibo del IBI, certificado de eficiencia energética, y últimos recibos de suministros y comunidad.' },
      { _key: rk(), _type: 'faqItem', question: '¿Puedo vender una propiedad con hipoteca pendiente?', answer: 'Sí. La hipoteca puede cancelarse durante el proceso de venta.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué ocurre si la propiedad tiene una herencia pendiente?', answer: 'En la mayoría de los casos, la herencia debe aceptarse e inscribirse antes de poder vender la propiedad. Según la situación, ambos procesos pueden gestionarse de forma simultánea.' },
      { _key: rk(), _type: 'faqItem', question: '¿Anuncian las propiedades en Idealista y otros portales?', answer: 'Sí. Publicamos las propiedades en portales nacionales e internacionales para maximizar la visibilidad. En nuestra web puede consultar todos los portales con los que colaboramos.' },
      { _key: rk(), _type: 'faqItem', question: '¿Trabajan con compradores ya preaprobados por bancos?', answer: 'Sí. Realizamos un análisis previo del perfil de los compradores y trabajamos con aquellos que ya han pasado por un análisis financiero, con el fin de evitar visitas innecesarias.' },
    ],
  },
  {
    _key: rk(),
    _type: 'faqGroup',
    title: 'Hipotecas y financiación',
    items: [
      { _key: rk(), _type: 'faqItem', question: '¿Cuál es la diferencia entre una hipoteca fija y variable?', answer: 'Una hipoteca fija mantiene la misma cuota mensual durante toda la vida del préstamo, mientras que una hipoteca variable fluctúa en función del Euribor.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué es el Euribor?', answer: 'El Euribor es el índice de referencia utilizado por la mayoría de las hipotecas variables en España.' },
      { _key: rk(), _type: 'faqItem', question: '¿Puedo obtener una financiación del 90%?', answer: 'En determinados casos, sí. Depende del perfil financiero del comprador, la edad, el tipo de propiedad y las condiciones del banco.' },
      { _key: rk(), _type: 'faqItem', question: '¿Afecta mi contrato laboral a la aprobación de la hipoteca?', answer: 'Sí. Los bancos otorgan gran importancia a la estabilidad laboral y diferencian entre contratos indefinidos, fijos discontinuos y temporales.' },
      { _key: rk(), _type: 'faqItem', question: '¿Qué porcentaje de mis ingresos debería destinar a la hipoteca?', answer: 'Las entidades financieras recomiendan que la cuota hipotecaria no supere el 30% o 35% de los ingresos netos mensuales.' },
      { _key: rk(), _type: 'faqItem', question: '¿Puedo calcular mi hipoteca en la web?', answer: 'Sí. Disponemos de una calculadora hipotecaria diseñada para ayudarle a estimar las cuotas mensuales, los gastos y las condiciones de financiación aproximadas.' },
    ],
  },
  {
    _key: rk(),
    _type: 'faqGroup',
    title: 'REALVILLA',
    items: [
      { _key: rk(), _type: 'faqItem', question: '¿Por qué trabajar con REALVILLA?', answer: 'Porque combinamos asesoramiento inmobiliario, análisis financiero y marketing estratégico para ofrecer un servicio completo, profesional y personalizado.' },
      { _key: rk(), _type: 'faqItem', question: '¿Solo operan en Tenerife?', answer: 'Principalmente sí, aunque también trabajamos con clientes nacionales e internacionales interesados en comprar o invertir en Canarias.' },
      { _key: rk(), _type: 'faqItem', question: '¿Cuáles son las ventajas de comprar con asesoramiento inmobiliario profesional?', answer: 'El asesoramiento profesional permite identificar riesgos legales, revisar la documentación, negociar con mayor eficacia y evitar errores habituales durante el proceso de compra.' },
      { _key: rk(), _type: 'faqItem', question: '¿Las propiedades incluyen vídeo y visitas virtuales?', answer: 'Sí. Muchas de nuestras propiedades incluyen fotografía profesional, vídeo y visitas virtuales en 360°.' },
      { _key: rk(), _type: 'faqItem', question: '¿Puedo enviar una oferta online?', answer: 'Sí. Algunas propiedades permiten enviar ofertas directamente a través de la web mediante el sistema "Hacer una Oferta".' },
    ],
  },
];

const faqsSectionEN = {
  _key: rk(),
  _type: 'faqsSection',
  anchor: 'faqs',
  tocLabel: 'Table of Contents',
  disableEntranceAnimation: false,
  groups: groupsEN,
};

const faqsSectionES = {
  _key: rk(),
  _type: 'faqsSection',
  anchor: 'faqs',
  tocLabel: 'Contenido',
  disableEntranceAnimation: false,
  groups: groupsES,
};

const PAGE_EN_ID = 'page-en-faqs';
const PAGE_ES_ID = 'aa6ebd89-9c59-4c44-bb37-e02fbb82b998';

async function run() {
  // 1. Create / upsert EN FAQ page
  await client.createOrReplace({
    _id: PAGE_EN_ID,
    _type: 'page',
    language: 'en',
    title: 'Frequently Asked Questions',
    slug: { _type: 'slug', current: 'faqs' },
    sections: [faqsSectionEN],
  });
  console.log('EN FAQ page upserted:', PAGE_EN_ID);

  // 2. Upsert sections on ES FAQ page (preserve existing structure)
  const esPage = await client.fetch('*[_id == $id][0]', { id: PAGE_ES_ID });
  const existingSections = esPage?.sections || [];

  // Remove any existing faqsSection and replace with fresh content
  const filteredSections = existingSections.filter((s) => s._type !== 'faqsSection');
  await client.patch(PAGE_ES_ID).set({ sections: [...filteredSections, faqsSectionES] }).commit();
  console.log('ES FAQ page sections updated:', PAGE_ES_ID);

  // 3. Create translation metadata linking EN ↔ ES
  await client.createOrReplace({
    _id: 'translation-page-faqs',
    _type: 'translation.metadata',
    translations: [
      {
        _key: rk(),
        _type: 'internationalizedArrayReferenceValue',
        language: 'en',
        value: { _type: 'reference', _ref: PAGE_EN_ID, _weak: true, _strengthenOnPublish: { type: 'page' } },
      },
      {
        _key: rk(),
        _type: 'internationalizedArrayReferenceValue',
        language: 'es',
        value: { _type: 'reference', _ref: PAGE_ES_ID, _weak: true, _strengthenOnPublish: { type: 'page' } },
      },
    ],
  });
  console.log('Translation metadata created: translation-page-faqs');

  console.log('\nDone! FAQ pages ready.');
  console.log(`EN: /en/faqs`);
  console.log(`ES: /es/preguntas-frecuentes`);
}

run().catch(console.error);
