import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, 
  useCdn: false,
  apiVersion: '2024-01-01',
});

// Small helper to ensure fresh keys prevent collision although duplication is usually fine
const generateKey = () => crypto.randomBytes(6).toString('hex');

async function seedPropertyPageSections() {
  console.log('🔄 Fetching source sections from Buy pages...');
  
  // Fetch the exact source sections from Buy and Comprar pages
  const pages = await client.fetch(`*[_type == "page" && slug.current in ["buy", "comprar"]] {
    language,
    "targetSections": sections[_type in ["buyingProcessSection", "buyMortgageSimSection"]]
  }`);

  console.log(`🔎 Found source sections for ${pages.length} language paths.`);

  for (const pageData of pages) {
    const lang = pageData.language || 'en';
    const sourceSections = pageData.targetSections;
    
    if (!sourceSections || sourceSections.length === 0) {
      console.log(`⚠️ No target sections found for [${lang}] Buy page. Skipping...`);
      continue;
    }

    // Find target settings document matching the language
    const settingsDoc = await client.fetch(`*[_type == "settings" && (language == $lang || (!defined(language) && $lang == "en"))][0] { _id }`, { lang });

    if (!settingsDoc) {
      console.log(`❌ Could not find settings document for [${lang}]. Skipping...`);
      continue;
    }

    console.log(`🌱 Cloned ${sourceSections.length} sections for [${lang}]. Injecting into settings [${settingsDoc._id}]...`);

    // Clone source sections and refresh their _keys to be safe
    const clonedSections = sourceSections.map(sec => ({
      ...sec,
      _key: `detail_${generateKey()}`
    }));

    await client.patch(settingsDoc._id)
      .set({
        propertyDetailSections: clonedSections
      })
      .commit();
  }

  console.log('✅ Seeding complete! Property Detail Page Sections are now aligned with Buy pages!');
}

seedPropertyPageSections().catch(console.error);
