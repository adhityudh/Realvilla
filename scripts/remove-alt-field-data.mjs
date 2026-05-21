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
  console.log("Removing alt field data from all properties...\n");
  
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
    
    if (!prop.gallery || prop.gallery.length === 0) {
      console.log('  ✓ No gallery - skipping');
      skippedCount++;
      continue;
    }
    
    let hasAltField = false;
    
    // Check if any items have alt field
    for (const group of prop.gallery) {
      if (group._type === 'galleryGroup' && group.items) {
        for (const item of group.items) {
          if (item.alt !== undefined) {
            hasAltField = true;
            break;
          }
        }
      }
      if (hasAltField) break;
    }
    
    if (!hasAltField) {
      console.log('  ✓ No alt fields found - skipping');
      skippedCount++;
      continue;
    }
    
    // Remove alt field from all items
    const updatedGallery = prop.gallery.map(group => {
      if (group._type === 'galleryGroup' && group.items) {
        return {
          ...group,
          items: group.items.map(item => {
            // Remove alt field if it exists
            const { alt, ...itemWithoutAlt } = item;
            return itemWithoutAlt;
          })
        };
      }
      return group;
    });
    
    try {
      // Update the property in Sanity
      await client
        .patch(prop._id)
        .set({ gallery: updatedGallery })
        .commit();
      
      console.log(`  ✓ Removed alt field data successfully`);
      updatedCount++;
    } catch (error) {
      console.error(`  ✗ Error updating property: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('CLEANUP SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total properties: ${properties.length}`);
  console.log(`Updated (removed alt data): ${updatedCount}`);
  console.log(`Skipped (no alt data): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(80));
}

run().catch(console.error);