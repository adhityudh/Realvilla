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
  console.log("Fetching reference property with full gallery details...");
  
  const properties = await client.fetch(`*[_type == "property" && slug.current match "*1778026881956*"] {
    _id,
    title,
    language,
    "slug": slug.current,
    gallery
  }`);
  
  console.log(`Found ${properties.length} matching properties.\n`);
  
  for (const prop of properties) {
    console.log(`${'='.repeat(80)}`);
    console.log(`Property: "${prop.title}" (${prop.language})`);
    console.log(`ID: ${prop._id}`);
    console.log(`${'='.repeat(80)}\n`);
    
    if (!prop.gallery || prop.gallery.length === 0) {
      console.log("No gallery items found.\n");
      continue;
    }

    // Find Virtual Tour group
    const virtualTourGroup = prop.gallery.find(g => 
      g._type === 'galleryGroup' && 
      (g.title === 'Virtual Tour' || g.title === 'Visitas virtuales')
    );
    
    if (virtualTourGroup) {
      console.log('VIRTUAL TOUR GROUP FOUND:');
      console.log(JSON.stringify(virtualTourGroup, null, 2));
      console.log('\n');
    } else {
      console.log('NO VIRTUAL TOUR GROUP FOUND\n');
    }
    
    console.log('FULL GALLERY STRUCTURE:');
    console.log(JSON.stringify(prop.gallery, null, 2));
    console.log('\n');
  }
}

run().catch(console.error);