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
  console.log("Verifying Virtual Tour migration...\n");
  
  const properties = await client.fetch(`*[_type == "property"] {
    _id,
    title,
    language,
    "slug": slug.current,
    gallery
  }`);
  
  console.log(`Total properties: ${properties.length}\n`);
  
  let withVirtualTour = 0;
  let withoutVirtualTour = 0;
  const propertiesWithoutVT = [];
  
  for (const prop of properties) {
    const virtualTourGroup = prop.gallery?.find(g => 
      g._type === 'galleryGroup' && g.mediaType === 'virtualTour'
    );
    
    if (virtualTourGroup) {
      withVirtualTour++;
      
      // Verify structure
      const hasCorrectTitle = virtualTourGroup.title === 'Virtual Tour' || 
                              virtualTourGroup.title === 'Visitas virtuales';
      const hasFloorfyUrl = !!virtualTourGroup.floorfyUrl;
      const hasThumbnail = !!virtualTourGroup.thumbnail?.asset?._ref;
      
      if (!hasCorrectTitle || !hasFloorfyUrl || !hasThumbnail) {
        console.log(`⚠️  Property "${prop.title}" (${prop.language}) has incomplete Virtual Tour:`);
        console.log(`    Title: ${virtualTourGroup.title}`);
        console.log(`    Has floorfyUrl: ${hasFloorfyUrl}`);
        console.log(`    Has thumbnail: ${hasThumbnail}\n`);
      }
    } else {
      withoutVirtualTour++;
      propertiesWithoutVT.push(`${prop.title} (${prop.language}) - ID: ${prop._id}`);
    }
  }
  
  console.log('='.repeat(80));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total properties: ${properties.length}`);
  console.log(`✓ With Virtual Tour: ${withVirtualTour}`);
  console.log(`✗ Without Virtual Tour: ${withoutVirtualTour}`);
  
  if (withoutVirtualTour > 0) {
    console.log('\nProperties missing Virtual Tour:');
    propertiesWithoutVT.forEach(p => console.log(`  - ${p}`));
  }
  
  console.log('='.repeat(80));
  
  // Sample a few properties to show their Virtual Tour structure
  console.log('\nSample Virtual Tour structures:\n');
  
  const samples = properties.slice(0, 3);
  for (const prop of samples) {
    const vtGroup = prop.gallery?.find(g => 
      g._type === 'galleryGroup' && g.mediaType === 'virtualTour'
    );
    
    if (vtGroup) {
      console.log(`Property: "${prop.title}" (${prop.language})`);
      console.log(`Virtual Tour Group:`);
      console.log(JSON.stringify(vtGroup, null, 2));
      console.log('\n');
    }
  }
}

run().catch(console.error);