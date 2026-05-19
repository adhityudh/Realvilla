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
  const enPage = await client.getDocument("page-en-mortgage");
  if (enPage && enPage.sections) {
    const updatedSections = enPage.sections.map(sec => {
      if (sec._type === 'contactSection') {
        return {
          ...sec,
          initialStep: "mortgage",
          mortgageTitle: sec.generalTitle || "Request Your Mortgage Study",
          mortgageSubtitle: sec.generalSubtitle || "Gain clarity on your purchasing power in Tenerife. Leave your details below, and our experts will contact you shortly to discuss your best financing options.",
          hideMortgageWhatsApp: false,
          mortgageWhatsappMessageTemplate: sec.whatsappMessageTemplate || "Hello, I am interested in receiving a personalized mortgage study.",
          // Keep general fields just in case, but clean up if needed
        };
      }
      return sec;
    });
    await client.patch(enPage._id).set({ sections: updatedSections }).commit();
    console.log("Updated English Mortgage page contact section.");
  }

  // Spanish Page
  const esPage = await client.getDocument("page-es-mortgage");
  if (esPage && esPage.sections) {
    const updatedSections = esPage.sections.map(sec => {
      if (sec._type === 'contactSection') {
        return {
          ...sec,
          initialStep: "mortgage",
          mortgageTitle: sec.generalTitle || "Solicite su Estudio Hipotecario",
          mortgageSubtitle: sec.generalSubtitle || "Obtenga claridad sobre su poder adquisitivo en Tenerife. Deje sus datos a continuación y nuestros expertos se pondrán en contacto con usted en breve para discutir sus mejores opciones de financiación.",
          hideMortgageWhatsApp: false,
          mortgageWhatsappMessageTemplate: sec.whatsappMessageTemplate || "Hola, estoy interesado en recibir un estudio hipotecario personalizado.",
        };
      }
      return sec;
    });
    await client.patch(esPage._id).set({ sections: updatedSections }).commit();
    console.log("Updated Spanish Mortgage page contact section.");
  }
}

run().catch(console.error);
