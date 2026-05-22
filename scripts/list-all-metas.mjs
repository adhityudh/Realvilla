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

async function list() {
  console.log('🔍 Fetching all property metas...');
  const metas = await client.fetch(`*[_type == "propertyMeta"] {
    _id,
    "shortLabelEn": shortLabel.en,
    "longLabelEn": longLabel.en,
    valueType,
    children
  }`);
  console.log(JSON.stringify(metas, null, 2));
}

list().catch(console.error);
