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
  console.log("Fetching reference property...");
  
  // Query for properties with slug containing the reference ID
  const properties = await client.fetch(`*[_type == "property" && slug.current match "*1778026881956*"] {
    _id,
    title,
    language,
    "slug": slug.current,
    gallery
  }`);
  
  console.log(`Found ${properties.length} matching properties.`);
  
  for (const prop of properties) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Property: "${prop.title}" (${prop.language})`);
    console.log(`ID: ${prop._id}`);
    console.log(`Slug: ${prop.slug}`);
    console.log(`${'='.repeat(80)}`);
    
    if (!prop.gallery || prop.gallery.length === 0) {
      console.log("  No gallery items found.");
      continue;
    }

    console.log(`\nGallery structure (${prop.gallery.length} top-level entries):\n`);
    
    prop.gallery.forEach((g, idx) => {
      if (g._type === 'galleryGroup') {
        console.log(`[${idx}] Gallery Group: "${g.title}"`);
        console.log(`    Type: ${g._type}`);
        console.log(`    Items: ${g.items?.length || 0}`);
        
        if (g.items && g.items.length > 0) {
          g.items.forEach((item, itemIdx) => {
            console.log(`    [${itemIdx}] Item type: ${item._type}`);
            if (item._type === 'virtualTour') {
              console.log(`        Virtual Tour URL: ${item.url || 'N/A'}`);
              console.log(`        Full item:`, JSON.stringify(item, null, 2));
            } else if (item._type === 'propertyImage') {
              console.log(`        Image asset: ${item.asset?._ref || 'N/A'}`);
            }
          });
        }
      } else {
        console.log(`[${idx}] Individual Item: type="${g._type}"`);
        if (g._type === 'virtualTour') {
          console.log(`    Virtual Tour URL: ${g.url || 'N/A'}`);
          console.log(`    Full item:`, JSON.stringify(g, null, 2));
        }
      }
    });
    
    console.log(`\n${'='.repeat(80)}\n`);
  }
}

run().catch(console.error);