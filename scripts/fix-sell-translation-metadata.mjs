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

const SELL_EN_ID = '53781b2c-7966-4bca-a12d-ca847d3b6943';
const SELL_ES_ID = 'page-es-sell';
const TRANS_META_ID = 'translation-page-sell';

async function fixSellTranslationMetadata() {
  console.log('🔍 Checking current state...\n');

  // 1. Check if translation metadata already exists
  const existing = await client.fetch(`*[_id == $id][0]`, { id: TRANS_META_ID });
  if (existing) {
    console.log('⚠️ translation.metadata already exists for sell/vender:');
    console.log(JSON.stringify(existing, null, 2));
    console.log('\n✅ No action needed.');
    return;
  }

  // 2. Verify both pages exist
  const [enPage, esPage] = await Promise.all([
    client.fetch(`*[_id == $id]{_id, title, language, slug}[0]`, { id: SELL_EN_ID }),
    client.fetch(`*[_id == $id]{_id, title, language, slug}[0]`, { id: SELL_ES_ID }),
  ]);

  if (!enPage) {
    console.error(`❌ English sell page (${SELL_EN_ID}) not found!`);
    return;
  }
  if (!esPage) {
    console.error(`❌ Spanish vender page (${SELL_ES_ID}) not found!`);
    return;
  }

  console.log(`✅ Found EN sell page: "${enPage.title}" (${enPage.language})`);
  console.log(`✅ Found ES vender page: "${esPage.title}" (${esPage.language})`);

  // 3. Create translation.metadata document (same format as translation-page-buy)
  const doc = {
    _id: TRANS_META_ID,
    _type: 'translation.metadata',
    translations: [
      {
        _key: `en-${TRANS_META_ID}`,
        _type: 'internationalizedArrayReferenceValue',
        language: 'en',
        value: {
          _type: 'reference',
          _ref: SELL_EN_ID,
        },
      },
      {
        _key: `es-${TRANS_META_ID}`,
        _type: 'internationalizedArrayReferenceValue',
        language: 'es',
        value: {
          _type: 'reference',
          _ref: SELL_ES_ID,
        },
      },
    ],
  };

  console.log('\n📝 Creating translation.metadata document...');
  const result = await client.createIfNotExists(doc);
  console.log(`✅ Created: ${result._id}`);

  // 4. Verify
  const verify = await client.fetch(`*[_id == $id]{...}[0]`, { id: TRANS_META_ID });
  console.log('\n✅ Verification - translation metadata created successfully:');
  console.log(JSON.stringify(verify, null, 2));

  // 5. Test _translations query
  const testQuery = await client.fetch(`
    *[_type == "page" && _id in [$en, $es]] {
      _id,
      title,
      language,
      "_translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value->{
        "language": language,
        "slug": slug.current
      }
    }
  `, { en: SELL_EN_ID, es: SELL_ES_ID });

  console.log('\n✅ _translations test:');
  console.log(JSON.stringify(testQuery, null, 2));

  console.log('\n🎉 Fix complete! Sell and Vender pages are now linked as translations.');
}

fixSellTranslationMetadata().catch(console.error);