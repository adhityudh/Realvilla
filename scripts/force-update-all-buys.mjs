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

async function forceSync() {
  console.log('🛡️ FORCING DEEP SYNC OF ALL BUY DOCUMENTS (PUBLISHED & DRAFTS)...');

  // Fetch ANY page matching slug, including drafts explicitly
  const docs = await client.fetch(`
    *[_type == "page" && (slug.current == "buy" || slug.current == "comprar" || _id in ["drafts.79c83f1a-580b-46b4-bc88-1cc65cbc5797", "drafts.b8035107-9a47-45e3-b4ff-7688147cfc0b"])] {
      _id,
      language,
      sections
    }
  `);

  console.log(`Found ${docs.length} documents total.`);

  for (const doc of docs) {
    const lang = doc.language === 'es' ? 'es' : 'en';
    const copy = SEED_DATA[lang];

    const hasContact = doc.sections?.some(s => s._type === 'contactSection');
    
    let updatedSections = [];
    if (!hasContact) {
      console.log(`➕ Page ${doc._id} is missing contactSection completely. Injecting fresh!`);
      updatedSections = [
        ...(doc.sections || []),
        {
          _type: 'contactSection',
          _key: `cs_force_${Date.now()}_${lang}`,
          ...copy,
          marketData: []
        }
      ];
    } else {
      console.log(`🔄 Page ${doc._id} has contactSection. Overwriting all fields with target seed!`);
      updatedSections = doc.sections.map(sec => {
        if (sec._type === 'contactSection') {
          return {
            ...sec,
            ...copy
          };
        }
        return sec;
      });
    }

    try {
      await client.patch(doc._id).set({ sections: updatedSections }).commit();
      console.log(`✅ SUCCESS Patched ${doc._id} (${lang})`);
    } catch (err) {
      console.error(`❌ FAILED ${doc._id}:`, err.message);
    }
  }

  console.log('\n🎉 All Buy Page Sync completed!');
}

forceSync();
