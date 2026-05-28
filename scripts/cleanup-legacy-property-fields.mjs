import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-05-02',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function run() {
  console.log('🧹 Starting cleanup of deprecated property fields...\n');

  // Fetch all property documents that still have the legacy fields
  const properties = await client.fetch(
    `*[_type == "property" && (defined(location.coordinateMethod) || defined(location.lat) || defined(location.lng) || defined(lat) || defined(lng))] { _id, title, propertyCode }`
  );

  if (properties.length === 0) {
    console.log('✅ No documents found with deprecated fields. Database is already clean!');
    return;
  }

  console.log(`📦 Found ${properties.length} property document(s) with deprecated fields.\n`);

  let transaction = client.transaction();

  for (const doc of properties) {
    console.log(`🧹 Queueing cleanup for property: "${doc.title || doc.propertyCode}" (${doc._id})`);
    
    transaction.patch(doc._id, (p) =>
      p.unset([
        'location.coordinateMethod',
        'location.lat',
        'location.lng',
        'lat',
        'lng'
      ])
    );
  }

  console.log('\n🚀 Committing transaction to Sanity...');
  await transaction.commit();
  console.log('🎉 Successfully cleaned up all property documents! Sanity Studio is now fully clean.');
}

run().catch(console.error);
