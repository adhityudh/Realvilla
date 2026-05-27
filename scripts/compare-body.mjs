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

async function run() {
  const enPost = await client.fetch(`*[_type == "blogPost" && slug.current == "cost-buying-home-tenerife-breakdown" && language == "en"][0] { body }`);
  const esPost = await client.fetch(`*[_type == "blogPost" && slug.current == "costo-comprar-casa-tenerife-desglose" && language == "es"][0] { body }`);
  
  console.log("EN body blocks length:", enPost.body?.length);
  console.log("ES body blocks length:", esPost.body?.length);

  // Compare block by block
  console.log("EN keys:", enPost.body?.map(b => b._key).join(', '));
  console.log("ES keys:", esPost.body?.map(b => b._key).join(', '));
  
  console.log("EN first block type:", enPost.body[0]._type);
  console.log("ES first block type:", esPost.body[0]._type);
}
run();
