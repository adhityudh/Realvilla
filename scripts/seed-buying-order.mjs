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

async function seedBuyingProcessOrder() {
  console.log('🔍 Scanning for Buying Process sections across all documents...');
  
  // Fetch documents containing sections array with buyingProcessSection
  const documents = await client.fetch(`*[ 
    count(sections[_type == "buyingProcessSection"]) > 0 || 
    count(propertyDetailSections[_type == "buyingProcessSection"]) > 0
  ] {
    _id,
    sections,
    propertyDetailSections
  }`);

  console.log(`📄 Found ${documents.length} documents to update.`);

  for (const doc of documents) {
    const patches = {};
    let hasChanges = false;

    // Process main sections array
    if (doc.sections && Array.isArray(doc.sections)) {
      const updatedSections = doc.sections.map(sec => {
        if (sec._type === 'buyingProcessSection' && !sec.imageOrder) {
          hasChanges = true;
          // Setting to 'right-first' since you preferred the photo on the right!
          return { ...sec, imageOrder: 'right-first' }; 
        }
        return sec;
      });
      if (hasChanges) patches.sections = updatedSections;
    }

    // Process global setting array propertyDetailSections
    if (doc.propertyDetailSections && Array.isArray(doc.propertyDetailSections)) {
      const updatedPropertySections = doc.propertyDetailSections.map(sec => {
        if (sec._type === 'buyingProcessSection' && !sec.imageOrder) {
          hasChanges = true;
          return { ...sec, imageOrder: 'right-first' };
        }
        return sec;
      });
      if (hasChanges) patches.propertyDetailSections = updatedPropertySections;
    }

    if (hasChanges) {
      console.log(`🌱 Injecting imageOrder to document [${doc._id}]...`);
      await client.patch(doc._id).set(patches).commit();
    }
  }

  console.log('✅ Seeding complete! All Buying Process components are now harmonized.');
}

seedBuyingProcessOrder().catch(console.error);
