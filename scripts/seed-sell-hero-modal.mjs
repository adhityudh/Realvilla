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

const SELL_PAGE_IDS = [
  "53781b2c-7966-4bca-a12d-ca847d3b6943", // English Sell Page
  "page-es-sell"                         // Spanish Sell Page
];

const MODAL_DATA = {
  en: {
    modalTitle: "INITIATE YOUR SALE",
    modalSubtitle: "Share your property details with us. Our market experts will reach out shortly to prepare a high-impact positioning strategy to sell your home.",
    hideWhatsApp: true
  },
  es: {
    modalTitle: "INICIA TU VENTA",
    modalSubtitle: "Comparte los detalles de tu propiedad con nosotros. Nuestros expertos en el mercado se pondrán en contacto en breve para preparar una estrategia de posicionamiento de alto impacto.",
    hideWhatsApp: true
  }
};

async function run() {
  console.log("🚀 Seeding modal fields in sellHeroSection for Sell pages...");

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
      const seedFields = MODAL_DATA[lang];

      if (!page.sections) {
        console.log(`⚠️ No sections found in page ${id}.`);
        continue;
      }

      let updated = false;
      const updatedSections = page.sections.map((section) => {
        if (section._type === 'sellHeroSection') {
          console.log(`✏️ Found sellHeroSection. Updating with modal fields...`);
          updated = true;
          return {
            ...section,
            ...seedFields
          };
        }
        return section;
      });

      if (updated) {
        await client.patch(page._id).set({ sections: updatedSections }).commit();
        console.log(`✅ Page ${page._id} updated successfully.`);
      } else {
        console.log(`ℹ️ No sellHeroSection found in page ${page._id}.`);
      }
    }
  }

  console.log("\n🎉 Seeding completed successfully!");
}

run().catch(console.error);
