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

async function runMigration() {
  console.log('🔄 Querying sections for migration...');
  const pages = await client.fetch(`*[_type == "page" && count(sections[_type == "buyMortgageSimSection"]) > 0] {
    _id,
    language,
    sections[_type == "buyMortgageSimSection"]
  }`);

  for (const page of pages) {
    const section = page.sections.find(s => s._type === 'buyMortgageSimSection');
    if (!section) continue;

    const isEs = page.language === 'es';
    const newText = isEs 
      ? '*Los cálculos son estimaciones. Las tasas reales pueden variar según el banco y su perfil.'
      : '*Calculations are estimates. Actual rates may vary depending on the bank and your profile.';

    console.log(`🛠 Migrating section key ${section._key} on doc ${page._id}...`);
    
    await client.patch(page._id)
      .unset([`sections[_key=="${section._key}"].trustText`])
      .set({ [`sections[_key=="${section._key}"].disclaimerText`]: newText })
      .commit();
  }
  console.log('✅ Disclaimer Migration Complete!');
}

runMigration().catch(console.error);
