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
  console.log('🔍 Fetching all properties with their translations...');
  // Let's get translation metadata as well
  const translationMetadata = await client.fetch(`*[_type == "translation.metadata"] {
    _id,
    translations[] {
      value {
        _ref
      }
    }
  }`);
  console.log('Translation Metadatas count:', translationMetadata.length);
  
  const properties = await client.fetch(`*[_type == "property"] {
    _id,
    title,
    language,
    "slug": slug.current,
    meta[] {
      metaKey-> {
        _id,
        "shortLabelEn": shortLabel.en
      },
      booleanValue,
      numberValue
    }
  }`);
  console.log('Total properties count:', properties.length);
  console.log('First 5 properties:', JSON.stringify(properties.slice(0, 5), null, 2));
  console.log('First 3 translation metadatas:', JSON.stringify(translationMetadata.slice(0, 3), null, 2));
}

list().catch(console.error);
