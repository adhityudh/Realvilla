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
  console.log("Fetching all properties from Sanity...");
  const properties = await client.fetch(`*[_type == "property"] { _id, title, language, gallery }`);
  console.log(`Found ${properties.length} properties.`);

  for (const prop of properties) {
    console.log(`\nProperty: "${prop.title}" (${prop.language}) - ID: ${prop._id}`);
    if (!prop.gallery || prop.gallery.length === 0) {
      console.log("  No gallery items found.");
      continue;
    }

    console.log(`  Gallery has ${prop.gallery.length} top-level entries:`);
    prop.gallery.forEach((g, idx) => {
      if (g._type === 'galleryGroup') {
        console.log(`    - Group [${idx}]: "${g.title}" containing ${g.items?.length || 0} items`);
        g.items?.forEach((item, itemIdx) => {
          console.log(`      * Item [${itemIdx}]: type="${item._type}"`);
        });
      } else {
        console.log(`    - Individual Item [${idx}]: type="${g._type}"`);
      }
    });
  }
}

run().catch(console.error);
