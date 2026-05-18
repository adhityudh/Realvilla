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

async function reupload() {
  console.log('🔄 Re-uploading updated WhatsApp logo to Sanity...');

  const iconPath = resolve(__dirname, '../public/icons/logo-wa.svg');
  if (!fs.existsSync(iconPath)) {
    throw new Error(`WhatsApp SVG icon not found at ${iconPath}`);
  }

  // 1. Upload new asset
  console.log('📤 Uploading newly modified logo-wa.svg...');
  const asset = await client.assets.upload('image', fs.createReadStream(iconPath), {
    contentType: 'image/svg+xml',
    filename: 'logo-wa.svg'
  });
  console.log(`✅ New Asset uploaded! ID: ${asset._id}`);

  // Define updated social links with the NEW asset ID
  const getNewSocialLinks = (currentLinks) => {
    return currentLinks.map(link => {
      if (link._key === 'whatsapp' || link.label === 'WhatsApp') {
        return {
          ...link,
          icon: {
            _type: 'image',
            asset: {
              _ref: asset._id,
              _type: 'reference'
            }
          }
        };
      }
      return link;
    });
  };

  const getNewAboutSocialLinks = (currentLinks) => {
    return currentLinks.map(link => {
      if (link._key === 'social-1' || link.label === 'WhatsApp') {
        return {
          ...link,
          icon: {
            _type: 'image',
            asset: {
              _ref: asset._id,
              _type: 'reference'
            }
          }
        };
      }
      return link;
    });
  };

  // 2. Update Global Settings (settings-en and settings-es)
  const settingsDocs = ['settings-en', 'settings-es'];
  for (const docId of settingsDocs) {
    const doc = await client.fetch(`*[_id == $docId][0]`, { docId });
    if (doc && doc.footer && doc.footer.socialLinks) {
      const updatedSocialLinks = getNewSocialLinks(doc.footer.socialLinks);
      await client.patch(docId).set({ 'footer.socialLinks': updatedSocialLinks }).commit();
      console.log(`   ✅ Updated footer WhatsApp logo on global settings [${docId}]`);
    }
  }

  // 3. Update Homepages (2bad81f1-669a-4c0e-b5f0-13de81f3d1af and home-page)
  const homeDocIds = ['2bad81f1-669a-4c0e-b5f0-13de81f3d1af', 'home-page'];
  for (const docId of homeDocIds) {
    const page = await client.fetch(`*[_id == $docId][0]`, { docId });
    if (page && page.sections) {
      const updatedSections = page.sections.map(sec => {
        if (sec._type === 'aboutSection' && sec.socialLinks) {
          const updatedLinks = getNewAboutSocialLinks(sec.socialLinks);
          return { ...sec, socialLinks: updatedLinks };
        }
        return sec;
      });
      await client.patch(docId).set({ sections: updatedSections }).commit();
      console.log(`   ✅ Updated profile WhatsApp logo on homepage [${docId}]`);
    }
  }

  console.log('🎉 WHATSAPP LOGO RE-UPLOAD & CASCADE COMPLETED SUCCESSFULLY!');
}

reupload().catch(console.error);
