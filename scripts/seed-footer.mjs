import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Helper to generate a unique key
const generateKey = () => randomBytes(8).toString('hex');

// Recursively add _key to all objects in arrays
function addKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        return { _key: generateKey(), ...addKeys(item) };
      }
      return item;
    });
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = addKeys(value);
    }
    return newObj;
  }
  return obj;
}

const sharedSocialLinks = [
  {
    label: 'Email',
    icon: {
      _type: 'image',
      asset: {
        _ref: 'image-d17006ea885708488e3f17df4c55989aec9bb128-24x24-svg',
        _type: 'reference'
      }
    },
    linkType: 'external',
    externalLink: 'mailto:contact@realvilla.es'
  },
  {
    label: 'Instagram',
    icon: {
      _type: 'image',
      asset: {
        _ref: 'image-1911dd2d74c4ccee67ccad9ac715764ba35b3235-14x14-svg',
        _type: 'reference'
      }
    },
    linkType: 'external',
    externalLink: 'https://instagram.com/realvilla'
  },
  {
    label: 'LinkedIn',
    icon: {
      _type: 'image',
      asset: {
        _ref: 'image-a33f4823dd39f8a32231ae3ea18e239f344b81bb-14x14-svg',
        _type: 'reference'
      }
    },
    linkType: 'external',
    externalLink: 'https://linkedin.com/company/realvilla'
  }
];

const footerEnRaw = {
  columns: [
    {
      title: 'PROPERTIES',
      subgroups: [{
        links: [
          { label: 'Residential Listings', linkType: 'external', externalLink: '#' },
          { label: 'Investment Properties', linkType: 'external', externalLink: '#' },
          { label: 'Featured Properties', linkType: 'external', externalLink: '#' }
        ]
      }]
    },
    {
      title: 'MAIN SERVICES',
      subgroups: [
        {
          title: 'SELLERS',
          links: [
            { label: 'Free Property Valuation', linkType: 'external', externalLink: '#' },
            { label: 'Selling Process', linkType: 'external', externalLink: '#' }
          ]
        },
        {
          title: 'BUYERS',
          links: [
            { label: 'Mortgages & Financing', linkType: 'external', externalLink: '#' },
            { label: 'View all properties', linkType: 'external', externalLink: '#' }
          ]
        },
        {
          title: 'INVESTORS',
          links: [
            { label: 'Investment Properties', linkType: 'external', externalLink: '#' }
          ]
        }
      ]
    },
    {
      title: 'MARKET & RESOURCES',
      subgroups: [
        {
          title: 'MARKET DATA',
          links: [
            { label: 'Tenerife Insights', linkType: 'external', externalLink: '#' },
            { label: 'Current Euribor Rate', linkType: 'external', externalLink: '#' }
          ]
        },
        {
          title: 'RESOURCES',
          links: [
            { label: 'News & Blog', linkType: 'external', externalLink: '#' }
          ]
        }
      ]
    },
    {
      title: 'ABOUT REALVILLA',
      subgroups: [
        {
          title: 'THE AGENCY',
          links: [
            { label: 'About Us', linkType: 'external', externalLink: '#' },
            { label: 'Client Reviews', linkType: 'external', externalLink: '#' }
          ]
        },
        {
          title: 'SUPPORT',
          links: [
            { label: 'Contact Us', linkType: 'external', externalLink: '#' }
          ]
        }
      ]
    }
  ],
  legalLinks: [
    { label: 'Legal Notice', linkType: 'external', externalLink: '#' },
    { label: 'Privacy Policy', linkType: 'external', externalLink: '#' },
    { label: 'Cookie Policy', linkType: 'external', externalLink: '#' }
  ],
  copyright: '© REALVILLA 2026. ALL RIGHTS RESERVED',
  disclaimer: 'REALVILLA, a registered trademark in Europe, is the exclusive property of REALVILLA INVERSIONES SLU. Con el número de presentación 018875215, esta marca individual de tipo figurativa se fundamenta en MUE e pertenece a la Clase(s) de Niza 36 con classification de Viena 27.05.01. El uso no autorizado del nama o la imagen de RealVilla puede constituir un delito contra la propiedad intelektual, conforme a la legislación vigente. REALVILLA INVERSIONES SLU con CIF B76305887 es una empresa autorizada para la intermediación y manajemen inmobiliaria con registros en el RAIC dan RAIN. RealVilla, además cuenta con seguros de responsabilidad civil dan de caución.',
  socialLinks: sharedSocialLinks
};

