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
  try {
    console.log('Cleaning up explicitly tagged previous test data and their translation linkages...');
    const badMatches = await client.fetch(`*[(_type == "property" && title match "*[SOLD]*") || (_type == "property" && title match "*[VENDIDA]*")]._id`);
    
    if (badMatches.length > 0) {
      const referencers = await client.fetch(`*[_type == "translation.metadata" && references($ids)]._id`, { ids: badMatches });
      const allToDelete = [...referencers, ...badMatches];
      console.log(`Deleting ${allToDelete.length} related records to purge older stale tests...`);
      for (const id of allToDelete) {
        await client.delete(id).catch(e => console.warn("Couldn't delete node:", id));
      }
    }

    console.log('Fetching 4 unique existing properties as templates...');
    const existingList = await client.fetch(`*[_type == "property" && language == "en"][0...4]`);
    
    if (!existingList || existingList.length < 1) {
      console.error("No base documents available for reference cloning.");
      return;
    }

    for (let i = 0; i < Math.min(4, existingList.length); i++) {
      const base = existingList[i];
      const time = Date.now() + i;
      const newId = `sold-property-${time}`;
      const newSlug = `sold-estate-${time}`;
      
      const { _id, _createdAt, _updatedAt, _rev, featured, ...cleanBase } = base;
      
      // English variation
      const propertyEn = {
        ...cleanBase,
        _id: newId,
        slug: { _type: 'slug', current: newSlug },
        status: 'sold',
        language: 'en'
      };

      // Spanish variation
      const propertyEs = {
        ...propertyEn,
        _id: `${newId}-es`,
        language: 'es'
      };

      console.log(`Creating entry pair ${i+1} of 4...`);
      await client.createIfNotExists(propertyEn);
      await client.createIfNotExists(propertyEs);

      // Link them
      await client.create({
        _type: 'translation.metadata',
        translations: [
          { _key: 'en', _type: 'internationalizedArrayReferenceValue', language: 'en', value: { _type: 'reference', _ref: propertyEn._id } },
          { _key: 'es', _type: 'internationalizedArrayReferenceValue', language: 'es', value: { _type: 'reference', _ref: propertyEs._id } }
        ]
      });
    }

    console.log(`✅ Successfully seeded 4 fresh Sold items dynamically!`);
  } catch (err) {
    console.error("Bulk creation failed:", err);
  }
}

run();
