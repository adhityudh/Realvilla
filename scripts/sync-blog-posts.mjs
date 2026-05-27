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

async function translateText(text) {
  if (!text || text.trim() === '') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    console.error(`Failed to translate: ${text}`, error.message);
    return text;
  }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateBlocks(blocks) {
  if (!blocks || !Array.isArray(blocks)) return blocks;
  
  // deep clone to avoid mutating original
  const translatedBlocks = JSON.parse(JSON.stringify(blocks));
  
  for (const block of translatedBlocks) {
    if (block._type === 'block' && block.children) {
      for (const child of block.children) {
        if (child._type === 'span' && child.text && child.text.trim().length > 0) {
          const isSpaceStart = child.text.startsWith(' ');
          const isSpaceEnd = child.text.endsWith(' ');
          let translated = await translateText(child.text.trim());
          if (isSpaceStart) translated = ' ' + translated;
          if (isSpaceEnd) translated = translated + ' ';
          child.text = translated;
          await sleep(200); // 200ms delay to avoid rate limits
        }
      }
    } else if (block._type === 'blogDetailAbout') {
        // We added this recently, don't need to translate unless there are text fields inside it
        // Or wait, blogDetailAbout is probably just a reference or empty block in body. 
        // It has no internal text that requires translation inside the block itself.
    }
    // Note: Other blocks like images or custom types are kept exactly as they are in EN
  }
  return translatedBlocks;
}

async function run() {
  console.log('🔄 STARTING SYNC AND TRANSLATE FROM EN TO ES...');
  const query = `*[_type == "blogPost" && language == "en" && !(_id in path("drafts.**"))] {
    _id,
    title,
    excerpt,
    body,
    "translationMetadata": *[_type == "translation.metadata" && references(^._id)][0] {
      translations[] {
        language,
        value {
          _ref
        }
      }
    }
  }`;

  const enPosts = await client.fetch(query);
  console.log(`Found ${enPosts.length} EN posts`);

  for (const en of enPosts) {
    let esId = null;
    if (en.translationMetadata) {
      const esTrans = en.translationMetadata.translations.find(t => t.language === 'es');
      if (esTrans && esTrans.value) {
        esId = esTrans.value._ref;
      }
    }
    
    if (!esId) {
        console.log(`Skipping "${en.title}" - No ES translation linked.`);
        continue;
    }

    console.log(`\n======================================`);
    console.log(`Translating: "${en.title}"`);
    
    // We fetch the current ES post to ensure we don't overwrite the slug or other ES specific fields
    // we only patch the content.
    
    console.log(`-> Translating title...`);
    // Wait, the original title might have [EN] but our previous script handled it. Let's just translate title.
    const translatedTitle = await translateText(en.title);
    
    console.log(`-> Translating excerpt...`);
    const translatedExcerpt = en.excerpt ? await translateText(en.excerpt) : null;
    
    console.log(`-> Translating body (this may take a minute)...`);
    const translatedBody = await translateBlocks(en.body);
    
    console.log(`-> Patching ES post: ${esId}`);
    try {
        await client.patch(esId)
            .set({
                title: translatedTitle,
                excerpt: translatedExcerpt,
                body: translatedBody
            })
            .commit();
        console.log(`✅ Successfully updated ${esId} with translated content`);
    } catch (e) {
        console.error(`❌ Failed to update ${esId}`, e.message);
    }
  }
  
  console.log('\n🎉 ALL DONE!');
}

run().catch(console.error);
