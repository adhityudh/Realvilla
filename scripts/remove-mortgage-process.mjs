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

async function removeSection() {
  console.log('🧹 REMOVING MORTGAGE PROCESS SECTION FROM BUY PAGES...');

  // 1. English Buy Page patch
  console.log('Fetching English buy page...');
  const enPage = await client.getDocument('79c83f1a-580b-46b4-bc88-1cc65cbc5797');
  if (enPage) {
    const sections = (enPage.sections || []).filter(s => s._type !== 'mortgageProcessSection');
    await client.patch(enPage._id)
      .set({ sections })
      .commit();
    console.log('✅ Successfully removed from English Buy Page.');
  }

  // 2. Spanish Comprar Page patch
  console.log('Fetching Spanish comprar page...');
  const esPage = await client.getDocument('b8035107-9a47-45e3-b4ff-7688147cfc0b');
  if (esPage) {
    const sections = (esPage.sections || []).filter(s => s._type !== 'mortgageProcessSection');
    await client.patch(esPage._id)
      .set({ sections })
      .commit();
    console.log('✅ Successfully removed from Spanish Comprar Page.');
  }

  console.log('🎉 REMOVAL COMPLETED!');
}

removeSection().catch(console.error);
