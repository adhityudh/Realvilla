import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const agent = new https.Agent({  
  rejectUnauthorized: false
});

async function downloadFile(url, filename) {
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const filePath = path.join(tempDir, filename);
  const response = await axios({ 
    url, 
    method: 'GET', 
    responseType: 'stream',
    httpsAgent: agent 
  });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

async function uploadFromUrl(url, filename, type = 'file') {
  console.log(`Downloading and uploading ${filename}...`);
  try {
    const filePath = await downloadFile(url, filename);
    const asset = await client.assets.upload(type, fs.createReadStream(filePath));
    fs.unlinkSync(filePath);
    return { _type: type, asset: { _type: 'reference', _ref: asset._id } };
  } catch (err) {
    console.error(`Failed to upload ${filename}:`, err.message);
    return null;
  }
}

async function uploadLocalImage(imagePath) {
  const fullPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) return null;
  const asset = await client.assets.upload('image', fs.createReadStream(fullPath));
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

async function seed() {
  const data = JSON.parse(fs.readFileSync('sanity-data.json', 'utf8'));
  const homePage = data[0];

  console.log('Seeding sections...');
  const newSections = [];

  const splashData = homePage.sections.find(s => s._type === 'splashIntro');
  const heroData = homePage.sections.find(s => s._type === 'heroSection');

  if (heroData) {
    const desktopVideo = await uploadFromUrl(heroData.desktopVideo, 'hero-desktop.mp4', 'file');
    const mobileVideo = await uploadFromUrl(heroData.mobileVideo, 'hero-mobile.mp4', 'file');

    const ctaIcons = [
      await uploadLocalImage('/icons/arrows_more_down.svg'),
      await uploadLocalImage('/icons/arrows_more_up.svg'),
      await uploadLocalImage('/icons/euro.svg'),
      await uploadLocalImage('/icons/contract.svg'),
    ];

    const ctas = [
      { label: 'Buy', icon: ctaIcons[0], linkType: 'external', externalLink: '/buy', _key: 'cta-1' },
      { label: 'Sell', icon: ctaIcons[1], linkType: 'external', externalLink: '/sell', _key: 'cta-2' },
      { label: 'Invest', icon: ctaIcons[2], linkType: 'external', externalLink: '/invest', _key: 'cta-3' },
      { label: 'Mortgages', icon: ctaIcons[3], linkType: 'external', externalLink: '/mortgage', _key: 'cta-4' },
    ];

    newSections.push({
      _type: 'heroSection',
      _key: 'section-hero',
      title: splashData?.title || "Elevate Your Tenerife Lifestyle.",
      subtitle: splashData?.subtitle || "Premium Tenerife real estate. Expert guidance for buyers, sellers, and investors looking for exclusive opportunities.",
      desktopVideo,
      mobileVideo,
      ctas
    });
  }

  for (const section of homePage.sections) {
    if (section._type === 'splashIntro' || section._type === 'heroSection') continue;
    console.log(`Processing ${section._type}...`);

    if (section._type === 'valuationSection') {
      section.linkType = 'external';
      section.externalLink = section.ctaLink || '#';
    }

    if (section._type === 'aboutSection') {
      section.bgImage = await uploadLocalImage('/images/img-about-bg.webp');
      section.objectImage = await uploadLocalImage('/images/img-about-p.webp');
      section.certificates = [
        await uploadLocalImage('/images/img-dummy-default.webp'),
        await uploadLocalImage('/images/img-dummy-default.webp'),
        await uploadLocalImage('/images/img-dummy-default.webp'),
      ].filter(Boolean);
    }

    if (section._type === 'propertiesSection') {
      const img1 = await uploadLocalImage('/images/img-dummy-1.jpg');
      const img2 = await uploadLocalImage('/images/img-dummy-2.jpg');
      const img3 = await uploadLocalImage('/images/img-dummy-3.jpg');
      const img4 = await uploadLocalImage('/images/img-dummy-4.jpg');

      section.properties = [
        { ...section.properties[0], image: img1, secondaryImage: img3, _key: 'prop-1' },
        { ...section.properties[1], image: img3, secondaryImage: img2, _key: 'prop-2' },
        { ...section.properties[2], image: img2, secondaryImage: img4, _key: 'prop-3' },
      ];
    }

    if (section._type === 'testimonialsSection') {
      section.overlapImage = await uploadLocalImage('/images/img-review.jpg');
    }

    if (section._type === 'contactSection') {
      section.bgImage = await uploadLocalImage('/images/img-cta-desktop.webp');
      section.mobileBgImage = await uploadLocalImage('/images/img-cta-mobile.webp');
    }

    if (section.faqs) section.faqs = section.faqs.map((f, i) => ({ ...f, _key: `faq-${i}` }));
    if (section.marketData) section.marketData = section.marketData.map((m, i) => ({ ...m, _key: `market-${i}` }));
    if (section.testimonials) section.testimonials = section.testimonials.map((t, i) => ({ ...t, _key: `testimonial-${i}` }));

    if (section._type === 'mortgageFAQSection') {
      section.ctaPrimaryLinkType = 'external';
      section.ctaPrimaryExternalLink = section.ctaPrimaryLink || '#';
      section.showSecondaryCta = !!section.ctaSecondaryLabel;
      section.ctaSecondaryLinkType = 'external';
      section.ctaSecondaryExternalLink = section.ctaSecondaryLink || '#';
    }

    newSections.push({ ...section, _key: `section-${newSections.length}` });
  }

  await client.createOrReplace({
    _id: 'home-page',
    _type: 'page',
    title: 'Home',
    slug: { _type: 'slug', current: 'home' },
    sections: newSections,
  });
  console.log('Seeding complete!');
}

seed().catch(console.error);
