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

const query = `
  *[_type == "page" && slug.current == $slug && (language == $language || (!defined(language) && $language == "en"))][0] {
    title,
    sections[] {
      _type,
      _key,
      headline,
      subtitle,
      formTitle,
      formSubtitle,
      initialStep,
      allowBack,
      generalTitle,
      generalSubtitle,
      sellTitle,
      sellSubtitle
    }
  }
`;

async function verify() {
  const data = await client.fetch(query, { slug: 'comprar', language: 'es' });
  console.log('--- COMPRAR PAGE (ES) FROM SANITY API ---');
  console.log(JSON.stringify(data, null, 2));
}

verify();
