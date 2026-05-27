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

// ES page IDs (from query above)
const ES = {
  sell:     'page-es-sell',
  buy:      'b8035107-9a47-45e3-b4ff-7688147cfc0b',
  mortgage: 'page-es-mortgage',
  home:     'home-page',       // used for about/testimonials sections
  contact:  'SzL855SmyokgBblV3bPYvA',
};

function ref(id) {
  return { _type: 'reference', _ref: id };
}

function rk() {
  return Math.random().toString(36).substring(2, 9);
}

// Mirror of the EN columns — translated labels, ES page refs, ES external URLs
const esColumns = [
  // col 1: PROPIEDADES (dynamicSource — same as EN)
  {
    _key: '82e48e72d2656f4c',
    title: 'PROPIEDADES',
    dynamicSource: 'propertyCategories',
    subgroups: [
      {
        _key: '92fd14ab080aa2fe',
        links: [
          { _key: '9a8135b91ae334c3', label: 'Listados Residenciales', linkType: 'external', externalLink: '#' },
          { _key: '1a7ddc9cc11b8648', label: 'Propiedades de Inversión', linkType: 'external', externalLink: '#' },
          { _key: '426308d6c36b34aa', label: 'Propiedades Destacadas', linkType: 'external', externalLink: '#' },
        ],
      },
    ],
  },

  // col 2: SERVICIOS PRINCIPALES
  {
    _key: '8ec2c6ea86628b13',
    title: 'SERVICIOS PRINCIPALES',
    subgroups: [
      {
        _key: '6d7dfa3f3a07617f',
        title: 'VENDEDORES',
        links: [
          {
            _key: 'c89316d4e407b030',
            label: 'Valoración Gratuita',
            linkType: 'internal',
            internalLink: ref(ES.sell),
            internalSection: 'valuation',
            openInNewWindow: false,
          },
          {
            _key: 'e03601b8462bab8f',
            label: 'Proceso de Venta',
            linkType: 'internal',
            internalLink: ref(ES.sell),
            internalSection: 'sell-process',
            openInNewWindow: false,
          },
        ],
      },
      {
        _key: '2b9c6b0fd3367e3d',
        title: 'COMPRADORES',
        links: [
          {
            _key: '4adcf8f8d27db5c4',
            label: 'Ver Todas las Propiedades',
            linkType: 'external',
            externalLink: '/es/propiedades',
          },
          {
            _key: 'af9c75374c91116e',
            label: 'Hipotecas y Financiación',
            linkType: 'internal',
            internalLink: ref(ES.mortgage),
            openInNewWindow: false,
          },
          {
            _key: 'c62b639caec1',
            label: 'Calculadora Hipotecaria',
            linkType: 'internal',
            internalLink: ref(ES.mortgage),
            internalSection: 'mortgage-simulator',
            openInNewWindow: false,
          },
          {
            _key: '18f6fdfd398e',
            label: 'Proceso de Compra',
            linkType: 'internal',
            internalLink: ref(ES.buy),
            internalSection: 'process',
            openInNewWindow: false,
          },
        ],
      },
    ],
  },

  // col 3: MERCADO Y RECURSOS
  {
    _key: '9835ab1a91e5746b',
    title: 'MERCADO Y RECURSOS',
    subgroups: [
      {
        _key: '40b697a0ca616519',
        title: 'DATOS DE MERCADO',
        links: [
          {
            _key: '4e4814e69fb30615',
            label: 'Perspectivas Tenerife',
            linkType: 'external',
            externalLink: '/es/blog',
          },
          {
            _key: '1e2487e737d69f3e',
            label: 'Euribor Actual',
            linkType: 'internal',
            internalLink: ref(ES.mortgage),
            internalSection: 'stats',
            openInNewWindow: false,
          },
        ],
      },
      {
        _key: '88a59d93922385e2',
        title: 'RECURSOS',
        links: [
          {
            _key: '2d5441b76bbea51e',
            label: 'Noticias y Blog',
            linkType: 'external',
            externalLink: '/es/blog',
          },
        ],
      },
    ],
  },

  // col 4: SOBRE REALVILLA
  {
    _key: '3503f8cfb0572988',
    title: 'SOBRE REALVILLA',
    subgroups: [
      {
        _key: '0db352555c7eee51',
        title: 'LA AGENCIA',
        links: [
          {
            _key: '8ee524790fd119e7',
            label: 'Sobre Nosotros',
            linkType: 'internal',
            internalLink: ref(ES.home),
            internalSection: 'about',
            openInNewWindow: false,
          },
          {
            _key: '6c4e21f46e3f34a8',
            label: 'Opiniones de Clientes',
            linkType: 'internal',
            internalLink: ref(ES.home),
            internalSection: 'testimonials',
            openInNewWindow: false,
          },
        ],
      },
      {
        _key: '836d9b57a516dc44',
        title: 'SOPORTE',
        links: [
          {
            _key: '9a6a61e77f45',
            label: 'Preguntas Frecuentes',
            linkType: 'external',
            externalLink: '#',
          },
          {
            _key: 'dd3c18b165256495',
            label: 'Contáctenos',
            linkType: 'internal',
            internalLink: ref(ES.contact),
            openInNewWindow: false,
          },
        ],
      },
    ],
  },
];

async function run() {
  await client.patch('settings-es').set({ 'footer.columns': esColumns }).commit();
  console.log('Done! ES footer columns updated.');
}

run().catch(console.error);
