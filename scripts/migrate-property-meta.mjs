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

async function migratePropertyMeta() {
  console.log('Fetching propertyMeta documents...');
  const metas = await client.fetch(`*[_type == "propertyMeta"]`);
  
  if (!metas || metas.length === 0) {
    console.log('No propertyMeta documents found.');
    return;
  }

  console.log(`Found ${metas.length} documents. Checking for legacy prefixOptions...`);
  let migrationCount = 0;

  for (const doc of metas) {
    const prefixOptions = doc.filter?.prefixOptions;
    if (!prefixOptions || prefixOptions.length === 0) continue;

    // Check if any item in the array is a string
    const hasLegacyStrings = prefixOptions.some(item => typeof item === 'string');
    if (!hasLegacyStrings) {
      console.log(`Document "${doc.shortLabel?.en || doc._id}" already has objects or is empty. Skipping.`);
      continue;
    }

    console.log(`Migrating "${doc.shortLabel?.en || doc._id}"...`);
    const migratedOptions = prefixOptions.map((item, index) => {
      if (typeof item === 'string') {
        const hasPlus = item.endsWith('+');
        const numericVal = parseInt(item.replace(/\D/g, ''), 10) || 0;
        return {
          _type: 'prefixOptionItem',
          _key: `opt-${index}-${Math.random().toString(36).substring(2, 9)}`,
          label: item,
          operator: hasPlus ? 'gte' : 'equals',
          value: numericVal,
        };
      }
      return item; // Keep existing objects intact
    });

    await client.patch(doc._id)
      .set({ 'filter.prefixOptions': migratedOptions })
      .commit();

    console.log(`Successfully migrated "${doc.shortLabel?.en || doc._id}"!`);
    migrationCount++;
  }

  console.log(`\nMigration complete! Total migrated documents: ${migrationCount}`);
}

migratePropertyMeta().catch(console.error);
