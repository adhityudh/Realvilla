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
  const pages = await client.fetch(`*[_type == "page" && slug.current in ["buy", "comprar"]]`);
  for (const page of pages) {
    console.log(`Page: [${page.language}] ${page.title}`);
    for (const section of (page.sections || [])) {
      if (section._type === 'buyingProcessSection' || section._type === 'mortgageProcessSection') {
        console.log(`  Section: ${section._type}`);
        for (const step of (section.steps || [])) {
          console.log(`    Step: Number: "${step.number}", Title: "${step.title}"`);
          if (step.number === '07' || step.number === '7') {
            console.log(`      Description:`, JSON.stringify(step.description, null, 2));
          }
        }
      }
    }
  }
}

run();
