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

const enMarketData = [
  {
    _key: 'market-0',
    prefix: '€',
    value: '2,850',
    unit: '/ m²',
    label: 'Avg. Price in Tenerife (South)'
  },
  {
    _key: 'market-1',
    prefix: '+',
    value: '5.4',
    unit: '% YoY',
    label: 'Property Value Growth'
  },
  {
    _key: 'market-2',
    prefix: '',
    value: '2.76',
    unit: '%',
    label: 'Current Euribor (12-Month)'
  }
];

const esMarketData = [
  {
    _key: 'market-0',
    prefix: '€',
    value: '2.850',
    unit: '/ m²',
    label: 'Precio Promedio en Tenerife (Sur)'
  },
  {
    _key: 'market-1',
    prefix: '+',
    value: '5,4',
    unit: '% YoY',
    label: 'Crecimiento del Valor Inmobiliario'
  },
  {
    _key: 'market-2',
    prefix: '',
    value: '2,76',
    unit: '%',
    label: 'Euríbor Actual (12 Meses)'
  }
];

async function updateHomepageStats() {
  console.log('🔍 Fetching homepage documents...');
  
  const pages = await client.fetch(`
    *[_type == "page" && slug.current == "home"] {
      _id,
      language,
      sections
    }
  `);

  console.log(`📄 Found ${pages.length} homepage documents.`);

  for (const page of pages) {
    const isEs = page.language === 'es';
    const selectedMarketData = isEs ? esMarketData : enMarketData;
    
    let hasChanges = false;
    const updatedSections = page.sections?.map(sec => {
      if (sec._type === 'contactSection') {
        hasChanges = true;
        return {
          ...sec,
          marketData: selectedMarketData
        };
      }
      return sec;
    }) || [];

    if (hasChanges) {
      console.log(`🌱 Patching homepage contact stats for [${page._id}] (${page.language})...`);
      await client.patch(page._id).set({ sections: updatedSections }).commit();
    }
  }

  console.log('✅ Homepage contact stats updated successfully!');
}

updateHomepageStats().catch(console.error);
