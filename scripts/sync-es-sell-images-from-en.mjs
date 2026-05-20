import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-05-02',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function syncImages() {
  const enId = "53781b2c-7966-4bca-a12d-ca847d3b6943";
  const esIds = ["page-es-sell", "drafts.page-es-sell"];

  console.log('Fetching English sell page...');
  const enPage = await client.fetch(`*[_id == $id][0] { _id, title, sections }`, { id: enId });
  if (!enPage) {
    console.error('❌ English page not found.');
    return;
  }

  const enSection = enPage.sections?.find(s => s._type === 'sellProcessSection');
  if (!enSection || !enSection.steps) {
    console.error('❌ sellProcessSection steps not found on English sell page.');
    return;
  }

  console.log('✅ Found English sellProcessSection steps.');

  // Create a map of step number to image reference
  const imageMap = {};
  enSection.steps.forEach(step => {
    if (step.number && step.image) {
      imageMap[step.number] = step.image;
    }
  });

  console.log('English Step Images mapped:', Object.keys(imageMap));

  for (const esId of esIds) {
    console.log(`\nFetching Spanish page with ID: ${esId}...`);
    const esPage = await client.fetch(`*[_id == $id][0] { _id, title, sections }`, { id: esId });
    if (!esPage) {
      console.log(`⚠️ Spanish page with ID: ${esId} not found.`);
      continue;
    }

    if (!esPage.sections) {
      console.log(`⚠️ No sections found in page ${esId}.`);
      continue;
    }

    let updated = false;
    const updatedSections = esPage.sections.map(section => {
      if (section._type === 'sellProcessSection' && section.steps) {
        const updatedSteps = section.steps.map(step => {
          const matchingImage = imageMap[step.number];
          if (matchingImage) {
            console.log(`  Updating step ${step.number} ("${step.title}") with image:`, matchingImage.asset._ref);
            updated = true;
            return {
              ...step,
              image: matchingImage
            };
          }
          return step;
        });
        return {
          ...section,
          steps: updatedSteps
        };
      }
      return section;
    });

    if (updated) {
      console.log(`💾 Patching Spanish page (${esId}) in Sanity...`);
      await client.patch(esPage._id)
        .set({ sections: updatedSections })
        .commit();
      console.log(`✅ Page ${esId} updated successfully.`);
    } else {
      console.log(`ℹ️ No updates needed for page ${esId}.`);
    }
  }

  console.log('\n🎉 Image synchronization complete!');
}

syncImages().catch(console.error);
