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

async function cleanup() {
  console.log('💣 BEGINNING FINAL CLEANUP OPERATION...');

  // 1. Locate the Legacy Meta Document
  const legacyDoc = await client.fetch(`*[_type == "propertyMeta" && (shortLabel.en == "Type" || longLabel.en == "Property Type")][0]`);
  
  if (!legacyDoc) {
    console.log('✅ Legacy "Property Type" definition already gone! Done.');
    return;
  }
  
  const targetId = legacyDoc._id.replace('drafts.', '');
  console.log(`🔍 Found Legacy Document: ${legacyDoc._id} (${targetId}).`);

  // 2. Scour all properties and UNSET that entry from their meta arrays
  console.log('🧹 Scrubbing meta arrays across all properties...');
  const props = await client.fetch(`*[_type == "property" && count(meta[metaKey._ref match $targetId]) > 0] { _id, title }`, { targetId: `*${targetId}*` });
  
  console.log(`📋 Found ${props.length} properties containing references to the legacy meta.`);

  for (const p of props) {
    console.log(`   -> Unsetting from [${p.title || p._id}]`);
    // Use complex patch with unset that targeting specific keys is tricky in API,
    // easier to fetch the full array, filter it, and set it back.
    const fullDoc = await client.getDocument(p._id);
    const filteredMeta = (fullDoc.meta || []).filter(m => !m.metaKey || !m.metaKey._ref.includes(targetId));
    
    await client
      .patch(p._id)
      .set({ meta: filteredMeta })
      .commit();
  }

  // 2b. Also scrub "page" sections that use this as a quickFilterMeta reference
  console.log('🧹 Scrubbing pages utilizing this meta as a quickFilter chip group...');
  const pages = await client.fetch(`*[_type == "page" && count(sections[quickFilterMeta._ref match $targetId]) > 0] { _id, title }`, { targetId: `*${targetId}*` });

  console.log(`📋 Found ${pages.length} page documents referencing the legacy meta.`);
  for (const pg of pages) {
    console.log(`   -> Unsetting quickFilterMeta from page [${pg.title || pg._id}]`);
    const fullPage = await client.getDocument(pg._id);
    const updatedSections = (fullPage.sections || []).map(sect => {
      if (sect.quickFilterMeta && sect.quickFilterMeta._ref.includes(targetId)) {
        const { quickFilterMeta, ...rest } = sect; // Strip it
        return rest;
      }
      return sect;
    });
    await client.patch(pg._id).set({ sections: updatedSections }).commit();
  }

  console.log('✅ All block references scrubbed successfully.');

  // 3. Finally, DELETE the meta definition document itself
  console.log(`🔥 Deleting the legacy definition document [${targetId}]...`);
  // Attempt to delete published version
  await client.delete(targetId).catch(e => console.log(`   (Note: ${targetId} delete note: ${e.message})`));
  // Attempt to delete draft version just in case
  await client.delete(`drafts.${targetId}`).catch(e => {});

  console.log('\n✨ CLEANUP COMPLETED! The old Property Type is officially history.');
}

cleanup().catch(console.error);
