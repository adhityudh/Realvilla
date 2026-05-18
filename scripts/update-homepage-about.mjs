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

// The uploaded WA asset ID
const WA_ASSET_ID = 'image-7d73fff40d58cc84583f2f538f293be5e6ec2115-640x640-svg';

const newSocialLinks = [
  {
    _key: 'social-1',
    label: 'WhatsApp',
    externalLink: 'https://wa.me/34675151597',
    icon: {
      _type: 'image',
      asset: {
        _ref: WA_ASSET_ID,
        _type: 'reference'
      }
    },
    linkType: 'external'
  },
  {
    _key: 'social-2',
    label: 'Instagram',
    externalLink: 'https://www.instagram.com/luis_villarreal_lv',
    icon: {
      _type: 'image',
      asset: {
        _ref: 'image-1911dd2d74c4ccee67ccad9ac715764ba35b3235-14x14-svg',
        _type: 'reference'
      }
    },
    linkType: 'external'
  },
  {
    _key: 'social-3',
    label: 'LinkedIn',
    externalLink: 'https://www.linkedin.com/in/luis-geraldo-villarreal-sanjuan-a2899226a/',
    icon: {
      _type: 'image',
      asset: {
        _ref: 'image-a33f4823dd39f8a32231ae3ea18e239f344b81bb-14x14-svg',
        _type: 'reference'
      }
    },
    linkType: 'external'
  }
];

async function update() {
  console.log('🔄 Initiating homepage aboutSection social update...');

  const homeDocIds = ['2bad81f1-669a-4c0e-b5f0-13de81f3d1af', 'home-page'];

  for (const docId of homeDocIds) {
    console.log(`🧹 Processing page document [${docId}]...`);
    const page = await client.fetch(`*[_id == $docId][0]`, { docId });
    if (page && page.sections) {
      const updatedSections = page.sections.map(sec => {
        if (sec._type === 'aboutSection') {
          return { ...sec, socialLinks: newSocialLinks };
        }
        return sec;
      });
      await client.patch(docId).set({ sections: updatedSections }).commit();
      console.log(`   ✅ Successfully updated aboutSection socialLinks on [${docId}]`);
    } else {
      console.log(`   ❌ Document [${docId}] or its sections not found.`);
    }
  }

  console.log('🎉 Homepage aboutSection update completed successfully!');
}

update().catch(console.error);
