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

async function migrateTrending() {
  console.log('🔄 Querying settings and pages for trending search migration...');
  
  // 1. Fetch current data from settings (or use default if missing)
  const settings = await client.fetch(`*[_type == "settings"]`);
  const pages = await client.fetch(`*[_type == "page" && count(sections[_type == "buyHeroSection"]) > 0] {
    _id,
    language,
    sections[_type == "buyHeroSection"]
  }`);

  const defaultTerms = ['Villa', 'Adeje', 'Costa Adeje', 'Arona', 'Santa Cruz'];
  const defaultEsTerms = ['Villa', 'Adeje', 'Costa Adeje', 'Arona', 'Los Cristianos'];

  console.log(`🔎 Found ${pages.length} matching pages with buyHeroSection.`);

  for (const page of pages) {
    const heroSection = page.sections.find(s => s._type === 'buyHeroSection');
    if (!heroSection) continue;

    // Try finding settings for corresponding language
    const correspondingSettings = settings.find(s => s.language === page.language);
    const targetTerms = (correspondingSettings && correspondingSettings.trendingSearches && Array.isArray(correspondingSettings.trendingSearches))
      ? correspondingSettings.trendingSearches
      : (page.language === 'es' ? defaultEsTerms : defaultTerms);

    console.log(`🌱 Populating ${targetTerms.length} trending terms into section ${heroSection._key} on page ${page._id}...`);

    await client.patch(page._id)
      .set({
        [`sections[_key=="${heroSection._key}"].trendingSearches`]: targetTerms
      })
      .commit();
  }

  console.log('🧹 Cleaning up old settings field...');
  for (const sDoc of settings) {
    await client.patch(sDoc._id).unset(['trendingSearches']).commit();
  }

  console.log('✅ Total Migration Complete!');
}

migrateTrending().catch(console.error);
