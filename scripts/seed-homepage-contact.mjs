import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-03-05',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

// Define the dynamic seed subsets based on translation values
const SEED_DATA = {
  en: {
    generalTitle: "Send us a message",
    generalSubtitle: "We will contact you as soon as possible.",
    sellTitle: "Start selling your property",
    sellSubtitle: "Fill in the details below and an expert will reach out to you."
  },
  es: {
    generalTitle: "Envíanos un mensaje",
    generalSubtitle: "Nos pondremos en contacto con usted lo antes posible.",
    sellTitle: "Comience a vender su propiedad",
    sellSubtitle: "Complete los detalles a continuación y un experto se pondrá en contacto con usted."
  }
};

async function runSeeder() {
  console.log('🚀 Starting Homepage Contact data seeding...');

  // 1. Fetch homepage documents (including potential drafts)
  const pages = await client.fetch(`
    *[_type == "page" && slug.current == "home"] {
      _id,
      language,
      sections
    }
  `);

  if (!pages || pages.length === 0) {
    console.error('❌ No homepage documents found in the database.');
    return;
  }

  console.log(`Found ${pages.length} homepage documents to process.`);

  for (const page of pages) {
    const lang = page.language === 'es' ? 'es' : 'en';
    const copy = SEED_DATA[lang];
    
    let hasChanges = false;
    const updatedSections = page.sections?.map(sec => {
      // Target ONLY the contact section by key
      if (sec._type === 'contactSection' && sec._key === 'section-7') {
        hasChanges = true;
        return {
          ...sec,
          // Inject localized titles/subtitles for the newly configured dynamic fields
          generalTitle: copy.generalTitle,
          generalSubtitle: copy.generalSubtitle,
          sellTitle: copy.sellTitle,
          sellSubtitle: copy.sellSubtitle,
          // Ensure correct initial defaults for safety
          initialStep: sec.initialStep || 'intent',
          allowBack: sec.allowBack !== false
        };
      }
      return sec;
    }) || [];

    if (!hasChanges) {
      console.log(`⚠️ No ContactSection found with key "section-7" in document ${page._id}, skipping...`);
      continue;
    }

    try {
      console.log(`🔄 Updating page ${page._id} (${lang}) with localized contact content...`);
      await client
        .patch(page._id)
        .set({ sections: updatedSections })
        .commit();
      console.log(`✅ Successfully patched ${page._id}`);
    } catch (err) {
      console.error(`❌ Failed to patch page ${page._id}:`, err.message);
    }
  }

  console.log('\n🎉 Seeding completed successfully!');
}

runSeeder();
