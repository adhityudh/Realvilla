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

const MODAL_COMPONENT_ID = 'mortgage-study-modal';

async function run() {
  const pages = await client.fetch(`*[_type == "page" && slug.current == "home"]`);

  for (const page of pages) {
    const isEs = page.language === 'es';

    // Find the internal mortgage page to link the secondary CTA
    const mortgageSlug = isEs ? 'hipoteca' : 'mortgage';
    const mortgagePage = await client.fetch(`*[_type == "page" && slug.current == $slug][0]`, { slug: mortgageSlug });

    if (!mortgagePage) {
      console.warn(`Mortgage page with slug "${mortgageSlug}" not found. Skipping secondary link mapping for this language.`);
      continue;
    }

    // 1. Create/Configure the Contact Modal Component
    const mortgageModalComponent = {
      _key: `pcmp_mortgage_modal_${page.language || 'en'}_${randomKey(8)}`,
      _type: 'contactModalComponent',
      componentId: { _type: 'slug', current: MODAL_COMPONENT_ID },
      formType: 'general',
      title: isEs ? 'SOLICITA TU ESTUDIO HIPOTECARIO' : 'REQUEST YOUR MORTGAGE STUDY',
      subtitle: isEs
        ? 'Obtén claridad sobre tu capacidad de compra en Tenerife. Deja tus datos a continuación y nuestros expertos se pondrán en contacto en breve para analizar tus mejores opciones de financiación.'
        : 'Gain clarity on your purchasing power in Tenerife. Leave your details below, and our experts will contact you shortly to discuss your best financing options.',
      whatsappMessageTemplate: isEs
        ? 'Hola, estoy interesado en recibir un estudio hipotecario personalizado.'
        : 'Hello, I am interested in receiving a personalized mortgage study.',
      presetMessage: isEs
        ? 'Nueva solicitud: Estudio hipotecario y opciones de financiación en Tenerife.'
        : 'New Request: Mortgage study and financing options in Tenerife.',
      hideWhatsApp: false, // Explicitly false as we have a template
    };

    // Filter out existing modal components with the same ID
    const existingComponents = (page.pageComponents || []).filter(
      (c) => !(c._type === 'contactModalComponent' && c.componentId?.current === MODAL_COMPONENT_ID)
    );
    existingComponents.push(mortgageModalComponent);

    // 2. Update the mortgageFAQSection inside page sections
    const updatedSections = (page.sections || []).map((section) => {
      if (section._type === 'mortgageFAQSection') {
        return {
          ...section,
          // Primary CTA
          ctaLabel: isEs ? 'Solicita un Estudio Gratuito' : 'Request a Free Study',
          linkType: 'external',
          externalLink: `modal:${MODAL_COMPONENT_ID}`,
          
          // Secondary CTA
          showSecondaryCta: true,
          secondaryCtaLabel: isEs ? 'Explorar Opciones de Financiación' : 'Explore Financing Options',
          secondaryLinkType: 'internal',
          secondaryInternalLink: {
            _type: 'reference',
            _ref: mortgagePage._id,
          },
        };
      }
      return section;
    });

    await client
      .patch(page._id)
      .set({
        pageComponents: existingComponents,
        sections: updatedSections,
      })
      .commit();

    console.log(`Successfully updated homepage [${page.language || 'en'}] (${page._id}):`);
    console.log(` - Added pageComponent: ${MODAL_COMPONENT_ID}`);
    console.log(` - Mapped FAQ Section CTAs (Primary modal trigger, Secondary link to ${mortgageSlug})`);
  }
}

run().catch(console.error);
