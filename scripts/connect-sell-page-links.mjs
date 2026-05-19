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
  const pages = await client.fetch(`*[_type == "page" && slug.current in ["sell", "vender"]]`);

  for (const page of pages) {
    const isEs = page.language === 'es';
    
    const updatedSections = (page.sections || []).map((section) => {
      // 1. General Hero Section Button Links
      if (section._type === 'generalHeroSection') {
        const updatedHero = { ...section };
        if (updatedHero.primaryButton) {
          updatedHero.primaryButton = {
            ...updatedHero.primaryButton,
            linkType: 'external',
            externalLink: '#valuation',
          };
        }
        if (updatedHero.secondaryButton) {
          updatedHero.secondaryButton = {
            ...updatedHero.secondaryButton,
            linkType: 'external',
            externalLink: '#contact',
          };
        }
        return updatedHero;
      }

      // 2. Valuation Section CTA Link
      if (section._type === 'valuationSection') {
        return {
          ...section,
          linkType: 'external',
          externalLink: '#contact',
        };
      }

      return section;
    });

    await client
      .patch(page._id)
      .set({ sections: updatedSections })
      .commit();

    console.log(`Successfully connected Sell page links for [${page.language || 'en'}] (${page.slug.current})`);
  }
}

run().catch(console.error);
