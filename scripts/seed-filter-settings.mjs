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

async function seedFilters() {
  console.log('🔄 Patching Filter Sidebar settings globally...');
  const settings = await client.fetch(`*[_type == "settings"]{ _id, language }`);

  for (const doc of settings) {
    const isEs = doc.language === 'es';
    const data = {
      title: isEs ? 'FILTROS DE BÚSQUEDA' : 'SEARCH FILTERS',
      subtitle: isEs ? 'Refine su selección perfecta' : 'Refine your perfect selection'
    };

    console.log(`🌱 Seeding filter texts for [${doc.language || 'en'}] on [${doc._id}]...`);
    await client.patch(doc._id).set({ filterSidebar: data }).commit();
  }
  console.log('✅ Filters fully seeded!');
}

seedFilters().catch(console.error);
