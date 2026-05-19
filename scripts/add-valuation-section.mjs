import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { randomKey } from '@sanity/util/content';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function run() {
  const pages = await client.fetch(`*[_type == "page" && slug.current in ["sell", "vender"]]`);
  
  for (const page of pages) {
    const isEs = page.language === 'es';
    
    const newSection = {
      _key: `val_${randomKey(10)}`,
      _type: "valuationSection",
      tagline: isEs ? "DESCUBRE EL VALOR" : "DISCOVER THE VALUE",
      headline: isEs ? "Conoce tu Valor de Mercado." : "Know Your Market Value.",
      body: isEs ? "Números reales, datos en tiempo real. Obtén una valoración profesional basada en ventas reales en Tenerife ahora mismo, para que puedas tomar tu próxima decisión con absoluta confianza." : "Real numbers, real-time data. Get a professional valuation based on actual Tenerife sales right now, so you can make your next move with absolute confidence.",
      trustText: isEs ? "TUS DATOS ESTÁN SEGUROS. LAS VALORACIONES ESTÁN RESPALDADAS POR ANALÍTICAS AVANZADAS Y EXPERTOS LÍDERES EN ESPAÑA." : "YOUR DATA IS SECURE. VALUATIONS ARE POWERED BY ADVANCED ANALYTICS AND SPAIN'S LEADING EXPERTS.",
      ctaLabel: isEs ? "VENDE TU PROPIEDAD" : "SELL YOUR PROPERTY",
      linkType: "external",
      externalLink: "#",
      // using the one typically used for valuation, we can leave it empty if there's no default, but wait, without it it shows loading forever
      iframeUrl: isEs ? "https://realvilla.valuation.realadvisor.es/appraise?language=es" : "https://realvilla.valuation.realadvisor.es/appraise?language=en"
    };

    // Replace or append
    const currentSections = page.sections || [];
    // remove existing valuationSection if any
    const filteredSections = currentSections.filter(s => s._type !== 'valuationSection');
    
    // Find index of buyingProcessSection
    const buyingProcessIndex = filteredSections.findIndex(s => s._type === 'buyingProcessSection');
    
    // Insert after buyingProcessSection, or at the end if not found
    const insertIndex = buyingProcessIndex !== -1 ? buyingProcessIndex + 1 : filteredSections.length;
    
    filteredSections.splice(insertIndex, 0, newSection);

    await client
      .patch(page._id)
      .set({ sections: filteredSections })
      .commit();
      
    console.log(`Updated page ${page._id}`);
  }
}

run().catch(console.error);
