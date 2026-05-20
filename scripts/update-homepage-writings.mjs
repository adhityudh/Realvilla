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

async function run() {
  console.log("🚀 Querying all pages containing a contactSection from Sanity...");
  
  const pages = await client.fetch(`*[_type == "page" && count(sections[_type == "contactSection"]) > 0] {
    _id,
    title,
    language,
    sections
  }`);

  console.log(`Found ${pages.length} pages to process.`);

  for (const page of pages) {
    const isEs = page.language === 'es';
    let updated = false;

    const updatedSections = page.sections.map(sec => {
      if (sec._type === 'contactSection') {
        updated = true;
        if (isEs) {
          return {
            ...sec,
            sellTitle: "INICIA TU VENTA",
            sellSubtitle: "Nuestros expertos en el mercado se pondrán en contacto en breve para preparar una estrategia de posicionamiento de alto impacto para vender tu propiedad.",
            mortgageTitle: "SOLICITA ESTUDIO HIPOTECARIO",
            mortgageSubtitle: "Obtén claridad sobre tu capacidad de compra en Tenerife. Nuestros expertos se pondrán en contacto en breve para analizar tus mejores opciones de financiación."
          };
        } else {
          return {
            ...sec,
            sellTitle: "INITIATE YOUR SALE",
            sellSubtitle: "Our market experts will reach out shortly to prepare a high-impact positioning strategy to sell your property.",
            mortgageTitle: "REQUEST MORTGAGE STUDY",
            mortgageSubtitle: "Gain clarity on your purchasing power in Tenerife. Our experts will reach out shortly to discuss your best financing options."
          };
        }
      }
      return sec;
    });

    if (updated) {
      console.log(`✏️ Patching page: "${page.title}" (ID: ${page._id}, Lang: ${page.language || 'en'})...`);
      await client.patch(page._id).set({ sections: updatedSections }).commit();
      console.log(`✅ Updated page "${page.title}" (${page._id}) successfully.`);
    }
  }

  console.log("🎉 All contact sections updated successfully!");
}

run().catch(console.error);
