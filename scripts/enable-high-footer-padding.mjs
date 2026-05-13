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

async function enableHighFooter() {
  console.log('🚀 Enforcing High Footer Padding for all Buy Pages in Database...');

  const docs = await client.fetch(`
    *[_type == "page" && (slug.current == "buy" || slug.current == "comprar")] {
      _id,
      title,
      slug
    }
  `);

  console.log(`Found ${docs.length} target pages in Sanity.`);

  for (const doc of docs) {
    try {
      await client.patch(doc._id).set({ footerPaddingHigh: true }).commit();
      console.log(`✅ SUCCESSFULLY enabled High Footer for: ${doc.title} (${doc._id} - ${doc.slug.current})`);
    } catch (err) {
      console.error(`❌ Failed to patch ${doc._id}:`, err.message);
    }
  }
  
  console.log('\n🎉 All updates pushed perfectly!');
}

enableHighFooter();
