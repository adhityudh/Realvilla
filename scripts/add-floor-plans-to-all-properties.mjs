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

// Available images to use for floor plans
const FLOOR_PLAN_IMAGES = [
  'image-0d567cb3c66c80adae84ab53c955f0781e5fc409-1600x1061-jpg',
  'image-00290d41c87ba4aa7bc306ec32fa83e9a2add449-2268x3024-jpg',
  'image-05796d9d872ef29c36f1b1520acb159bbd49a2f9-2252x3998-jpg',
  'image-157b62c189c386ae6d227d83ebcafc0d1b684f33-1240x1488-webp',
  'image-008977d04021a39c47954030834bf4f20cc2cac2-2048x2048-webp',
  'image-0307888f2bf9dd204fbfc334d9b59bbb17f0c071-2048x2048-webp',
];

// Floor plan descriptions for English
const FLOOR_PLAN_DESCRIPTIONS_EN = [
  { alt: 'Ground Floor Layout', caption: 'Ground floor plan showing main living areas, kitchen, and guest facilities' },
  { alt: 'First Floor Plan', caption: 'First floor layout featuring master bedroom suite and additional bedrooms' },
  { alt: 'Basement Level', caption: 'Lower level floor plan with entertainment area and storage spaces' },
  { alt: 'Roof Terrace Plan', caption: 'Rooftop layout showcasing outdoor living and panoramic view areas' },
];

// Floor plan descriptions for Spanish
const FLOOR_PLAN_DESCRIPTIONS_ES = [
  { alt: 'Planta Baja', caption: 'Plano de planta baja mostrando áreas de estar principales, cocina e instalaciones para invitados' },
  { alt: 'Primera Planta', caption: 'Distribución de la primera planta con suite principal y dormitorios adicionales' },
  { alt: 'Nivel Sótano', caption: 'Plano del nivel inferior con área de entretenimiento y espacios de almacenamiento' },
  { alt: 'Planta Azotea', caption: 'Distribución de la azotea mostrando áreas de estar al aire libre y vistas panorámicas' },
];

// Get random items from array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

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
    
    // Check if property already has a Floor plans group
    const hasFloorPlans = prop.gallery?.some(g => 
      g._type === 'galleryGroup' && 
      (g.title === 'Floor plans' || g.title === 'Planos')
    );
    
    if (hasFloorPlans) {
      console.log('  ✓ Already has Floor plans group - skipping');
      skippedCount++;
      continue;
    }
    
    // Determine title and descriptions based on language
    const isSpanish = prop.language === 'es';
    const floorPlansTitle = isSpanish ? 'Planos' : 'Floor plans';
    const descriptions = isSpanish ? FLOOR_PLAN_DESCRIPTIONS_ES : FLOOR_PLAN_DESCRIPTIONS_EN;
    
    // Get 2-3 random images for floor plans
    const numImages = Math.floor(Math.random() * 2) + 2; // 2 or 3 images
    const selectedImages = getRandomItems(FLOOR_PLAN_IMAGES, numImages);
    const selectedDescriptions = getRandomItems(descriptions, numImages);
    
    // Create floor plan items
    const floorPlanItems = selectedImages.map((imageRef, idx) => ({
      _key: generateKey(),
      _type: 'image',
      alt: selectedDescriptions[idx].alt,
      caption: selectedDescriptions[idx].caption,
      asset: {
        _ref: imageRef,
        _type: 'reference'
      }
    }));
    
    // Create the Floor plans group structure
    const floorPlansGroup = {
      _key: generateKey(),
      _type: 'galleryGroup',
      items: floorPlanItems,
      mediaType: 'regular',
      title: floorPlansTitle
    };
    
    // Get existing gallery or initialize empty array
    const currentGallery = prop.gallery || [];
    
    // Add Floor plans group to the end of the gallery
    const updatedGallery = [...currentGallery, floorPlansGroup];
    
    try {
      // Update the property in Sanity
      await client
        .patch(prop._id)
        .set({ gallery: updatedGallery })
        .commit();
      
      console.log(`  ✓ Added Floor plans group with ${numImages} images`);
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
  console.log(`Skipped (already had Floor plans): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(80));
}

run().catch(console.error);