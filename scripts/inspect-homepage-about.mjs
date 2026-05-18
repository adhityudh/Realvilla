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

async function inspect() {
  console.log('🔍 Querying aboutSection details for Home pages...');
  const page1 = await client.fetch(`*[_id == "2bad81f1-669a-4c0e-b5f0-13de81f3d1af"][0] { _id, title, "aboutSection": sections[_type == "aboutSection"][0] }`);
  console.log('Page 1 About:', JSON.stringify(page1, null, 2));

  const page2 = await client.fetch(`*[_id == "home-page"][0] { _id, title, "aboutSection": sections[_type == "aboutSection"][0] }`);
  console.log('Page 2 About:', JSON.stringify(page2, null, 2));
}

inspect().catch(console.error);
