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

async function seedBounds() {
  console.log('🔄 Searching for Buy Mortgage sections to populate boundary seeds...');
  
  const pages = await client.fetch(`*[_type == "page" && count(sections[_type == "buyMortgageSimSection"]) > 0] {
    _id,
    sections[_type == "buyMortgageSimSection"]
  }`);

  console.log(`🔎 Found ${pages.length} documents. Launching data population...`);

  for (const doc of pages) {
    const section = doc.sections.find(s => s._type === 'buyMortgageSimSection');
    if (!section) continue;

    console.log(`🌱 Seeding boundaries on document ${doc._id}...`);
    
    await client.patch(doc._id)
      .set({
        [`sections[_key=="${section._key}"].downPaymentMin`]: 20,
        [`sections[_key=="${section._key}"].downPaymentMax`]: 100,
        [`sections[_key=="${section._key}"].loanTermMin`]: 1,
        [`sections[_key=="${section._key}"].loanTermMax`]: 30,
      })
      .commit();
  }
  
  console.log('✅ Seed Successful: Default slider bounds populated successfully!');
}

seedBounds().catch(console.error);
