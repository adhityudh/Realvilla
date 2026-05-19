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

const updates = {
  // Buy Page
  "79c83f1a-580b-46b4-bc88-1cc65cbc5797": {
    headline: "YOUR PROPERTY ACQUISITION",
    subtitle: "Share your exact requirements with us. Our specialists will craft a bespoke search strategy to secure your ideal home in Tenerife with complete peace of mind.",
    marketData: [
      { _key: "buy-stat-1", _type: "marketItem", value: "Exclusive", label: "OFF-MARKET OPPORTUNITIES" },
      { _key: "buy-stat-2", _type: "marketItem", value: "Tailored", label: "PROPERTY SEARCH STRATEGY" },
      { _key: "buy-stat-3", _type: "marketItem", value: "Guided", label: "NEGOTIATION & CLOSING" }
    ]
  },
  // Buy Page Spanish (Comprar)
  "b8035107-9a47-45e3-b4ff-7688147cfc0b": {
    headline: "ADQUISICIÓN DE PROPIEDADES",
    subtitle: "Comparta sus requisitos exactos con nosotros. Nuestros especialistas diseñarán una estrategia de búsqueda a medida para asegurar su hogar ideal en Tenerife con total tranquilidad.",
    marketData: [
      { _key: "buy-stat-1", _type: "marketItem", value: "Exclusivo", label: "OPORTUNIDADES OFF-MARKET" },
      { _key: "buy-stat-2", _type: "marketItem", value: "A medida", label: "ESTRATEGIA DE BÚSQUEDA" },
      { _key: "buy-stat-3", _type: "marketItem", value: "Guiado", label: "NEGOCIACIÓN Y CIERRE" }
    ]
  },
  // Sell Page
  "53781b2c-7966-4bca-a12d-ca847d3b6943": {
    headline: "MAXIMIZE YOUR SALE",
    subtitle: "Take the first step towards a premium transaction. Our market experts will design a high-impact marketing strategy that positions your property for maximum return.",
    marketData: [
      { _key: "sell-stat-1", _type: "marketItem", value: "Global", label: "MARKETING EXPOSURE" },
      { _key: "sell-stat-2", _type: "marketItem", value: "Targeted", label: "BUYER ACQUISITION" },
      { _key: "sell-stat-3", _type: "marketItem", value: "Premium", label: "VISUAL POSITIONING" }
    ]
  },
  // Sell Page Spanish (Vender)
  "page-es-sell": {
    headline: "MAXIMICE SU VENTA",
    subtitle: "Dé el primer paso hacia una transacción premium. Nuestros expertos del mercado diseñarán una estrategia de marketing de alto impacto que posicione su propiedad para obtener el máximo rendimiento.",
    marketData: [
      { _key: "sell-stat-1", _type: "marketItem", value: "Global", label: "EXPOSICIÓN DE MARKETING" },
      { _key: "sell-stat-2", _type: "marketItem", value: "Dirigido", label: "ADQUISICIÓN DE COMPRADORES" },
      { _key: "sell-stat-3", _type: "marketItem", value: "Premium", label: "POSICIONAMIENTO VISUAL" }
    ]
  },
  // Mortgage Page
  "page-en-mortgage": {
    headline: "YOUR FINANCING STRATEGY",
    subtitle: "Gain absolute clarity on your purchasing power. Connect with our financial experts to secure the most competitive mortgage rates and financing terms available.",
    marketData: [
      { _key: "mortgage-stat-1", _type: "marketItem", value: "Favorable", label: "INTEREST RATES & TERMS" },
      { _key: "mortgage-stat-2", _type: "marketItem", value: "Tailored", label: "NON-RESIDENT SOLUTIONS" },
      { _key: "mortgage-stat-3", _type: "marketItem", value: "Seamless", label: "BANK NEGOTIATION" }
    ]
  },
  // Mortgage Page Spanish (Hipoteca)
  "page-es-mortgage": {
    headline: "SU ESTRATEGIA DE FINANCIACIÓN",
    subtitle: "Obtenga absoluta claridad sobre su poder adquisitivo. Conéctese con nuestros expertos financieros para asegurar las tasas de interés y condiciones de financiación de hipotecas más competitivas disponibles.",
    marketData: [
      { _key: "mortgage-stat-1", _type: "marketItem", value: "Favorable", label: "TASAS DE INTERÉS Y CONDICIONES" },
      { _key: "mortgage-stat-2", _type: "marketItem", value: "A medida", label: "SOLUCIONES PARA NO RESIDENTES" },
      { _key: "mortgage-stat-3", _type: "marketItem", value: "Impecable", label: "NEGOCIACIÓN BANCARIA" }
    ]
  }
};

async function run() {
  console.log("🚀 Starting contact sections content updates in Sanity...");

  for (const [baseId, updateData] of Object.entries(updates)) {
    const idsToUpdate = [baseId, `drafts.${baseId}`];

    for (const id of idsToUpdate) {
      const page = await client.fetch(`*[_id == $id][0] { _id, title, sections }`, { id });
      if (!page) {
        // Silent pass for non-existent draft documents
        if (!id.startsWith('drafts.')) {
          console.log(`⚠️ Document with ID ${id} not found.`);
        }
        continue;
      }

      if (!page.sections || page.sections.length === 0) {
        console.log(`⚠️ Document ${page.title} (${page._id}) does not contain any sections.`);
        continue;
      }

      const hasContactSection = page.sections.some(s => s._type === 'contactSection');
      if (!hasContactSection) {
        console.log(`⚠️ Document ${page.title} (${page._id}) does not have a contactSection.`);
        continue;
      }

      const updatedSections = page.sections.map(sec => {
        if (sec._type === 'contactSection') {
          return {
            ...sec,
            headline: updateData.headline,
            subtitle: updateData.subtitle,
            marketData: updateData.marketData
          };
        }
        return sec;
      });

      console.log(`✏️ Updating contactSection in document: ${page.title} (${page._id})...`);
      await client.patch(page._id).set({ sections: updatedSections }).commit();
      console.log(`✅ Document ${page._id} updated successfully.`);
    }
  }

  console.log("🎉 Content updates successfully finished!");
}

run().catch(console.error);
