import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function run() {
  const ids = [
    "79c83f1a-580b-46b4-bc88-1cc65cbc5797",
    "b8035107-9a47-45e3-b4ff-7688147cfc0b",
    "53781b2c-7966-4bca-a12d-ca847d3b6943",
    "page-es-sell",
    "page-en-mortgage",
    "page-es-mortgage"
  ];
  for (const id of ids) {
    const page = await client.fetch(`*[_id == $id][0] { _id, title, language, sections }`, { id });
    if (!page) {
      console.log(`Page not found for ID: ${id}`);
      continue;
    }
    console.log(`Page: ${page.title} (${page.language}) - ID: ${page._id}`);
    const contactSections = page.sections?.filter(s => s._type === 'contactSection');
    console.log(JSON.stringify(contactSections, null, 2));
    console.log("-----------------------------------------");
  }
}

run().catch(console.error);
