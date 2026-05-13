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

const BUY_PAGE_IDS = [
  "79c83f1a-580b-46b4-bc88-1cc65cbc5797", 
  "b8035107-9a47-45e3-b4ff-7688147cfc0b"
];

const SEED_DATA = {
  en: {
    headline: "YOUR TENERIFE VISION",
    subtitle: "Whether you are seeking a lucrative investment or a private coastal retreat, our dedicated team is here to transform your vision into reality with complete discretion and excellence.",
    initialStep: "general",
    allowBack: false,
    generalTitle: "BEGIN YOUR SEARCH",
    generalSubtitle: "Share your requirements with us. Our specialists will reach out to craft a bespoke property acquisition strategy just for you."
  },
  es: {
    headline: "SU VISIÓN DE TENERIFE",
    subtitle: "Ya sea que busque una inversión lucrativa o un refugio costero privado, nuestro equipo dedicado está aquí para transformar su visión en realidad con total discreción y excelencia.",
    initialStep: "general",
    allowBack: false,
    generalTitle: "COMIENCE SU BÚSQUEDA",
    generalSubtitle: "Comparta sus requisitos con nosotros. Nuestros especialistas se pondrán en contacto para diseñar una estrategia de adquisición de propiedades a su medida."
  }
};

async function appendContactSection() {
  console.log('🚀 Fetching all versions (published & drafts) of Buy pages...');

  // Fetch target documents, including drafts
  const documents = await client.fetch(`
    *[_type == "page" && (_id in $ids || _id in $draftIds)] {
      _id,
      language,
      sections
    }
  `, {
    ids: BUY_PAGE_IDS,
    draftIds: BUY_PAGE_IDS.map(id => `drafts.${id}`)
  });

  if (!documents || documents.length === 0) {
    console.log('❌ No matching buy pages found in the database.');
    return;
  }

  console.log(`Found ${documents.length} document versions to update.`);

  for (const doc of documents) {
    const lang = doc.language === 'es' ? 'es' : 'en';
    const content = SEED_DATA[lang];

    // Check if a contact section already exists to avoid duplicates
    const existing = doc.sections?.find(s => s._type === 'contactSection');
    if (existing) {
      console.log(`⚠️ Page ${doc._id} already has a Contact Section. We will UPDATE it instead of appending.`);
      
      const updatedSections = doc.sections.map(sec => {
        if (sec._type === 'contactSection') {
          return {
            ...sec,
            ...content
          };
        }
        return sec;
      });

      await client.patch(doc._id).set({ sections: updatedSections }).commit();
      console.log(`✅ Successfully updated contact section in ${doc._id} (${lang})`);
      continue;
    }

    // Construct the brand new contact section
    const newContactSec = {
      _type: 'contactSection',
      _key: `cs_buy_${Date.now()}_${lang}`,
      ...content,
      marketData: [] // Kept clean as per instructions
    };

    console.log(`➕ Appending brand new contact section to ${doc._id} (${lang})...`);
    
    try {
      await client
        .patch(doc._id)
        .setIfMissing({ sections: [] })
        .append('sections', [newContactSec])
        .commit();
      console.log(`✅ Successfully appended to ${doc._id}`);
    } catch (error) {
      console.error(`❌ Error updating ${doc._id}:`, error.message);
    }
  }

  console.log('\n🎉 Seeding of Buy Page Contact sections finished!');
}

appendContactSection();
