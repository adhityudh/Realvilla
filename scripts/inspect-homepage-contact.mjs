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
  const ids = ["2bad81f1-669a-4c0e-b5f0-13de81f3d1af", "home-page"];
  for (const id of ids) {
    const page = await client.fetch(`*[_id == $id][0] { _id, title, language, sections }`, { id });
    console.log(`Page: ${page.title} (${page.language}) - ID: ${page._id}`);
    const contactSections = page.sections?.filter(s => s._type === 'contactSection');
    console.log(JSON.stringify(contactSections, null, 2));
    console.log("-----------------------------------------");
  }
}

run().catch(console.error);
