import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, 
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function seedMortgageCta() {
  console.log('🔍 Searching for Mortgage Simulation modules needing CTA populating...');
  
  const documents = await client.fetch(`*[ 
    count(sections[_type == "buyMortgageSimSection"]) > 0 || 
    count(propertyDetailSections[_type == "buyMortgageSimSection"]) > 0
  ] {
    _id,
    language,
    sections,
    propertyDetailSections
  }`);

  console.log(`📄 Found ${documents.length} documents.`);

  for (const doc of documents) {
    const isEs = doc.language === 'es';
    const patches = {};
    let hasChanges = false;

    const updateSection = (sec) => {
      if (sec._type === 'buyMortgageSimSection' && !sec.ctaLabel) {
        hasChanges = true;
        return {
          ...sec,
          ctaLabel: isEs ? 'Conocer sobre Financiación' : 'Learn About Financing',
          linkType: 'external',
          externalLink: '#financing'
        };
      }
      return sec;
    };

    if (doc.sections) {
      const updated = doc.sections.map(updateSection);
      if (hasChanges) patches.sections = updated;
    }

    // Reset hasChanges check slightly differently to maintain logical order if second check fires
    let detailChanges = false;
    if (doc.propertyDetailSections) {
      const updatedProp = doc.propertyDetailSections.map(sec => {
        if (sec._type === 'buyMortgageSimSection' && !sec.ctaLabel) {
          detailChanges = true;
          return {
            ...sec,
            ctaLabel: isEs ? 'Conocer sobre Financiación' : 'Learn About Financing',
            linkType: 'external',
            externalLink: '#financing'
          };
        }
        return sec;
      });
      if (detailChanges) patches.propertyDetailSections = updatedProp;
    }

    if (hasChanges || detailChanges) {
      console.log(`🌱 Injecting CTA anchor into [${doc._id}]...`);
      await client.patch(doc._id).set(patches).commit();
    }
  }

  console.log('✅ Simulation CTA fully seeded!');
}

seedMortgageCta().catch(console.error);
