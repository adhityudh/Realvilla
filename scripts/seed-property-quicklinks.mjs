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

async function seedPropertyQuickLinks() {
  console.log('🚀 Initializing Property Quick Links Seeder...');

  const jobs = [
    {
      id: 'settings-en',
      lang: 'EN',
      quickLinks: [
        {
          _key: 'ql_buying_process_en',
          label: 'BUYING PROCESS',
          linkType: 'external',
          externalLink: '#buying-process'
        },
        {
          _key: 'ql_mortgage_options_en',
          label: 'MORTGAGE OPTIONS',
          linkType: 'external',
          externalLink: '#mortgage-simulator'
        }
      ]
    },
    {
      id: 'settings-es',
      lang: 'ES',
      quickLinks: [
        {
          _key: 'ql_buying_process_es',
          label: 'PROCESO DE COMPRA',
          linkType: 'external',
          externalLink: '#buying-process'
        },
        {
          _key: 'ql_mortgage_options_es',
          label: 'OPCIONES DE HIPOTECA',
          linkType: 'external',
          externalLink: '#mortgage-simulator'
        }
      ]
    }
  ];

  for (const { id, lang, quickLinks } of jobs) {
    console.log(`\n🔄 Processing Global Settings [${id}] (${lang})...`);

    const doc = await client.fetch(`*[_id == $id][0]`, { id });
    if (!doc) {
      console.warn(`⚠️ Document ${id} not found in dataset. Skipping.`);
      continue;
    }

    console.log(`📝 Patching [${id}] with Dynamic Links and Guidance Modal toggle (ON)...`);

    try {
      await client
        .patch(id)
        .set({
          propertyQuickLinks: quickLinks,
          propertyUseRequestGuidance: true
        })
        .commit();

      console.log(`🎉 SUCCESSFULLY seeded Property Quick Links into [${id}]!`);
    } catch (err) {
      console.error(`❌ Failed to patch ${id}:`, err.message);
    }
  }

  console.log('\n🏁 ALL PROPERTY SEEDING OPERATIONS COMPLETED SUCCESSFULLY!');
}

seedPropertyQuickLinks();
