import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const SELL_PAGE_IDS = [
  "53781b2c-7966-4bca-a12d-ca847d3b6943", // English Sell Page
  "page-es-sell"                         // Spanish Sell Page
];

const SEED_DATA = {
  en: {
    tagline: "HOW WE SELL",
    headline: "STRATEGIC EXECUTION. MAXIMUM RESULTS.",
    intro: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text: "We don't just list properties; we launch them. Discover our proven, step-by-step methodology to position your asset, attract qualified buyers, and close at the best possible price."
          }
        ]
      }
    ],
    timelineMode: true,
    steps: [
      {
        _key: "sell-step-1",
        number: "01",
        title: "Strategic Property Valuation",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "We analyze the real market, current demand, and your property’s characteristics to position it correctly from day one and maximize its value."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-2",
        number: "02",
        title: "Legal & Documentation Security",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "We carefully review all required documentation to prevent issues during the transaction and provide confidence to potential buyers."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-3",
        number: "03",
        title: "Advanced Real Estate Marketing",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "We create a professional marketing strategy including photography, video, virtual tour, social media exposure, and publication on major national and international property portals to maximize your property’s visibility and positioning."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-4",
        number: "04",
        title: "Qualified Buyers Only",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "We filter every inquiry and prioritize buyers with genuine interest and financial capability to avoid unnecessary viewings and wasted time."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-5",
        number: "05",
        title: "Strategic Offer & Transaction Management",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "We analyze every proposal and manage negotiations, reservations, contracts, banks, and valuations while always seeking the best possible conditions and security for the seller."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-6",
        number: "06",
        title: "Guidance, Completion & Closing",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "We support you throughout the entire process until the final signing at the notary, supervising every detail to ensure a secure, organized, and professionally managed transaction."
              }
            ]
          }
        ]
      }
    ]
  },
  es: {
    tagline: "CÓMO VENDEMOS",
    headline: "EJECUCIÓN ESTRATÉGICA. MÁXIMOS RESULTADOS.",
    intro: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text: "No nos limitamos a listar propiedades; las lanzamos. Descubra nuestra metodología probada y paso a paso para posicionar su activo, atraer compradores calificados y cerrar al mejor precio posible."
          }
        ]
      }
    ],
    timelineMode: true,
    steps: [
      {
        _key: "sell-step-1",
        number: "01",
        title: "Valoración Estratégica de la Propiedad",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "Analizamos el mercado real, la demanda actual y las características de su propiedad para posicionarla correctamente desde el primer día y maximizar su valor."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-2",
        number: "02",
        title: "Seguridad Legal y Documental",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "Revisamos cuidadosamente toda la documentación requerida para evitar problemas durante la transacción y brindar confianza a los compradores potenciales."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-3",
        number: "03",
        title: "Marketing Inmobiliario Avanzado",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "Creamos una estrategia de marketing profesional que incluye fotografía, video, tour virtual, exposición en redes sociales y publicación en los principales portales inmobiliarios nacionales e internacionales para maximizar la visibilidad y el posicionamiento de su propiedad."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-4",
        number: "04",
        title: "Solo Compradores Calificados",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "Filtramos cada consulta y priorizamos a los compradores con interés genuino y capacidad financiera para evitar visitas innecesarias y pérdida de tiempo."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-5",
        number: "05",
        title: "Gestión Estratégica de Ofertas y Transacciones",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "Analizamos cada propuesta y gestionamos negociaciones, reservas, contratos, bancos y tasaciones, buscando siempre las mejores condiciones y seguridad para el vendedor."
              }
            ]
          }
        ]
      },
      {
        _key: "sell-step-6",
        number: "06",
        title: "Acompañamiento, Firma y Cierre",
        description: [
          {
            _type: "block",
            style: "normal",
            children: [
              {
                _type: "span",
                text: "Le acompañamos durante todo el proceso hasta la firma final ante notario, supervisando cada detalle para garantizar una transacción segura, organizada y gestionada profesionalmente."
              }
            ]
          }
        ]
      }
    ]
  }
};

async function run() {
  console.log("🚀 Seeding Sell Process sections on Sell pages...");

  for (const baseId of SELL_PAGE_IDS) {
    const ids = [baseId, `drafts.${baseId}`];

    for (const id of ids) {
      const page = await client.fetch(`*[_id == $id][0] { _id, title, language, sections }`, { id });
      if (!page) {
        if (!id.startsWith('drafts.')) {
          console.log(`⚠️ Page not found for ID: ${id}`);
        }
        continue;
      }

      console.log(`\nPage: ${page.title} (${page.language}) - ID: ${page._id}`);

      const lang = page.language === 'es' ? 'es' : 'en';
      const seedContent = SEED_DATA[lang];

      // Build the new sellProcessSection
      const newSellProcessSection = {
        _type: "sellProcessSection",
        _key: `sps_sell_${Date.now()}_${lang}`,
        id: "sell-process",
        ...seedContent
      };

      let sections = page.sections || [];

      // Check if it already exists to avoid duplicate seeding
      const existingIdx = sections.findIndex(s => s._type === 'sellProcessSection');
      if (existingIdx !== -1) {
        console.log(`✏️ Sell Process Section already exists. Updating it...`);
        sections[existingIdx] = {
          ...sections[existingIdx],
          ...seedContent
        };
      } else {
        // Find index of sellHeroSection to place it right below it
        const heroIdx = sections.findIndex(s => s._type === 'sellHeroSection');
        if (heroIdx !== -1) {
          console.log(`➕ Inserting Sell Process Section right below sellHeroSection...`);
          sections.splice(heroIdx + 1, 0, newSellProcessSection);
        } else {
          console.log(`➕ Appending Sell Process Section to sections list...`);
          sections.push(newSellProcessSection);
        }
      }

      await client.patch(page._id).set({ sections }).commit();
      console.log(`✅ Page ${page._id} updated successfully.`);
    }
  }

  console.log("\n🎉 Sell Process Section seeding completed successfully!");
}

run().catch(console.error);
