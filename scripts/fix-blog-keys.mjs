import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

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

function addKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => addKeys(item));
  }
  if (obj && typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = addKeys(value);
    }
    // Add _key to array items that don't have it
    // We check if it's a plain object (not a span with marks etc) 
    // and doesn't have _type == "span" (those get _key from block children)
    if (!obj._key && obj._type && obj._type !== 'span') {
      newObj._key = crypto.randomBytes(8).toString('hex');
    }
    return newObj;
  }
  return obj;
}

async function fix() {
  console.log('🔧 Fixing missing _keys on all blog posts...\n');

  // Fetch all blog posts
  const posts = await client.fetch(`*[_type == "blogPost"] { _id, title, body, categories, tags }`);

  let fixed = 0;
  for (const post of posts) {
    const patch = {};

    if (Array.isArray(post.body)) {
      patch.body = addKeys(post.body);
    }
    if (Array.isArray(post.categories)) {
      patch.categories = post.categories.map((cat) => {
        if (!cat._key) {
          cat._key = crypto.randomBytes(8).toString('hex');
        }
        return cat;
      });
    }

    if (patch.body || patch.categories) {
      await client.patch(post._id).set(patch).commit();
      console.log(`  ✅ Fixed: ${post.title || post._id}`);
      fixed++;
    }
  }

  console.log(`\n✅ Done! Fixed ${fixed} blog posts.`);
}

fix().catch(console.error);