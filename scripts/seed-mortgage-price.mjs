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

async function seedMortgageSimDefaultPrice() {
  console.log('🔍 Scanning for Mortgage Sim sections to populate default price...');
  
  // Fetch all documents containing the section
  const documents = await client.fetch(`*[ 
    count(sections[_type == "buyMortgageSimSection"]) > 0 || 
    count(propertyDetailSections[_type == "buyMortgageSimSection"]) > 0
  ] {
    _id,
    sections,
    propertyDetailSections
  }`);

  console.log(`📄 Found ${documents.length} target documents.`);

  for (const doc of documents) {
    const patches = {};
    let hasChanges = false;

    if (doc.sections && Array.isArray(doc.sections)) {
      const updatedSections = doc.sections.map(sec => {
        if (sec._type === 'buyMortgageSimSection' && !sec.defaultPrice) {
          hasChanges = true;
          return { ...sec, defaultPrice: 500000 };
        }
        return sec;
      });
      if (hasChanges) patches.sections = updatedSections;
    }

    if (doc.propertyDetailSections && Array.isArray(doc.propertyDetailSections)) {
      const updatedPropSections = doc.propertyDetailSections.map(sec => {
        if (sec._type === 'buyMortgageSimSection' && !sec.defaultPrice) {
          hasChanges = true;
          return { ...sec, defaultPrice: 500000 };
        }
        return sec;
      });
      if (hasChanges) patches.propertyDetailSections = updatedPropSections;
    }

    if (hasChanges) {
      console.log(`🌱 Setting defaultPrice to 500000 in [${doc._id}]...`);
      await client.patch(doc._id).set(patches).commit();
    }
  }

  console.log('✅ Default Pricing Seed complete!');
}

seedMortgageSimDefaultPrice().catch(console.error);
