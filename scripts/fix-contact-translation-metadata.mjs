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

async function inspectContactPages() {
  console.log('🔍 Inspecting contact pages and their translation metadata...\n');

  // Fetch contact pages
  const contactPages = await client.fetch(`
    *[_type == "page" && slug.current in ["contact", "contacto"]] {
      _id,
      _rev,
      title,
      language,
      "slug": slug.current,
      __i18n_lang,
      __i18n_base,
      __i18n_refs
    }
  `);

  console.log('📄 Contact Pages:');
  console.log(JSON.stringify(contactPages, null, 2));

  // Fetch translation metadata documents
  const translationMetadata = await client.fetch(`
    *[_type == "translation.metadata" && references(*[_type == "page" && slug.current in ["contact", "contacto"]]._id)] {
      _id,
      _rev,
      translations[] {
        _key,
        language,
        value {
          _ref
        }
      }
    }
  `);

  console.log('\n🔗 Translation Metadata:');
  console.log(JSON.stringify(translationMetadata, null, 2));

  return { contactPages, translationMetadata };
}

async function fixContactTranslationMetadata() {
  console.log('🔧 Starting fix for contact page translation metadata...\n');

  const { contactPages, translationMetadata } = await inspectContactPages();

  if (contactPages.length !== 2) {
    console.error(`❌ Expected 2 contact pages, found ${contactPages.length}`);
    return;
  }

  const enPage = contactPages.find(p => p.language === 'en' || p.slug === 'contact');
  const esPage = contactPages.find(p => p.language === 'es' || p.slug === 'contacto');

  if (!enPage || !esPage) {
    console.error('❌ Could not find both English and Spanish contact pages');
    console.log('EN Page:', enPage);
    console.log('ES Page:', esPage);
    return;
  }

  console.log(`\n✅ Found both pages:`);
  console.log(`   EN: ${enPage._id} (${enPage.title})`);
  console.log(`   ES: ${esPage._id} (${esPage.title})`);

  // Create translation metadata document
  console.log('\n📝 Creating translation metadata document...');
  
  try {
    const translationDoc = await client.create({
      _type: 'translation.metadata',
      translations: [
        { 
          _key: 'en', 
          _type: 'internationalizedArrayReferenceValue', 
          language: 'en', 
          value: { _type: 'reference', _ref: enPage._id } 
        },
        { 
          _key: 'es', 
          _type: 'internationalizedArrayReferenceValue', 
          language: 'es', 
          value: { _type: 'reference', _ref: esPage._id } 
        }
      ]
    });
    
    console.log(`✅ Created translation metadata: ${translationDoc._id}`);
  } catch (error) {
    console.error('❌ Failed to create translation metadata:', error.message);
    throw error;
  }

  // Update the pages with proper i18n fields
  console.log('\n📝 Updating page i18n fields...');

  // Use the EN page as the base
  const baseRef = enPage._id;

  try {
    // Update EN page
    await client.patch(enPage._id)
      .set({
        __i18n_lang: 'en',
        __i18n_base: { _type: 'reference', _ref: baseRef },
        __i18n_refs: [
          { _type: 'reference', _ref: enPage._id, _key: 'en' },
          { _type: 'reference', _ref: esPage._id, _key: 'es' }
        ]
      })
      .commit();
    
    console.log(`✅ Updated EN page i18n fields: ${enPage._id}`);

    // Update ES page
    await client.patch(esPage._id)
      .set({
        __i18n_lang: 'es',
        __i18n_base: { _type: 'reference', _ref: baseRef },
        __i18n_refs: [
          { _type: 'reference', _ref: enPage._id, _key: 'en' },
          { _type: 'reference', _ref: esPage._id, _key: 'es' }
        ]
      })
      .commit();
    
    console.log(`✅ Updated ES page i18n fields: ${esPage._id}`);
  } catch (error) {
    console.error('❌ Failed to update page i18n fields:', error.message);
    throw error;
  }

  console.log('\n🎉 Translation metadata fix complete!');
  console.log('\n🔍 Verifying the fix...\n');

  await inspectContactPages();
}

fixContactTranslationMetadata().catch(console.error);