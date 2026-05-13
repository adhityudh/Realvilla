import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-03-05',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function run() {
  const res = await client.fetch(`
    *[_type == "page" && slug.current == "buy"][0] {
      sections[_type == "buyHeroSection"][0] {
        jumpLinks
      }
    }
  `);
  console.log('🔗 CMS JUMP LINKS:', JSON.stringify(res, null, 2));
}
run();
