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

async function migrate() {
  console.log('Fetching homepage data...');
  const homePage = await client.fetch(`*[_type == "page" && slug.current == "home"][0]`);
  
  if (!homePage) {
    console.error('Home page not found!');
    return;
  }

  const propSectionIndex = homePage.sections.findIndex(s => s._type === 'propertiesSection');
  if (propSectionIndex === -1) {
    console.error('Properties section not found on home page!');
    return;
  }

  const section = homePage.sections[propSectionIndex];
  
  // If it still has the old 'properties' array, migrate them
  if (section.properties && section.properties.length > 0) {
    console.log(`Migrating ${section.properties.length} inline properties to documents...`);
    
    for (const prop of section.properties) {
      const doc = {
        _type: 'property',
        address: prop.address,
        price: prop.price,
        beds: prop.beds,
        baths: prop.baths,
        sqft: prop.sqft,
        image: prop.image,
        secondaryImage: prop.secondaryImage,
        status: 'for-sale',
        featured: false,
      };
      
      // We use the address as a hint for the ID to avoid duplicates if re-run
      const id = `property-${prop.address.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      await client.createOrReplace({ _id: id, ...doc });
      console.log(`Created property: ${prop.address}`);
    }

    // Now update the homepage section to use dynamic mode
    // We only touch the propertiesSection, leaving other sections untouched
    const updatedSections = [...homePage.sections];
    updatedSections[propSectionIndex] = {
      ...section,
      selectionType: 'dynamic',
      limit: 3,
      orderBy: '_createdAt desc',
      showSold: false,
    };
    // Remove the old inline properties array
    delete updatedSections[propSectionIndex].properties;

    await client.patch(homePage._id)
      .set({ sections: updatedSections })
      .commit();
    
    console.log('Homepage updated successfully!');
  } else {
    console.log('No inline properties found to migrate or already migrated.');
  }
}

migrate().catch(console.error);
