import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function migrateGalleryToRegularMedia() {
  console.log('🔍 Fetching all properties with gallery groups...\n');

  // Fetch all properties that have gallery arrays
  const properties = await client.fetch(`
    *[_type == "property" && defined(gallery)] {
      _id,
      title,
      language,
      gallery[] {
        _type,
        _key,
        title,
        mediaType,
        items
      }
    }
  `);

  console.log(`Found ${properties.length} properties with galleries\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const property of properties) {
    const galleryGroups = property.gallery?.filter(g => g._type === 'galleryGroup') || [];
    
    if (galleryGroups.length === 0) {
      console.log(`⏭️  Skipping "${property.title}" - no gallery groups`);
      skippedCount++;
      continue;
    }

    // Check if any gallery group needs migration (missing mediaType or not set to 'regular')
    const needsMigration = galleryGroups.some(g => !g.mediaType || g.mediaType !== 'regular');

    if (!needsMigration) {
      console.log(`✓ Skipping "${property.title}" - already migrated`);
      skippedCount++;
      continue;
    }

    console.log(`📝 Migrating "${property.title}" [${property.language || 'no-lang'}]`);

    // Build the updated gallery array
    const updatedGallery = property.gallery.map(item => {
      if (item._type === 'galleryGroup') {
        // Set mediaType to 'regular' if not already set
        return {
          ...item,
          mediaType: item.mediaType || 'regular'
        };
      }
      return item;
    });

    try {
      // Update the property
      await client
        .patch(property._id)
        .set({ gallery: updatedGallery })
        .commit();

      console.log(`   ✅ Updated ${galleryGroups.length} gallery group(s)\n`);
      updatedCount++;
    } catch (error) {
      console.error(`   ❌ Error updating property: ${error.message}\n`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   Total properties checked: ${properties.length}`);
  console.log(`   Properties updated: ${updatedCount}`);
  console.log(`   Properties skipped: ${skippedCount}`);
  console.log('='.repeat(50) + '\n');

  if (updatedCount > 0) {
    console.log('✅ Migration completed successfully!');
  } else {
    console.log('ℹ️  No properties needed migration.');
  }
}

// Run the migration
migrateGalleryToRegularMedia()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });