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
  const commit = process.argv.includes('--commit');
  console.log(`Starting Property Galleries Migration (Multilingual)... [Mode: ${commit ? 'LIVE COMMIT' : 'DRY RUN'}]`);
  
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("ERROR: SANITY_API_WRITE_TOKEN is missing in .env.local!");
    process.exit(1);
  }

  // Fetch all property documents, including drafts
  console.log("Fetching properties from Sanity...");
  const properties = await client.fetch(`*[_type == "property"] { _id, title, language, gallery }`);
  console.log(`Found ${properties.length} property documents.\n`);

  let migratedCount = 0;

  for (const prop of properties) {
    console.log(`--------------------------------------------------`);
    console.log(`Document: "${prop.title || 'Untitled'}" (${prop.language}) - ID: ${prop._id}`);
    
    if (!prop.gallery || prop.gallery.length === 0) {
      console.log("  No gallery found. Skipping.");
      continue;
    }

    // Extract all items from current gallery structure
    const images = [];
    const videos = [];
    let hasOldGrouping = false;

    // Detect old groupings (including the temporary unlocalized ones)
    for (const item of prop.gallery) {
      if (item._type === 'galleryGroup') {
        const groupTitle = item.title;
        if (['Exterior', 'Interior', 'Foto', 'Video'].includes(groupTitle)) {
          hasOldGrouping = true;
        }
        
        for (const nested of (item.items || [])) {
          if (nested._type === 'image') {
            images.push({ ...nested });
          } else if (nested._type === 'videoItem') {
            videos.push({ ...nested });
          }
        }
      } else if (item._type === 'image') {
        images.push({ ...item });
      } else if (item._type === 'videoItem') {
        videos.push({ ...item });
      }
    }

    console.log(`  Current Structure:`);
    prop.gallery.forEach((g, idx) => {
      if (g._type === 'galleryGroup') {
        console.log(`    - Group: "${g.title}" containing ${g.items?.length || 0} items`);
      } else {
        console.log(`    - Individual: type="${g._type}"`);
      }
    });

    console.log(`  Extracted items:`);
    console.log(`    - Images found: ${images.length}`);
    console.log(`    - Videos found: ${videos.length}`);

    // Determine titles based on language
    const lang = prop.language || 'en';
    const photoTitle = lang === 'es' ? 'Fotos' : 'Photos';
    const videoTitle = lang === 'es' ? 'Vídeos' : 'Videos';

    // Build the new gallery array
    const newGallery = [];
    if (images.length > 0) {
      newGallery.push({
        _type: 'galleryGroup',
        _key: 'foto-group',
        title: photoTitle,
        items: images.map((img, idx) => ({
          ...img,
          _key: img._key || `img-${idx}-${Math.random().toString(36).slice(2, 7)}`
        }))
      });
    }
    if (videos.length > 0) {
      newGallery.push({
        _type: 'galleryGroup',
        _key: 'video-group',
        title: videoTitle,
        items: videos.map((vid, idx) => ({
          ...vid,
          _key: vid._key || `vid-${idx}-${Math.random().toString(36).slice(2, 7)}`
        }))
      });
    }

    console.log(`  Proposed New Structure:`);
    newGallery.forEach((g) => {
      console.log(`    - Group: "${g.title}" containing ${g.items.length} items`);
    });

    // Check if any change actually needed or if it's already in the new format
    const alreadyMigrated = !hasOldGrouping && 
      prop.gallery.length === newGallery.length &&
      prop.gallery.every((g, idx) => g.title === newGallery[idx].title && g.items?.length === newGallery[idx].items?.length);

    if (alreadyMigrated) {
      console.log("  Status: Already in new format or matches proposed structure. Skipping update.");
      continue;
    }

    if (commit) {
      console.log(`  Status: PATCHING database record...`);
      try {
        await client.patch(prop._id)
          .set({ gallery: newGallery })
          .commit();
        console.log(`  SUCCESS: Updated "${prop.title || prop._id}"`);
        migratedCount++;
      } catch (err) {
        console.error(`  ERROR updating document ${prop._id}:`, err.message);
      }
    } else {
      console.log(`  Status: DRY RUN OK (Pending commit)`);
      migratedCount++;
    }
  }

  console.log(`\n==================================================`);
  if (commit) {
    console.log(`Migration Complete. Successfully updated ${migratedCount} documents.`);
  } else {
    console.log(`Dry run complete. ${migratedCount} documents would be migrated. Run with '--commit' to apply updates.`);
  }
}

run().catch(console.error);
