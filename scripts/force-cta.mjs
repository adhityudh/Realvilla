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

async function forceSeedMortgageCta() {
  console.log('🔍 Searching target documents...');
  const documents = await client.fetch(`*[ 
    count(sections[_type == "buyMortgageSimSection"]) > 0 || 
    count(propertyDetailSections[_type == "buyMortgageSimSection"]) > 0
  ] { _id, language, sections, propertyDetailSections }`);

  for (const doc of documents) {
    let patches = {};
    let hasChanged = false;
    const isEs = doc.language === 'es';

    const processList = (list) => {
      if (!list) return null;
      let modified = false;
      const result = list.map(sec => {
        if (sec._type === 'buyMortgageSimSection') {
          console.log(`🛠️ Found target component in ${doc._id}. Current Label: [${sec.ctaLabel}]`);
          // Forcing populate since User wants it NOW!
          modified = true;
          return {
            ...sec,
            ctaLabel: isEs ? 'Conocer Sobre Hipotecas' : 'Learn About Mortgage',
            linkType: 'external',
            externalLink: '#financing'
          };
        }
        return sec;
      });
      return modified ? result : null;
    };

    const newSections = processList(doc.sections);
    if (newSections) {
      patches.sections = newSections;
      hasChanged = true;
    }

    const newPropSections = processList(doc.propertyDetailSections);
    if (newPropSections) {
      patches.propertyDetailSections = newPropSections;
      hasChanged = true;
    }

    if (hasChanged) {
      console.log(`🚀 Overwriting CTA in document [${doc._id}]...`);
      await client.patch(doc._id).set(patches).commit();
    }
  }
  console.log('✅ Forced Activation Complete!');
}

forceSeedMortgageCta().catch(console.error);
