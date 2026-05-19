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

function migrateObject(obj, path = '') {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item, idx) => migrateObject(item, `${path}[${idx}]`));
  }

  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = migrateObject(val, `${path}.${key}`);
  }

  // Check for linkType/externalLink pattern
  if (result.linkType === 'external' && typeof result.externalLink === 'string' && result.externalLink.startsWith('#')) {
    const oldVal = result.externalLink;
    result.linkType = 'section';
    result.sectionLink = oldVal;
    delete result.externalLink;
    console.log(`  [MIGRATED] ${path} -> linkType: "section", sectionLink: "${oldVal}"`);
  }

  // Check for secondaryLinkType/secondaryExternalLink pattern
  if (result.secondaryLinkType === 'external' && typeof result.secondaryExternalLink === 'string' && result.secondaryExternalLink.startsWith('#')) {
    const oldVal = result.secondaryExternalLink;
    result.secondaryLinkType = 'section';
    result.secondarySectionLink = oldVal;
    delete result.secondaryExternalLink;
    console.log(`  [MIGRATED] ${path} -> secondaryLinkType: "section", secondarySectionLink: "${oldVal}"`);
  }

  return result;
}

async function run() {
  console.log('Fetching all page documents...');
  const pages = await client.fetch(`*[_type == "page"]`);
  console.log(`Found ${pages.length} pages.`);

  for (const page of pages) {
    console.log(`Processing page: [${page.language || 'en'}] ${page.title} (ID: ${page._id})`);
    
    let hasChanges = false;
    const originalSections = JSON.stringify(page.sections || []);
    const migratedSections = migrateObject(page.sections || [], 'sections');

    if (JSON.stringify(migratedSections) !== originalSections) {
      hasChanges = true;
    }

    if (hasChanges) {
      console.log(`Saving changes for page: ${page.title}...`);
      await client
        .patch(page._id)
        .set({ sections: migratedSections })
        .commit();
      console.log(`Saved successfully.`);
    } else {
      console.log(`No same page navigation found to migrate for this page.`);
    }
    console.log('----------------------------------------------------');
  }

  console.log('Migration finished successfully!');
}

run().catch(console.error);
