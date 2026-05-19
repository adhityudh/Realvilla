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

const sectionDefaults = {
  aboutSection: 'about',
  buyHeroSection: 'buy-hero',
  buyMortgageSimSection: 'mortgage-simulator',
  buyPropertiesSection: 'properties-list',
  buyingProcessSection: 'buying-process',
  contactSection: 'contact',
  documentLedgerSection: 'document-ledger',
  financingCardsSection: 'financing-cards',
  generalHeroSection: 'general-hero',
  heroSection: 'hero',
  mortgageFAQSection: 'mortgage',
  mortgageProcessSection: 'process',
  partnerSection: 'partners',
  propertiesSection: 'properties',
  statsSection: 'stats',
  testimonialsSection: 'testimonials',
  valuationSection: 'valuation'
};

async function run() {
  const pages = await client.fetch(`*[_type == "page"]`);

  for (const page of pages) {
    let updated = false;
    const updatedSections = (page.sections || []).map((section) => {
      const defaultId = sectionDefaults[section._type];
      if (defaultId && (!section.id || section.id.trim() === '')) {
        updated = true;
        return {
          ...section,
          id: defaultId,
        };
      }
      return section;
    });

    if (updated) {
      await client
        .patch(page._id)
        .set({ sections: updatedSections })
        .commit();
      console.log(`Successfully migrated section IDs for page: ${page.slug?.current || page._id} (${page.language || 'en'})`);
    } else {
      console.log(`No section IDs needed updates for page: ${page.slug?.current || page._id}`);
    }
  }
}

run().catch(console.error);
