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

async function migrate() {
  console.log('🚀 BEGINNING MEGA CATEGORY MIGRATION...');

  // 1. Find the OLD Property Type Meta Document
  console.log('🔍 Locating legacy Property Type definition...');
  const oldMeta = await client.fetch(`*[_type == "propertyMeta" && (shortLabel.en == "Type" || longLabel.en == "Property Type")][0]`);

  if (!oldMeta) {
    throw new Error('Could not find the legacy Property Type meta document! Aborting.');
  }
  
  console.log(`✅ Found Meta: "${oldMeta._id}". It contains ${oldMeta.selectOptions?.length || 0} options.`);

  // 2. Generate New Category Documents for each option
  const optionToCategoryMap = {}; // Map raw 'en' option string -> New Doc _id
  
  for (let i = 0; i < (oldMeta.selectOptions || []).length; i++) {
    const opt = oldMeta.selectOptions[i];
    const enTitle = opt.en;
    const esTitle = opt.es;
    const categorySlug = enTitle.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

    // Check if already exists to permit script safe re-runs
    const existing = await client.fetch(`*[_type == "propertyCategory" && slug.current == $slug][0]`, { slug: categorySlug });
    
    let categoryId = '';
    if (existing) {
      console.log(`⏩ Category "${enTitle}" already exists [${existing._id}]. Skipping creation.`);
      categoryId = existing._id;
    } else {
      console.log(`➕ Creating new category: "${enTitle}" / "${esTitle}"...`);
      const newDoc = {
        _type: 'propertyCategory',
        title: {
          _type: 'localizedString',
          en: enTitle,
          es: esTitle
        },
        slug: {
          _type: 'slug',
          current: categorySlug
        },
        order: i * 10, // preserve existing sequence implicitly
        icon: opt.icon || null // directly clone image object/ref
      };
      const created = await client.create(newDoc);
      console.log(`   -> Created! ID: ${created._id}`);
      categoryId = created._id;
    }

    optionToCategoryMap[enTitle] = categoryId;
  }

  console.log('📊 Final Mapping Ready:', optionToCategoryMap);

  // 3. Load all properties to set the direct reference
  console.log('\n🔍 Scanning properties to re-link categories...');
  const properties = await client.fetch(`*[_type == "property"] {
    _id,
    title,
    meta[] {
      "metaId": metaKey->_id,
      selectValue,
      selectArrayValue
    }
  }`);

  console.log(`📋 Found ${properties.length} total property documents.`);

  let updatedCount = 0;
  for (const prop of properties) {
    // Find the meta object referencing the old Meta Document ID
    const targetMetaId = oldMeta._id.replace('drafts.', '');
    const propertyTypeMeta = (prop.meta || []).find(m => m.metaId && m.metaId.includes(targetMetaId));

    const rawVal = propertyTypeMeta?.selectValue || (Array.isArray(propertyTypeMeta?.selectArrayValue) ? propertyTypeMeta.selectArrayValue[0] : null);

    if (!rawVal) {
      console.log(`⚠️  Property [${prop.title || prop._id}] has no legacy Property Type selected. Skipping.`);
      continue;
    }

    // Clean any weird stega or whitespace
    const cleanVal = typeof rawVal === 'string' ? rawVal.replace(/[\u2000-\u206F\u200B-\u200D\uFEFF]/g, '').trim() : rawVal;

    const newCategoryId = optionToCategoryMap[cleanVal];

    if (!newCategoryId) {
      console.log(`❌ UNKNOWN OPTION: Property [${prop.title}] has value "${cleanVal}", which was not found in map!`);
      continue;
    }

    console.log(`🔗 Linking Property [${prop.title || prop._id}] -> Category [${cleanVal}] (${newCategoryId})...`);
    
    await client
      .patch(prop._id)
      .set({
        category: {
          _type: 'reference',
          _ref: newCategoryId
        }
      })
      .commit();

    updatedCount++;
  }

  console.log(`\n✨ MIGRATION COMPLETED!`);
  console.log(`Successfully linked ${updatedCount} properties to their new standalone Category documents.`);
  console.log(`Note: You can now safely delete the "Property Type" Property Meta definition from Sanity Studio when confident.`);
}

migrate().catch(console.error);
