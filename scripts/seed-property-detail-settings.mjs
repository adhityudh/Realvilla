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

async function seedPropertyDetailSettings() {
  console.log('🚀 Fetching Contact Section definitions from Buy pages...');

  // 1. Fetch the buy pages including the raw content of contactSection
  const buyPages = await client.fetch(`
    *[_type == "page" && (slug.current == "buy" || slug.current == "comprar")] {
      _id,
      language,
      "contactSection": sections[_type == "contactSection"][0]
    }
  `);

  const contactEn = buyPages.find(p => p.language === 'en')?.contactSection;
  const contactEs = buyPages.find(p => p.language === 'es')?.contactSection;

  if (!contactEn || !contactEs) {
    console.error('❌ Failed to find contact sections from buy pages!', { contactEn: !!contactEn, contactEs: !!contactEs });
    return;
  }

  console.log('✅ Found both English and Spanish Contact Sections successfully!');

  const jobs = [
    { id: 'settings-en', lang: 'EN', sectionData: contactEn },
    { id: 'settings-es', lang: 'ES', sectionData: contactEs }
  ];

  for (const { id, lang, sectionData } of jobs) {
    console.log(`\n🔄 Processing Global Settings [${id}] (${lang})...`);

    // Fetch existing document
    const doc = await client.fetch(`*[_id == $id][0]`, { id });
    if (!doc) {
      console.warn(`⚠️ Document ${id} not found. Skipping.`);
      continue;
    }

    // Copy the section and generate a unique key to prevent conflict
    const freshSection = {
      ...sectionData,
      _key: `detail_contact_${Date.now()}_${lang.toLowerCase()}`
    };

    // Prepare existing sections list
    let sections = doc.propertyDetailSections || [];

    // Remove existing contactSection inside detailSections if present to prevent duplication
    sections = sections.filter(s => s._type !== 'contactSection');

    // Push the fresh contact section at the end
    sections.push(freshSection);

    console.log(`📝 Patching [${id}] with Contact Section and High Footer Padding...`);

    try {
      await client
        .patch(id)
        .set({
          propertyDetailSections: sections,
          propertyDetailFooterPaddingHigh: true
        })
        .commit();

      console.log(`🎉 SUCCESSFULLY updated [${id}]!`);
    } catch (err) {
      console.error(`❌ Failed to patch ${id}:`, err.message);
    }
  }

  console.log('\n🏁 ALL SEED JOBS COMPLETED PERFECTLY!');
}

seedPropertyDetailSettings();
