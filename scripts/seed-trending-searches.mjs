import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function seedTrendingSearches() {
  console.log('Fetching all Global Settings documents...');
  const settingsDocs = await client.fetch(`*[_type == "settings"]`);

  if (settingsDocs.length === 0) {
    console.error('No global settings documents found to seed!');
    return;
  }

  const defaultSuggestions = ['Villa', 'Adeje', 'Costa Adeje', 'Arona', 'Santa Cruz'];

  console.log(`Found ${settingsDocs.length} settings document(s). Seeding trendingSearches...`);

  for (const doc of settingsDocs) {
    console.log(`Patching settings document ID: ${doc._id} (${doc.language || 'no-language'})...`);
    await client.patch(doc._id)
      .set({ trendingSearches: defaultSuggestions })
      .commit();
  }

  console.log('Trending searches seeded successfully!');
}

seedTrendingSearches().catch(console.error);
