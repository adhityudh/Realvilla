import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function update() {
  console.log('🚀 STARTING CONTACT DATA UPDATE IN SANITY...');

  // 1. Upload the WhatsApp SVG icon to Sanity assets
  const iconPath = resolve(__dirname, '../public/icons/logo-wa.svg');
  if (!fs.existsSync(iconPath)) {
    throw new Error(`WhatsApp SVG icon not found at ${iconPath}`);
  }

  console.log('📤 Uploading WhatsApp SVG icon to Sanity assets...');
  const asset = await client.assets.upload('image', fs.createReadStream(iconPath), {
    contentType: 'image/svg+xml',
    filename: 'logo-wa.svg'
  });
  console.log(`✅ Asset uploaded! ID: ${asset._id}`);

  // Define new social links (Email is replaced by WhatsApp)
  const getNewSocialLinks = () => [
    {
      _key: 'whatsapp',
      label: 'WhatsApp',
      externalLink: 'https://wa.me/34675151597',
      icon: {
        _type: 'image',
        asset: {
          _ref: asset._id,
          _type: 'reference'
        }
      },
      linkType: 'external'
    },
    {
      _key: 'instagram',
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
      _key: 'linkedin',
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

  // 2. Update English Settings
  console.log('🧹 Updating settings-en contact details...');
  await client.patch('settings-en')
    .set({
      contactWhatsAppNumber: '+34675151597',
      'footer.socialLinks': getNewSocialLinks()
    })
    .commit();
  console.log('✅ Updated settings-en!');

  // 3. Update Spanish Settings
  console.log('🧹 Updating settings-es contact details...');
  await client.patch('settings-es')
    .set({
      contactWhatsAppNumber: '+34675151597',
      'footer.socialLinks': getNewSocialLinks()
    })
    .commit();
  console.log('✅ Updated settings-es!');

  console.log('🎉 ALL CONTACT DATA SUCCESSFULLY UPDATED IN SANITY!');
}

update().catch(console.error);
