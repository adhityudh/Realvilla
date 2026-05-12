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

async function seedPropertiesSeo() {
  console.log('🔄 Locating global settings documents to populate Archive SEO...');
  
  const settingsDocs = await client.fetch(`*[_type == "settings"] {
    _id,
    language
  }`);

  console.log(`🔎 Found ${settingsDocs.length} settings documents.`);

  for (const doc of settingsDocs) {
    const isEs = doc.language === 'es';
    
    const initialSeo = {
      _type: 'seo',
      metaTitle: isEs ? 'Propiedades Exclusivas | Realvilla' : 'Exclusive Properties | Realvilla',
      metaDescription: isEs 
        ? 'Explore nuestra exclusiva selección de villas, apartamentos y casas en venta en Tenerife.' 
        : 'Explore our exclusive selection of villas, apartments, and houses for sale in Tenerife.',
      noIndex: false
    };

    console.log(`🌱 Seeding Archive SEO for language [${doc.language || 'en'}] on doc ${doc._id}...`);
    
    await client.patch(doc._id)
      .set({ propertiesPageSeo: initialSeo })
      .commit();
  }
  
  console.log('✅ Done: Global settings populated with Archive SEO!');
}

seedPropertiesSeo().catch(console.error);
