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

// Generate a random key for Sanity
function generateKey() {
  return Math.random().toString(36).substring(2, 15);
}

// Reference property thumbnail asset
const THUMBNAIL_ASSET_REF = 'image-0d567cb3c66c80adae84ab53c955f0781e5fc409-1600x1061-jpg';
const FLOORFY_URL = 'https://floorfy.com/es/tour/2595232';

async function run() {
  console.log("Fetching all properties from Sanity...");
  
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
    console.log(`\nProcessing: "${prop.title}" (${prop.language}) - ID: ${prop._id}`);
    
    // Check if property already has a Virtual Tour group
    const hasVirtualTour = prop.gallery?.some(g => 
      g._type === 'galleryGroup' && g.mediaType === 'virtualTour'
    );
    
    if (hasVirtualTour) {
      console.log('  ✓ Already has Virtual Tour group - skipping');
      skippedCount++;
      continue;
    }
    
    // Determine title based on language
    const virtualTourTitle = prop.language === 'es' ? 'Visitas virtuales' : 'Virtual Tour';
    
    // Create the Virtual Tour group structure
    const virtualTourGroup = {
      _key: generateKey(),
      _type: 'galleryGroup',
      floorfyUrl: FLOORFY_URL,
      mediaType: 'virtualTour',
      thumbnail: {
        _type: 'image',
        asset: {
          _ref: THUMBNAIL_ASSET_REF,
          _type: 'reference'
        }
      },
      title: virtualTourTitle
    };
    
    // Get existing gallery or initialize empty array
    const currentGallery = prop.gallery || [];
    
    // Add Virtual Tour group to the end of the gallery
    const updatedGallery = [...currentGallery, virtualTourGroup];
    
    try {
      // Update the property in Sanity
      await client
        .patch(prop._id)
        .set({ gallery: updatedGallery })
        .commit();
      
      console.log(`  ✓ Added Virtual Tour group successfully`);
      updatedCount++;
    } catch (error) {
      console.error(`  ✗ Error updating property: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total properties: ${properties.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped (already had Virtual Tour): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(80));
}

run().catch(console.error);