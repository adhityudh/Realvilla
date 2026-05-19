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
  // Fetch Buy pages contact sections
  const buyEn = await client.fetch('*[_type == "page" && slug.current == "buy"][0].sections[_type == "contactSection"][0]');
  const buyEs = await client.fetch('*[_type == "page" && slug.current == "comprar"][0].sections[_type == "contactSection"][0]');
  
  const pages = await client.fetch(`*[_type == "page" && slug.current in ["sell", "vender"]]`);
  
  for (const page of pages) {
    const isEs = page.language === 'es';
    const referenceData = isEs ? buyEs : buyEn;
    
    // Copy market data but assign new keys
    const marketData = (referenceData?.marketData || []).map(item => ({
      ...item,
      _key: randomKey(12)
    }));
    
    const newContactSection = {
      _key: `cs_sell_${randomKey(12)}_${isEs ? 'es' : 'en'}`,
      _type: "contactSection",
      headline: referenceData?.headline || (isEs ? "SU VISIÓN DE TENERIFE" : "YOUR TENERIFE VISION"),
      subtitle: referenceData?.subtitle || (isEs ? "Ya sea que busque una inversión lucrativa o un refugio costero privado, nuestro equipo dedicado está aquí para transformar su visión en realidad con total discreción y excelencia." : "Whether you are seeking a lucrative investment or a private coastal retreat, our dedicated team is here to transform your vision into reality with complete discretion and excellence."),
      marketData: marketData,
      initialStep: "sell",
      sellTitle: isEs ? "INICIA TU VENTA" : "INITIATE YOUR SALE",
      sellSubtitle: isEs ? "Comparte los detalles de tu propiedad con nosotros. Nuestros expertos en el mercado se pondrán en contacto en breve para preparar una estrategia de posicionamiento de alto impacto para vender tu hogar." : "Share your property details with us. Our market experts will reach out shortly to prepare a high-impact positioning strategy to sell your home.",
      hideSellWhatsApp: true,
      sellWhatsappMessageTemplate: isEs ? "Hola, estoy interesado en vender mi propiedad en Tenerife. Por favor, contáctame para que podamos discutir los detalles." : "Hello, I am interested in selling my property in Tenerife. Please contact me so we can discuss the details."
    };

    const currentSections = page.sections || [];
    // If there is already a contactSection, replace it, otherwise append to end
    const filteredSections = currentSections.filter(s => s._type !== 'contactSection');
    
    filteredSections.push(newContactSection);

    await client
      .patch(page._id)
      .set({ sections: filteredSections })
      .commit();
      
    console.log(`Updated page ${page._id} with new contact section`);
  }
}

run().catch(console.error);
