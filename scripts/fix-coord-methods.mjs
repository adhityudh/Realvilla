import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-05-02',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function migrate() {
  console.log('Starting migration...');
  
  const query = `*[_type == "property" && !defined(location.coordinateMethod)]`;
  const docs = await client.fetch(query);
  
  console.log(`Found ${docs.length} docs to update.`);

  let transaction = client.transaction();
  
  docs.forEach(doc => {
    transaction.patch(doc._id, p => p.set({ 'location.coordinateMethod': 'visual' }));
  });
  
  const res = await transaction.commit();
  console.log(`Successfully updated ${docs.length} properties to visual mode!`);
}

migrate().catch(console.error);
