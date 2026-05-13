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

async function inspectBuyPages() {
  const pages = await client.fetch(`
    *[_type == "page" && (slug.current == "buy" || slug.current == "comprar")] {
      _id,
      language,
      slug,
      sections[] {
        _type,
        _key
      }
    }
  `);

  console.log('🔍 FOUND BUY PAGES:', JSON.stringify(pages, null, 2));
}

inspectBuyPages();
