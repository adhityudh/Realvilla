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

async function runUpdate() {
  console.log('🔄 Loading pages fetching Buy Mortgage sections...');
  
  // Fetch all pages containing the mortgage section
  const pages = await client.fetch(`*[_type == "page" && count(sections[_type == "buyMortgageSimSection"]) > 0] {
    _id,
    language,
    sections[_type == "buyMortgageSimSection"]
  }`);

  console.log(`🔎 Found ${pages.length} pages containing the component.`);

  for (const p of pages) {
    const section = p.sections.find((s) => s._type === 'buyMortgageSimSection');
    if (!section) continue;

    const isEs = p.language === 'es';

    const newHeadline = isEs ? 'Financiación Inmobiliaria Simplificada' : 'Simplified Property Financing';
    const newBody = isEs 
      ? 'Estima tus cuotas mensuales y explora las mejores vías hipotecarias para tu hogar en Tenerife.' 
      : 'Estimate your monthly payments and explore the best mortgage paths for your Tenerife home.';
    const newCta = isEs ? 'Más Información Sobre Financiación' : 'Learn About Financing';

    console.log(`✍ Updating page ${p._id} [${p.language || 'en'}]...`);

    // Patch target section via array filter
    await client
      .patch(p._id)
      .set({
        [`sections[_key=="${section._key}"].headline`]: newHeadline,
        [`sections[_key=="${section._key}"].body`]: newBody,
        [`sections[_key=="${section._key}"].ctaLabel`]: newCta,
      })
      .commit();
  }

  console.log('✅ Update complete!');
}

runUpdate().catch(console.error);
