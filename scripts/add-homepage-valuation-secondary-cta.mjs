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
  const pages = await client.fetch(`*[_type == "page" && slug.current == "home"]`);
  
  for (const page of pages) {
    const isEs = page.language === 'es';
    
    // Find target internal page (sell for EN, vender for ES)
    const targetSlug = isEs ? 'vender' : 'sell';
    const targetPage = await client.fetch(`*[_type == "page" && slug.current == $slug][0]`, { slug: targetSlug });
    
    if (!targetPage) {
      console.warn(`Target page with slug "${targetSlug}" not found. Skipping...`);
      continue;
    }

    const sections = (page.sections || []).map((section) => {
      if (section._type === 'valuationSection') {
        return {
          ...section,
          showSecondaryCta: true,
          secondaryCtaLabel: isEs ? 'Descubre Nuestro Enfoque' : 'Discover Our Approach',
          secondaryLinkType: 'internal',
          secondaryInternalLink: {
            _type: 'reference',
            _ref: targetPage._id,
          },
        };
      }
      return section;
    });

    await client
      .patch(page._id)
      .set({ sections })
      .commit();

    console.log(`Updated home page [${page.language || 'en'}] (${page._id}) with secondary CTA pointing to ${targetSlug} (${targetPage._id})`);
  }
}

run().catch(console.error);
