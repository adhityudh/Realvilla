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
  // English Page
  const enPage = await client.getDocument("2bad81f1-669a-4c0e-b5f0-13de81f3d1af");
  if (enPage && enPage.sections) {
    const updatedSections = enPage.sections.map(sec => {
      if (sec._type === 'contactSection') {
        return {
          ...sec,
          mortgageTitle: "REQUEST YOUR MORTGAGE STUDY",
          mortgageSubtitle: "Gain clarity on your purchasing power in Tenerife. Leave your details below, and our experts will contact you shortly to discuss your best financing options.",
          hideMortgageWhatsApp: true
        };
      }
      return sec;
    });
    await client.patch(enPage._id).set({ sections: updatedSections }).commit();
    console.log("Updated English Homepage.");
  }

  // Spanish Page
  const esPage = await client.getDocument("home-page");
  if (esPage && esPage.sections) {
    const updatedSections = esPage.sections.map(sec => {
      if (sec._type === 'contactSection') {
        return {
          ...sec,
          mortgageTitle: "SOLICITA TU ESTUDIO HIPOTECARIO",
          mortgageSubtitle: "Obtén claridad sobre tu capacidad de compra en Tenerife. Deja tus datos a continuación y nuestros expertos se pondrán en contacto en breve para analizar tus mejores opciones de financiación.",
          hideMortgageWhatsApp: true
        };
      }
      return sec;
    });
    await client.patch(esPage._id).set({ sections: updatedSections }).commit();
    console.log("Updated Spanish Homepage.");
  }
}

run().catch(console.error);
