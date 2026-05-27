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

const PAGE_EN_ID = 'page-en-faqs';
const PAGE_ES_ID = 'aa6ebd89-9c59-4c44-bb37-e02fbb82b998';

function rk() {
  return Math.random().toString(36).substring(2, 14);
}

async function run() {
  console.log('🏁 Starting copy of Contact section from Blog to FAQ pages...\n');

  // 1. Fetch Contact Sections from Blog Settings (blogPageSections)
  console.log('🔍 Fetching EN Blog Settings...');
  const enSettingsContact = await client.fetch(
    `*[_type == "settings" && (language == "en" || !defined(language))][0].blogPageSections[_type == "contactSection"][0]`
  );

  console.log('🔍 Fetching ES Blog Settings...');
  const esSettingsContact = await client.fetch(
    `*[_type == "settings" && language == "es"][0].blogPageSections[_type == "contactSection"][0]`
  );

  if (!enSettingsContact) {
    console.warn('⚠️ Warning: EN Blog Contact Section not found in settings! Will check homepage contact section as fallback.');
  }
  if (!esSettingsContact) {
    console.warn('⚠️ Warning: ES Blog Contact Section not found in settings! Will check homepage contact section as fallback.');
  }

  // Fallbacks if not found
  let finalEnContact = enSettingsContact;
  if (!finalEnContact) {
    console.log('📥 Fetching EN Homepage Contact Section as fallback...');
    const enHomepage = await client.fetch(
      `*[_type == "page" && slug.current == "home" && (language == "en" || !defined(language))][0]{ sections }`
    );
    finalEnContact = enHomepage?.sections?.find(s => s._type === 'contactSection');
  }

  let finalEsContact = esSettingsContact;
  if (!finalEsContact) {
    console.log('📥 Fetching ES Homepage Contact Section as fallback...');
    const esHomepage = await client.fetch(
      `*[_type == "page" && slug.current == "home" && language == "es"][0]{ sections }`
    );
    finalEsContact = esHomepage?.sections?.find(s => s._type === 'contactSection');
  }

  if (!finalEnContact) {
    console.error('❌ Error: Could not find EN Contact section anywhere.');
    return;
  }
  if (!finalEsContact) {
    console.error('❌ Error: Could not find ES Contact section anywhere.');
    return;
  }

  // Create a clean key for our FAQ page sections to avoid key collision but keep everything else
  finalEnContact = { ...finalEnContact, _key: `faq-contact-en-${rk()}` };
  finalEsContact = { ...finalEsContact, _key: `faq-contact-es-${rk()}` };

  console.log('✅ Successfully obtained EN Contact Section:', finalEnContact.headline);
  console.log('✅ Successfully obtained ES Contact Section:', finalEsContact.headline);

  // 2. Update EN FAQ Page
  console.log(`\n🔄 Updating EN FAQ Page (${PAGE_EN_ID})...`);
  const enPage = await client.fetch(`*[_id == $id][0]{ sections }`, { id: PAGE_EN_ID });
  if (!enPage) {
    console.error(`❌ Error: EN FAQ page not found with ID: ${PAGE_EN_ID}`);
  } else {
    const existingSections = enPage.sections || [];
    const filteredSections = existingSections.filter(s => s._type !== 'contactSection');
    const updatedSections = [...filteredSections, finalEnContact];

    await client
      .patch(PAGE_EN_ID)
      .set({ sections: updatedSections })
      .commit();
    console.log(`✅ EN FAQ page successfully updated with Contact Section!`);
  }

  // 3. Update ES FAQ Page
  console.log(`\n🔄 Updating ES FAQ Page (${PAGE_ES_ID})...`);
  const esPage = await client.fetch(`*[_id == $id][0]{ sections }`, { id: PAGE_ES_ID });
  if (!esPage) {
    console.error(`❌ Error: ES FAQ page not found with ID: ${PAGE_ES_ID}`);
  } else {
    const existingSections = esPage.sections || [];
    const filteredSections = existingSections.filter(s => s._type !== 'contactSection');
    const updatedSections = [...filteredSections, finalEsContact];

    await client
      .patch(PAGE_ES_ID)
      .set({ sections: updatedSections })
      .commit();
    console.log(`✅ ES FAQ page successfully updated with Contact Section!`);
  }

  console.log('\n🎉 Copy completed successfully! Contact section is now on both FAQ pages.');
}

run().catch(console.error);
