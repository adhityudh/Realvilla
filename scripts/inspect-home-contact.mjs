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
  // Fetch homepage documents (both languages)
  const pages = await client.fetch(`
    *[_type == "page" && slug.current == "home"] {
      _id,
      language,
      sections[]
    }
  `);

  console.log('--- HOMEPAGE INSPECTION RESULTS ---');
  pages.forEach(page => {
    console.log(`\nPage ID: ${page._id} | Language: ${page.language}`);
    const contactSecs = page.sections?.filter(s => s._type === 'contactSection') || [];
    console.log(`Found ${contactSecs.length} ContactSections:`);
    contactSecs.forEach((sec, idx) => {
      console.log(`  [${idx}] _key: ${sec._key}`);
      console.log(`      formTitle: "${sec.formTitle}"`);
      console.log(`      formSubtitle: "${sec.formSubtitle}"`);
      console.log(`      generalTitle: "${sec.generalTitle}"`);
      console.log(`      sellTitle: "${sec.sellTitle}"`);
    });
  });
}

inspect();
