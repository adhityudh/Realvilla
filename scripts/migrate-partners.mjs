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

async function migratePartners() {
  console.log('Fetching homepage data...');
  const homePage = await client.fetch(`*[_type == "page" && slug.current == "home"][0]`);
  
  if (!homePage) {
    console.error('Home page not found!');
    return;
  }

  const partnerIndex = homePage.sections.findIndex(s => s._type === 'partnerSection');
  if (partnerIndex === -1) {
    console.error('Partner section not found!');
    return;
  }

  const currentSection = homePage.sections[partnerIndex];
  
  // Check if partners are still in the old format (array of images/references)
  if (!currentSection.partners || currentSection.partners.length === 0) {
    console.log('No partners to migrate.');
    return;
  }

  const firstPartner = currentSection.partners[0];
  if (firstPartner.logo) {
    console.log('Partners already in new format. Skipping migration.');
    return;
  }

  console.log('Migrating partners to new format...');
  const migratedPartners = currentSection.partners.map((p, i) => {
    // p is an image object with asset reference
    return {
      _key: p._key || `partner-${i}`,
      name: `Partner ${i + 1}`,
      logo: p, // The old image object becomes the logo field
      linkType: 'none'
    };
  });

  const updatedSections = [...homePage.sections];
  updatedSections[partnerIndex] = {
    ...currentSection,
    partners: migratedPartners
  };

  await client.patch(homePage._id)
    .set({ sections: updatedSections })
    .commit();

  console.log('Partner migration complete!');
}

migratePartners().catch(console.error);
