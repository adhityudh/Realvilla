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
  console.log("Updating Floor plans captions to match alt text...\n");
  
  const properties = await client.fetch(`*[_type == "property"] {
    _id,
    title,
    language,
    "slug": slug.current,
    gallery
  }`);
  
  console.log(`Found ${properties.length} properties.\n`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const prop of properties) {
    console.log(`Processing: "${prop.title}" (${prop.language}) - ID: ${prop._id}`);
    
    // Find Floor plans group
    const floorPlansGroupIndex = prop.gallery?.findIndex(g => 
      g._type === 'galleryGroup' && 
      (g.title === 'Floor plans' || g.title === 'Planos')
    );
    
    if (floorPlansGroupIndex === -1 || floorPlansGroupIndex === undefined) {
      console.log('  ✗ No Floor plans group found - skipping');
      skippedCount++;
      continue;
    }
    
    const floorPlansGroup = prop.gallery[floorPlansGroupIndex];
    
    // Check if captions need updating
    let needsUpdate = false;
    const updatedItems = floorPlansGroup.items?.map(item => {
      if (item.alt && item.caption !== item.alt) {
        needsUpdate = true;
        return {
          ...item,
          caption: item.alt
        };
      }
      return item;
    });
    
    if (!needsUpdate) {
      console.log('  ✓ Captions already match alt text - skipping');
      skippedCount++;
      continue;
    }
    
    // Update the Floor plans group with new captions
    const updatedGallery = [...prop.gallery];
    updatedGallery[floorPlansGroupIndex] = {
      ...floorPlansGroup,
      items: updatedItems
    };
    
    try {
      // Update the property in Sanity
      await client
        .patch(prop._id)
        .set({ gallery: updatedGallery })
        .commit();
      
      console.log(`  ✓ Updated ${updatedItems.length} captions to match alt text`);
      updatedCount++;
    } catch (error) {
      console.error(`  ✗ Error updating property: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('UPDATE SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total properties: ${properties.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped (no changes needed): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(80));
}

run().catch(console.error);