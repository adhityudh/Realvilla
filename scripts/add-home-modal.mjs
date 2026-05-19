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

// Get the home page for each language, add a sell modal component,
// and update the valuation section CTA to point to modal:sell-modal

const MODAL_COMPONENT_ID = 'sell-modal';

async function run() {
  const pages = await client.fetch(`*[_type == "page" && slug.current == "home"]`);
  
  for (const page of pages) {
    const isEs = page.language === 'es';

    const sellModalComponent = {
      _key: `pcmp_sell_modal_${page.language || 'en'}_${randomKey(8)}`,
      _type: 'contactModalComponent',
      componentId: { _type: 'slug', current: MODAL_COMPONENT_ID },
      formType: 'sell',
      title: isEs ? 'INICIA TU VENTA' : 'INITIATE YOUR SALE',
      subtitle: isEs
        ? 'Comparte los detalles de tu propiedad con nosotros. Nuestros expertos en el mercado se pondrán en contacto en breve para preparar una estrategia de posicionamiento de alto impacto.'
        : 'Share your property details with us. Our market experts will reach out shortly to prepare a high-impact positioning strategy to sell your home.',
      hideWhatsApp: true,
    };

    // Update or set pageComponents
    const existingComponents = (page.pageComponents || []).filter(
      (c) => !(c._type === 'contactModalComponent' && c.componentId?.current === MODAL_COMPONENT_ID)
    );

    existingComponents.push(sellModalComponent);

    // Update valuation section CTA link to modal:sell-modal
    const sections = (page.sections || []).map((section) => {
      if (section._type === 'valuationSection') {
        return {
          ...section,
          linkType: 'external',
          externalLink: `modal:${MODAL_COMPONENT_ID}`,
        };
      }
      return section;
    });

    await client
      .patch(page._id)
      .set({
        pageComponents: existingComponents,
        sections,
      })
      .commit();

    console.log(`Updated home page [${page.language || 'en'}] (${page._id})`);
  }
}

run().catch(console.error);
