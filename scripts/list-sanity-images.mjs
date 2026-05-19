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

async function list() {
  console.log('Querying last 100 image assets in Sanity...');
  const query = `*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0..100] {
    _id,
    originalFilename,
    url,
    mimeType,
    metadata {
      dimensions {
        width,
        height
      }
    },
    _createdAt
  }`;
  
  const assets = await client.fetch(query);
  console.log('\n--- SANITY IMAGE ASSETS ---');
  assets.forEach((asset, idx) => {
    // Print everything
    console.log(`${idx + 1}. ID: ${asset._id} | Filename: ${asset.originalFilename || 'N/A'} | URL: ${asset.url} | Created: ${asset._createdAt}`);
  });
}

list().catch(console.error);
