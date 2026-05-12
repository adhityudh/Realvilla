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

async function purgeNestedFields() {
  console.log('🚀 INITIATING DEEP PURGE OF NESTED LOCATION JUNK FIELDS...');

  // Define nested path targets inside "location" object
  const nestedFieldsToUnset = [
    'location.country',
    'location.googleMapsUrl',
    'location.neighborhood',
    'location.province',
    'location.zone'
  ];

  // Target documents containing ANY of these nested keys
  const filterClause = nestedFieldsToUnset.map(path => `defined(${path})`).join(' || ');
  const query = `*[_type == "property" && (${filterClause})] { _id, title }`;

  const targetDocs = await client.fetch(query);

  if (targetDocs.length === 0) {
    console.log('✨ CLEAN! No nested unknown fields found inside location objects.');
    return;
  }

  console.log(`📦 Found ${targetDocs.length} property documents containing nested location junk.`);

  for (const doc of targetDocs) {
    console.log(`   🧹 Unsetting deep location fields from [${doc.title || doc._id}]...`);
    
    await client
      .patch(doc._id)
      .unset(nestedFieldsToUnset)
      .commit()
      .catch(err => console.error(`      ❌ Deep patch failed on ${doc._id}:`, err.message));
  }

  console.log('\n🏁 DEEP NESTED PURGE COMPLETED! Clean as a whistle.');
}

purgeNestedFields().catch(console.error);
