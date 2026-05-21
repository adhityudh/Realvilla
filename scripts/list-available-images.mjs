import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function run() {
  console.log("Fetching available images from Sanity...\n");
  
  // Get all image assets
  const images = await client.fetch(`*[_type == "sanity.imageAsset"] {
    _id,
    url,
    originalFilename,
    metadata {
      dimensions
    }
  }[0...20]`);
  
  console.log(`Found ${images.length} images (showing first 20):\n`);
  
  images.forEach((img, idx) => {
    console.log(`[${idx + 1}] ${img._id}`);
    console.log(`    File: ${img.originalFilename || 'N/A'}`);
    console.log(`    Dimensions: ${img.metadata?.dimensions?.width}x${img.metadata?.dimensions?.height}`);
    console.log(`    URL: ${img.url}\n`);
  });
}

run().catch(console.error);