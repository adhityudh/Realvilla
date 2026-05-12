import { createClient } from '@sanity/client';
import fs from 'fs';
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

const img2Path = '/Users/yudha/.gemini/antigravity/brain/8a7f1fec-e0e0-46bf-b0df-65fb9c701823/process_legal_2_1778592663974.png';
const img3Path = '/Users/yudha/.gemini/antigravity/brain/8a7f1fec-e0e0-46bf-b0df-65fb9c701823/process_closing_3_1778592692919.png';

async function updateImgs() {
  console.log('Uploading image 2...');
  const i2 = await client.assets.upload('image', fs.createReadStream(img2Path), { filename: 'legal.png' });
  console.log('Uploading image 3...');
  const i3 = await client.assets.upload('image', fs.createReadStream(img3Path), { filename: 'closing.png' });

  const pageIds = ['79c83f1a-580b-46b4-bc88-1cc65cbc5797', 'b8035107-9a47-45e3-b4ff-7688147cfc0b'];

  for (const pid of pageIds) {
    const doc = await client.getDocument(pid);
    if (!doc) continue;

    const sectIdx = doc.sections.findIndex(s => s._type === 'buyingProcessSection');
    if (sectIdx === -1) continue;

    const updatedDoc = JSON.parse(JSON.stringify(doc));
    const sect = updatedDoc.sections[sectIdx];
    
    // Step 2 image
    if (sect.steps[1]) {
      sect.steps[1].image = {
        _type: 'image',
        asset: { _type: 'reference', _ref: i2._id }
      };
    }
    // Step 3 image
    if (sect.steps[2]) {
      sect.steps[2].image = {
        _type: 'image',
        asset: { _type: 'reference', _ref: i3._id }
      };
    }

    await client.patch(pid).set({ sections: updatedDoc.sections }).commit();
    console.log(`Updated imagery for page ID: ${pid}`);
  }
}

updateImgs().catch(console.error);