const footerEsRaw = {
  columns: [
    {
      title: 'PROPIEDADES',
      subgroups: [{
        links: [
          { label: 'Listados Residenciales', linkType: 'external', externalLink: '#' },
          { label: 'Propiedades de Inversión', linkType: 'external', externalLink: '#' },
          { label: 'Propiedades Destacadas', linkType: 'external', externalLink: '#' }
        ]
      }]
    },
    {
      title: 'SERVICIOS PRINCIPALES',
      subgroups: [
        {
          title: 'VENDEDORES',
          links: [
            { label: 'Valoración Gratuita de Inmuebles', linkType: 'external', externalLink: '#' },
            { label: 'Proceso de Venta', linkType: 'external', externalLink: '#' }
          ]
        },
        {
          title: 'COMPRADORES',
          links: [
            { label: 'Hipotecas y Financiación', linkType: 'external', externalLink: '#' },
            { label: 'Ver todas las propiedades', linkType: 'external', externalLink: '#' }
          ]
        },
        {
          title: 'INVERSORES',
          links: [
            { label: 'Propiedades de Inversión', linkType: 'external', externalLink: '#' }
          ]
        }
      ]
    },
    {
      title: 'MERCADO Y RECURSOS',
      subgroups: [
        {
          title: 'DATOS DE MERCADO',
          links: [
            { label: 'Perspectivas de Tenerife', linkType: 'external', externalLink: '#' },
            { label: 'Tasa Euribor Actual', linkType: 'external', externalLink: '#' }
          ]
        },
        {
          title: 'RECURSOS',
          links: [
            { label: 'Noticias y Blog', linkType: 'external', externalLink: '#' }
          ]
        }
      ]
    },
    {
      title: 'SOBRE REALVILLA',
      subgroups: [
        {
          title: 'LA AGENCIA',
          links: [
            { label: 'Sobre Nosotros', linkType: 'external', externalLink: '#' },
            { label: 'Reseñas de Clientes', linkType: 'external', externalLink: '#' }
          ]
        },
        {
          title: 'SOPORTE',
          links: [
            { label: 'Contáctanos', linkType: 'external', externalLink: '#' }
          ]
        }
      ]
    }
  ],
  legalLinks: [
    { label: 'Aviso legal', linkType: 'external', externalLink: '#' },
    { label: 'Política de privacidad', linkType: 'external', externalLink: '#' },
    { label: 'Política de cookies', linkType: 'external', externalLink: '#' }
  ],
  copyright: '© REALVILLA 2026. TODOS LOS DERECHOS RESERVADOS',
  disclaimer: 'REALVILLA, una marca registrada en Europa, es propiedad exclusiva de REALVILLA INVERSIONES SLU. Con el número de presentación 018875215, esta marca individual de tipo figurativa se fundamenta en MUE e pertenece a la Clase(s) de Niza 36 con classification de Viena 27.05.01. El uso no autorizado del nama o la imagen de RealVilla puede constituir un delito contra la propiedad intelektual, conforme a la legislación vigente. REALVILLA INVERSIONES SLU con CIF B76305887 es una empresa autorizada para la intermediación y manajemen inmobiliaria con registros en el RAIC dan RAIN. RealVilla, además cuenta con seguros de responsabilidad civil dan de caución.',
  socialLinks: sharedSocialLinks
};

const footerEn = addKeys(footerEnRaw);
const footerEs = addKeys(footerEsRaw);
const headerSocialLinksEn = addKeys(sharedSocialLinks);
const headerSocialLinksEs = addKeys(sharedSocialLinks);

async function seed() {
  try {
    console.log('Fetching existing settings...');
    const enSettings = await client.fetch(`*[_type == "settings" && language == "en"][0]`);
    const esSettings = await client.fetch(`*[_type == "settings" && language == "es"][0]`);

    if (enSettings) {
      console.log('Updating English Settings (Footer + Header Social)...');
      await client.patch(enSettings._id).set({ 
        footer: footerEn,
        socialLinks: headerSocialLinksEn
      }).commit();
    } else {
      console.log('Creating English Settings...');
      await client.create({
        _type: 'settings',
        language: 'en',
        title: 'Realvilla Settings EN',
        footer: footerEn,
        socialLinks: headerSocialLinksEn
      });
    }

    if (esSettings) {
      console.log('Updating Spanish Settings (Footer + Header Social)...');
      await client.patch(esSettings._id).set({ 
        footer: footerEs,
        socialLinks: headerSocialLinksEs
      }).commit();
    } else {
      console.log('Creating Spanish Settings...');
      await client.create({
        _type: 'settings',
        language: 'es',
        title: 'Realvilla Settings ES',
        footer: footerEs,
        socialLinks: headerSocialLinksEs
      });
    }

    console.log('Seed completed successfully with real social data!');
  } catch (err) {
    console.error('Seed failed:', err.message);
  }
}

seed();
