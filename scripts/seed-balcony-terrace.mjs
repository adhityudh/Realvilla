import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, 
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function run() {
  console.log('🚀 Starting Balcony and Terrace seeding and property mapping...');

  // 1. Fetch the parent "Balcony and terrace" meta document
  const parentId = '126bf3ea-ff93-4bc3-b57f-d9b955e7e21e';
  const parentMeta = await client.fetch(`*[_id == $id || _id == "drafts." + $id][0]`, { id: parentId });

  if (!parentMeta) {
    console.error('❌ Parent metadata "Balcony and terrace" not found in Sanity!');
    return;
  }
  console.log('Found Parent Meta:', parentMeta.shortLabel?.en);

  const categoryRef = parentMeta.category;
  console.log('Parent Category Ref:', categoryRef);

  // 2. Define Child Metas: Balcony and Terrace
  const balconyId = 'property-meta-balcony';
  const terraceId = 'property-meta-terrace';

  const balconyDoc = {
    _type: 'propertyMeta',
    _id: balconyId,
    shortLabel: { en: 'Balcony', es: 'Balcón' },
    longLabel: { en: 'Balcony', es: 'Balcón' },
    valueType: 'boolean',
    category: categoryRef,
    filter: {
      isFilterable: true,
      filterType: 'checkbox',
      filterOrder: 15,
    }
  };

  const terraceDoc = {
    _type: 'propertyMeta',
    _id: terraceId,
    shortLabel: { en: 'Terrace', es: 'Terraza' },
    longLabel: { en: 'Terrace', es: 'Terraza' },
    valueType: 'boolean',
    category: categoryRef,
    filter: {
      isFilterable: true,
      filterType: 'checkbox',
      filterOrder: 16,
    }
  };

  console.log('Creating/updating "Balcony" metadata definition...');
  await client.createOrReplace(balconyDoc);

  console.log('Creating/updating "Terrace" metadata definition...');
  await client.createOrReplace(terraceDoc);

  // 3. Link children to parent
  console.log('Linking children to "Balcony and terrace" parent meta...');
  await client
    .patch(parentId)
    .set({
      children: [
        { _type: 'reference', _ref: balconyId, _key: 'balcony-ref' },
        { _type: 'reference', _ref: terraceId, _key: 'terrace-ref' },
      ],
      // Ensure parent itself is filterable and configured as checkbox for grouping
      filter: {
        isFilterable: true,
        filterType: 'checkbox',
        filterOrder: 14,
      }
    })
    .commit();
  console.log('Parent updated successfully.');

  // Check if drafts exist and update it too
  const draftParent = await client.fetch(`*[_id == "drafts." + $id][0]`, { id: parentId });
  if (draftParent) {
    console.log('Updating parent draft document as well...');
    await client
      .patch(`drafts.${parentId}`)
      .set({
        children: [
          { _type: 'reference', _ref: balconyId, _key: 'balcony-ref' },
          { _type: 'reference', _ref: terraceId, _key: 'terrace-ref' },
        ],
        filter: {
          isFilterable: true,
          filterType: 'checkbox',
          filterOrder: 14,
        }
      })
      .commit();
  }

  // 4. Fetch all properties
  console.log('Fetching properties...');
  const properties = await client.fetch(`*[_type == "property"] {
    _id,
    title,
    meta
  }`);
  console.log(`Found ${properties.length} properties.`);

  // Group properties by their base ID (stripping drafts. and -es)
  const groups = {};
  properties.forEach(prop => {
    const cleanId = prop._id.replace('drafts.', '').replace('-es', '');
    if (!groups[cleanId]) {
      groups[cleanId] = [];
    }
    groups[cleanId].push(prop);
  });

  console.log(`Grouped properties into ${Object.keys(groups).length} unique listings.`);

  // 5. Randomly assign balcony/terrace to each group
  for (const baseId of Object.keys(groups)) {
    const groupProps = groups[baseId];
    
    // Choose randomly:
    // Option 0: Both true
    // Option 1: Balcony only
    // Option 2: Terrace only
    // Option 3: Neither
    const rand = Math.floor(Math.random() * 4);
    const hasBalcony = rand === 0 || rand === 1;
    const hasTerrace = rand === 0 || rand === 2;

    const title = groupProps[0].title;
    console.log(`\nProperty Group: "${title}" (base: ${baseId})`);
    console.log(`  Decided values: Balcony=${hasBalcony}, Terrace=${hasTerrace}`);

    for (const prop of groupProps) {
      console.log(`  Updating property ${prop._id}...`);
      let currentMeta = prop.meta || [];

      // Remove any existing reference to the parent "Balcony and terrace" meta
      currentMeta = currentMeta.filter(m => m.metaKey?._ref !== parentId);

      // Remove any existing references to Balcony and Terrace to avoid duplicates
      currentMeta = currentMeta.filter(m => m.metaKey?._ref !== balconyId && m.metaKey?._ref !== terraceId);

      // Add Balcony meta
      currentMeta.push({
        _key: `meta-balcony-${prop._id}`,
        metaKey: { _type: 'reference', _ref: balconyId },
        booleanValue: hasBalcony
      });

      // Add Terrace meta
      currentMeta.push({
        _key: `meta-terrace-${prop._id}`,
        metaKey: { _type: 'reference', _ref: terraceId },
        booleanValue: hasTerrace
      });

      // Commit the updated meta
      await client
        .patch(prop._id)
        .set({ meta: currentMeta })
        .commit();
      console.log(`    Updated meta successfully.`);
    }
  }

  console.log('\n🎉 Seeding completed successfully!');
}

run().catch(console.error);
