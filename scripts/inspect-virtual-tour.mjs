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
  console.log("Fetching property-1-1778026881956...");
  
  // Query the specific property
  const properties = await client.fetch(`*[_type == "property" && _id match "*1778026881956*"] { 
    _id, 
    title, 
    language, 
    gallery 
  }`);
  
  if (properties.length === 0) {
    console.log("Property not found. Searching all properties for virtual tours...");
    const allProps = await client.fetch(`*[_type == "property"] { 
      _id, 
      title, 
      language, 
      gallery 
    }`);
    
    console.log(`\nFound ${allProps.length} total properties.`);
    console.log("\nProperties with virtual tours:");
    
    for (const prop of allProps) {
      const hasVirtualTour = prop.gallery?.some(g => 
        g._type === 'galleryGroup' && g.mediaType === 'virtualTour'
      );
      
      if (hasVirtualTour) {
        console.log(`\n✓ Property: "${prop.title}" (${prop.language}) - ID: ${prop._id}`);
        const virtualTours = prop.gallery.filter(g => 
          g._type === 'galleryGroup' && g.mediaType === 'virtualTour'
        );
        
        virtualTours.forEach((vt, idx) => {
          console.log(`  Virtual Tour ${idx + 1}:`);
          console.log(`    Title: ${vt.title}`);
          console.log(`    Floorfy URL: ${vt.floorfyUrl}`);
          console.log(`    Has Thumbnail: ${vt.thumbnail ? 'Yes' : 'No'}`);
          if (vt.thumbnail) {
            console.log(`    Thumbnail Asset ID: ${vt.thumbnail.asset?._ref || vt.thumbnail.asset?._id || 'N/A'}`);
          }
        });
      }
    }
    
    console.log("\n\nProperties WITHOUT virtual tours:");
    for (const prop of allProps) {
      const hasVirtualTour = prop.gallery?.some(g => 
        g._type === 'galleryGroup' && g.mediaType === 'virtualTour'
      );
      
      if (!hasVirtualTour) {
        console.log(`  ✗ "${prop.title}" (${prop.language}) - ID: ${prop._id}`);
      }
    }
    
    return;
  }
  
  console.log(`\nFound ${properties.length} matching properties:`);
  
  for (const prop of properties) {
    console.log(`\n=== Property: "${prop.title}" (${prop.language}) - ID: ${prop._id} ===`);
    
    if (!prop.gallery || prop.gallery.length === 0) {
      console.log("  No gallery items found.");
      continue;
    }
    
    console.log(`\nGallery structure (${prop.gallery.length} groups):`);
    prop.gallery.forEach((g, idx) => {
      if (g._type === 'galleryGroup') {
        console.log(`\n  Group ${idx + 1}: "${g.title}"`);
        console.log(`    Media Type: ${g.mediaType}`);
        
        if (g.mediaType === 'virtualTour') {
          console.log(`    Floorfy URL: ${g.floorfyUrl}`);
          console.log(`    Has Thumbnail: ${g.thumbnail ? 'Yes' : 'No'}`);
          if (g.thumbnail) {
            console.log(`    Thumbnail Asset: ${JSON.stringify(g.thumbnail, null, 2)}`);
          }
        } else {
          console.log(`    Items: ${g.items?.length || 0}`);
        }
      }
    });
  }
}

run().catch(console.error);