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

async function inspectMedia() {
  console.log('🔍 FETCHING SANITY IMAGE ASSETS...');
  const assets = await client.fetch(`
    *[_type == "sanity.imageAsset"] | order(_createdAt desc) [0..50] {
      _id,
      originalFilename,
      mimeType,
      size,
      metadata {
        dimensions {
          width,
          height
        }
      }
    }
  `);

  console.log('FOUND ASSETS:');
  assets.forEach((asset, i) => {
    console.log(`${i + 1}. ID: ${asset._id} | Name: ${asset.originalFilename} | Size: ${(asset.size / 1024).toFixed(1)} KB | Resolution: ${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height}`);
  });
}

inspectMedia().catch(console.error);
