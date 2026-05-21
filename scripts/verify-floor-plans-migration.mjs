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
  console.log("Verifying Floor plans migration...\n");
  
  const properties = await client.fetch(`*[_type == "property"] {
    _id,
    title,
    language,
    "slug": slug.current,
    gallery
  }`);
  
  console.log(`Total properties: ${properties.length}\n`);
  
  let withFloorPlans = 0;
  let withoutFloorPlans = 0;
  let withIncompleteData = 0;
  const propertiesWithoutFP = [];
  const propertiesWithIncomplete = [];
  
  for (const prop of properties) {
    const floorPlansGroup = prop.gallery?.find(g => 
      g._type === 'galleryGroup' && 
      (g.title === 'Floor plans' || g.title === 'Planos')
    );
    
    if (floorPlansGroup) {
      withFloorPlans++;
      
      // Verify structure
      const hasCorrectTitle = floorPlansGroup.title === 'Floor plans' || 
                              floorPlansGroup.title === 'Planos';
      const hasItems = floorPlansGroup.items && floorPlansGroup.items.length > 0;
      
      // Check if all items have alt and caption
      let allItemsComplete = true;
      if (hasItems) {
        for (const item of floorPlansGroup.items) {
          if (!item.alt || !item.caption) {
            allItemsComplete = false;
            break;
          }
        }
      }
      
      if (!hasCorrectTitle || !hasItems || !allItemsComplete) {
        withIncompleteData++;
        propertiesWithIncomplete.push({
          id: prop._id,
          title: prop.title,
          language: prop.language,
          issues: {
            hasCorrectTitle,
            hasItems,
            allItemsComplete,
            itemCount: floorPlansGroup.items?.length || 0
          }
        });
      }
    } else {
      withoutFloorPlans++;
      propertiesWithoutFP.push(`${prop.title} (${prop.language}) - ID: ${prop._id}`);
    }
  }
  
  console.log('='.repeat(80));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total properties: ${properties.length}`);
  console.log(`✓ With Floor plans: ${withFloorPlans}`);
  console.log(`✗ Without Floor plans: ${withoutFloorPlans}`);
  console.log(`⚠️  With incomplete data: ${withIncompleteData}`);
  
  if (withoutFloorPlans > 0) {
    console.log('\nProperties missing Floor plans:');
    propertiesWithoutFP.forEach(p => console.log(`  - ${p}`));
  }
  
  if (withIncompleteData > 0) {
    console.log('\nProperties with incomplete Floor plans data:');
    propertiesWithIncomplete.forEach(p => {
      console.log(`  - ${p.title} (${p.language})`);
      console.log(`    Issues: ${JSON.stringify(p.issues, null, 2)}`);
    });
  }
  
  console.log('='.repeat(80));
  
  // Sample a few properties to show their Floor plans structure
  console.log('\nSample Floor plans structures:\n');
  
  const samples = properties.slice(0, 2);
  for (const prop of samples) {
    const fpGroup = prop.gallery?.find(g => 
      g._type === 'galleryGroup' && 
      (g.title === 'Floor plans' || g.title === 'Planos')
    );
    
    if (fpGroup) {
      console.log(`Property: "${prop.title}" (${prop.language})`);
      console.log(`Floor plans Group:`);
      console.log(JSON.stringify(fpGroup, null, 2));
      console.log('\n');
    }
  }
}

run().catch(console.error);