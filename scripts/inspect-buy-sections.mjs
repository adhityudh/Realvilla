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

async function inspect() {
  const docs = await client.fetch(`
    *[_type == "page" && slug.current in ["buy", "comprar"]] {
      language,
      slug,
      sections[]
    }
  `);

  console.log(JSON.stringify(docs, null, 2));
}

inspect();
