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

async function removeOrphanFields() {
  console.log('🚀 Removing orphan fields from property documents...');

  // Fields to remove
  const fieldsToUnset = [
    'secondaryImage',
    'slug'
  ];

  // Query for properties that have these fields
  const filterClause = fieldsToUnset.map(field => `defined(${field})`).join(' || ');
  const query = `*[_type == "property" && (${filterClause})] { _id, title, secondaryImage, slug }`;

  const targetDocs = await client.fetch(query);

  if (targetDocs.length === 0) {
    console.log('✨ No orphan fields found in property documents.');
    return;
  }

  console.log(`📦 Found ${targetDocs.length} property documents with orphan fields.`);
  console.log('\nDocuments to be cleaned:');
  targetDocs.forEach(doc => {
    const hasSecondaryImage = doc.secondaryImage ? '✓ secondaryImage' : '';
    const hasSlug = doc.slug ? '✓ slug' : '';
    console.log(`   - ${doc.title || doc._id}: ${hasSecondaryImage} ${hasSlug}`);
  });

  console.log('\n🧹 Starting cleanup...');

  for (const doc of targetDocs) {
    console.log(`   Cleaning [${doc.title || doc._id}]...`);
    
    await client
      .patch(doc._id)
      .unset(fieldsToUnset)
      .commit()
      .then(() => console.log(`      ✅ Cleaned successfully`))
      .catch(err => console.error(`      ❌ Failed:`, err.message));
  }

  console.log('\n🏁 Orphan field removal completed!');
}

removeOrphanFields().catch(console.error);