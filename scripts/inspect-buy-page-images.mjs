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

async function inspect() {
  console.log('Fetching English buy page...');
  const page = await client.getDocument('79c83f1a-580b-46b4-bc88-1cc65cbc5797');
  if (!page) {
    console.log('Buy page not found.');
    return;
  }

  const mpsSection = (page.sections || []).find(s => s._type === 'mortgageProcessSection');
  if (!mpsSection) {
    console.log('mortgageProcessSection not found on Buy page.');
    return;
  }

  console.log('\n--- STEPS IN MORTGAGE PROCESS SECTION ---');
  for (const step of mpsSection.steps || []) {
    console.log(`Step ${step.number}: ${step.title}`);
    if (step.image && step.image.asset) {
      const assetRef = step.image.asset._ref;
      const asset = await client.getDocument(assetRef);
      console.log(`  -> Image Asset ID: ${assetRef}`);
      console.log(`  -> Original Filename: ${asset?.originalFilename || 'N/A'}`);
      console.log(`  -> URL: ${asset?.url || 'N/A'}`);
    } else {
      console.log('  -> No Image.');
    }
  }
}

inspect().catch(console.error);
