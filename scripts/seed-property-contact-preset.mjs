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

async function seedPropertyContactPreset() {
  console.log('🌱 Seeding property contact preset messages...\n');

  try {
    // Fetch existing settings documents
    const settings = await client.fetch(`*[_type == "settings"]`);
    
    if (!settings || settings.length === 0) {
      console.log('❌ No settings documents found. Please create settings first.');
      return;
    }

    console.log(`Found ${settings.length} settings document(s)\n`);

    // Define preset messages for each language
    const presetMessages = {
      en: 'Hello! I saw this listing and would love to get more information about the property.',
      es: '¡Hola! Vi este anuncio y me encantaría obtener más información sobre la propiedad.'
    };

    // Update each settings document
    for (const setting of settings) {
      const language = setting.language || 'en';
      const presetMessage = presetMessages[language] || presetMessages.en;

      console.log(`Updating ${language.toUpperCase()} settings (${setting._id})...`);

      await client
        .patch(setting._id)
        .set({
          propertyContactPresetMessage: presetMessage
        })
        .commit();

      console.log(`✅ Updated with: "${presetMessage}"\n`);
    }

    console.log('✨ All settings updated successfully!');
  } catch (error) {
    console.error('❌ Error seeding preset messages:', error);
    throw error;
  }
}

seedPropertyContactPreset()
  .then(() => {
    console.log('\n🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });