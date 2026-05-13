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

async function inspect() {
  const docs = await client.fetch(`
    *[_type == "page" && slug.current == "buy"] {
      sections[_type == "buyingProcessSection"] {
        imageOrder
      }
    }
  `);

  const raw = docs[0]?.sections[0]?.imageOrder;
  if (raw) {
    console.log("RAW STRING:", raw);
    console.log("RAW LENGTH:", raw.length);
    const codes = Array.from(raw).map(c => c.charCodeAt(0)).join(',');
    console.log("CHARACTER CODES:", codes);
  } else {
    console.log("NOT FOUND");
  }
}

inspect();
