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

async function seedBuyPageSeo() {
  console.log('🚀 Initiating Buy Page SEO Seed...');

  // Target Page 1: English "Buy"
  const docEn = "79c83f1a-580b-46b4-bc88-1cc65cbc5797";
  const seoEn = {
    _type: 'seo',
    metaTitle: 'Find Your Perfect Home in Tenerife | Realvilla Buy',
    metaDescription: 'Discover the finest selection of homes for sale in Tenerife. Explore our buyer resources, mortgage simulation tools, and exclusive collection curated for you.',
    noIndex: false
  };
  
  // Target Page 2: Spanish "Comprar"
  const docEs = "b8035107-9a47-45e3-b4ff-7688147cfc0b";
  const seoEs = {
    _type: 'seo',
    metaTitle: 'Encuentre su Hogar Perfecto en Tenerife | Comprar con Realvilla',
    metaDescription: 'Descubra la mejor selección de viviendas en venta en Tenerife. Explore recursos para compradores, simulador de hipotecas y colecciones exclusivas curadas.',
    noIndex: false
  };

  console.log(`🌱 Patching English Buy Page (${docEn})...`);
  await client.patch(docEn).set({ seo: seoEn }).commit();
  
  console.log(`🌱 Patching Spanish Comprar Page (${docEs})...`);
  await client.patch(docEs).set({ seo: seoEs }).commit();

  console.log('✅ Successfully populated SEO for Buy pages!');
}

seedBuyPageSeo().catch(console.error);
