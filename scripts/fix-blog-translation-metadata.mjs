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

// Manual mapping of EN and ES blog post slugs
const BLOG_POST_PAIRS = [
  {
    en: 'buying-property-tenerife-foreigner-guide',
    es: 'comprar-propiedad-tenerife-extranjero-guia',
  },
  {
    en: 'cost-buying-home-tenerife-breakdown',
    es: 'costo-comprar-casa-tenerife-desglose',
  },
  {
    en: 'best-areas-live-tenerife-2026',
    es: 'mejores-zonas-vivir-tenerife-2026',
  },
  {
    en: 'investment-property-tenerife-2026',
    es: 'por-que-tenerife-mejor-inversion-2026',
  },
  {
    en: 'questions-before-buying-villa-costa-adeje',
    es: 'preguntas-comprar-villa-costa-adeje',
  },
  {
    en: 'tenerife-property-market-trends-2026',
    es: 'tendencias-mercado-inmobiliario-tenerife-2026',
  },
  {
    en: 'top-things-do-tenerife-local-guide',
    es: 'mejores-cosas-hacer-tenerife-guia-local',
  },
];

async function fetchBlogPostBySlug(slug, language) {
  const post = await client.fetch(`
    *[_type == "blogPost" && slug.current == $slug && language == $language && !(_id in path("drafts.**"))][0] {
      _id,
      title,
      language,
      "slug": slug.current,
      __i18n_lang,
      __i18n_base,
      __i18n_refs
    }
  `, { slug, language });
  
  return post;
}

async function checkTranslationMetadata(enId, esId) {
  const metadata = await client.fetch(`
    *[_type == "translation.metadata" && references($enId) && references($esId)][0] {
      _id,
      translations[] {
        _key,
        language,
        value {
          _ref
        }
      }
    }
  `, { enId, esId });

  return metadata;
}

async function createTranslationMetadata(enPost, esPost) {
  const metadataId = `translation-blogPost-${enPost.slug}`;

  // Check if already exists
  const existing = await client.fetch(`*[_id == $id][0]`, { id: metadataId });
  if (existing) {
    console.log(`  ⚠️  Metadata already exists: ${metadataId}`);
    return existing;
  }

  // Create translation.metadata document
  const doc = {
    _id: metadataId,
    _type: 'translation.metadata',
    translations: [
      {
        _key: `en-${metadataId}`,
        _type: 'internationalizedArrayReferenceValue',
        language: 'en',
        value: {
          _type: 'reference',
          _ref: enPost._id,
        },
      },
      {
        _key: `es-${metadataId}`,
        _type: 'internationalizedArrayReferenceValue',
        language: 'es',
        value: {
          _type: 'reference',
          _ref: esPost._id,
        },
      },
    ],
  };

  const result = await client.createIfNotExists(doc);
  console.log(`  ✅ Created metadata: ${result._id}`);
  return result;
}

async function updatePostI18nFields(enPost, esPost) {
  const baseRef = enPost._id;

  try {
    // Update EN post
    await client.patch(enPost._id)
      .set({
        __i18n_lang: 'en',
        __i18n_base: { _type: 'reference', _ref: baseRef },
        __i18n_refs: [
          { _type: 'reference', _ref: enPost._id, _key: 'en' },
          { _type: 'reference', _ref: esPost._id, _key: 'es' }
        ]
      })
      .commit();

    // Update ES post
    await client.patch(esPost._id)
      .set({
        __i18n_lang: 'es',
        __i18n_base: { _type: 'reference', _ref: baseRef },
        __i18n_refs: [
          { _type: 'reference', _ref: enPost._id, _key: 'en' },
          { _type: 'reference', _ref: esPost._id, _key: 'es' }
        ]
      })
      .commit();

    console.log(`  ✅ Updated i18n fields`);
  } catch (error) {
    console.error(`  ❌ Failed to update i18n fields:`, error.message);
    throw error;
  }
}

async function fixBlogTranslationMetadata() {
  console.log('🔧 Fixing blog post translation metadata...\n');
  console.log('='.repeat(60));
  console.log('\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const pair of BLOG_POST_PAIRS) {
    console.log(`📝 Processing pair:`);
    console.log(`   EN slug: ${pair.en}`);
    console.log(`   ES slug: ${pair.es}`);

    try {
      // Fetch both posts
      const [enPost, esPost] = await Promise.all([
        fetchBlogPostBySlug(pair.en, 'en'),
        fetchBlogPostBySlug(pair.es, 'es'),
      ]);

      if (!enPost) {
        console.log(`   ❌ EN post not found: ${pair.en}\n`);
        errorCount++;
        continue;
      }

      if (!esPost) {
        console.log(`   ❌ ES post not found: ${pair.es}\n`);
        errorCount++;
        continue;
      }

      console.log(`   ✅ Found EN: "${enPost.title}"`);
      console.log(`   ✅ Found ES: "${esPost.title}"`);

      // Check if metadata already exists
      const existingMetadata = await checkTranslationMetadata(enPost._id, esPost._id);
      
      if (existingMetadata) {
        console.log(`   ⏭️  Translation metadata already exists\n`);
        skipCount++;
        continue;
      }

      // Create translation metadata
      await createTranslationMetadata(enPost, esPost);

      // Update i18n fields
      await updatePostI18nFields(enPost, esPost);

      console.log(`   ✅ Complete\n`);
      successCount++;

    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
      console.log('');
      errorCount++;
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully linked: ${successCount} pairs`);
  console.log(`   ⏭️  Already linked: ${skipCount} pairs`);
  console.log(`   ❌ Errors: ${errorCount} pairs`);
  console.log('');

  if (successCount > 0) {
    // Test _translations query
    console.log('🧪 Testing _translations query...\n');
    
    const testSlug = BLOG_POST_PAIRS[0].en;
    const testQuery = await client.fetch(`
      *[_type == "blogPost" && slug.current == $slug && language == "en"][0] {
        _id,
        title,
        language,
        "slug": slug.current,
        "_translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value->{
          "language": language,
          "slug": slug.current,
          "title": title
        }
      }
    `, { slug: testSlug });

    console.log('Test result for:', testSlug);
    console.log(JSON.stringify(testQuery, null, 2));
    console.log('');
  }

  console.log('🎉 Done!');
}

fixBlogTranslationMetadata().catch(console.error);
