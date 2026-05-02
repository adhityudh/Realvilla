import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function uploadLocalImage(imagePath) {
  const fullPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) return null;
  const asset = await client.assets.upload('image', fs.createReadStream(fullPath));
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

async function patchSocials() {
  console.log('Fetching homepage data...');
  const homePage = await client.fetch(`*[_type == "page" && slug.current == "home"][0]`);
  
  if (!homePage) {
    console.error('Home page not found!');
    return;
  }

  const aboutIndex = homePage.sections.findIndex(s => s._type === 'aboutSection');
  if (aboutIndex === -1) {
    console.error('About section not found!');
    return;
  }

  console.log('Uploading social icons...');
  const icons = {
    email: await uploadLocalImage('/icons/logo-email-light.svg'),
    ig: await uploadLocalImage('/icons/logo-ig-light.svg'),
    linkedin: await uploadLocalImage('/icons/logo-linkedin-light.svg'),
  };

  const socialLinks = [
    { _key: 'social-1', label: 'Email', icon: icons.email, linkType: 'external', externalLink: 'mailto:contact@realvilla.es' },
    { _key: 'social-2', label: 'Instagram', icon: icons.ig, linkType: 'external', externalLink: 'https://instagram.com/realvilla' },
    { _key: 'social-3', label: 'LinkedIn', icon: icons.linkedin, linkType: 'external', externalLink: 'https://linkedin.com/company/realvilla' },
  ];

  console.log('Patching about section with social links...');
  const updatedSections = [...homePage.sections];
  updatedSections[aboutIndex] = {
    ...updatedSections[aboutIndex],
    socialLinks
  };

  await client.patch(homePage._id)
    .set({ sections: updatedSections })
    .commit();

  console.log('Social links patched successfully!');
}

patchSocials().catch(console.error);
