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

// Privacy policy hero uses these image refs - reuse them for cookie policy
const HERO_BG_DESKTOP = 'image-97cc355bbdb40edb35884e4aad5ed82e0181f481-1376x768-webp';
const HERO_BG_MOBILE = 'image-dbe3c1616f9e83b46adc63da973bd31b7cc708df-768x1376-webp';

function rk() {
  return Math.random().toString(36).substring(2, 9);
}

function block(text, style = 'normal') {
  return {
    _key: rk(),
    _type: 'block',
    style,
    markDefs: [],
    children: [{ _key: rk(), _type: 'span', marks: [], text }],
  };
}

function bullet(text) {
  return {
    _key: rk(),
    _type: 'block',
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _key: rk(), _type: 'span', marks: [], text }],
  };
}

// ─── EN Content ───────────────────────────────────────────────────────────────
const enBody = [
  block('Effective Date: May 27, 2025'),

  block('1. WHAT ARE COOKIES?', 'h2'),
  block('Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work efficiently and to provide information to website owners. Cookies do not contain personally identifiable information, but personal data that we store about you may be linked to the information stored in and obtained from cookies.'),

  block('2. HOW WE USE COOKIES', 'h2'),
  block('RealVilla uses cookies to enhance your browsing experience and to support our real estate services. Specifically, we use cookies to:'),
  bullet('Remember your preferences and settings when you return to our website.'),
  bullet('Understand how visitors use our platform, including which pages are visited most and how users navigate our property listings.'),
  bullet('Analyze the performance of our valuation tools, property search, and mortgage calculator features.'),
  bullet('Deliver relevant content and ensure our website functions correctly across all devices.'),
  bullet('Support our marketing efforts, such as showing relevant property listings or services based on your browsing history.'),

  block('3. TYPES OF COOKIES WE USE', 'h2'),
  block('Strictly Necessary Cookies', 'h3'),
  block('These cookies are essential for the website to function. Without them, core features such as property searches, contact forms, and the mortgage calculator would not work properly. These cannot be disabled.'),
  block('Performance & Analytics Cookies', 'h3'),
  block('We use tools such as Google Analytics to collect anonymized data about how visitors interact with our site. This helps us improve our content, property listings, and user experience over time.'),
  block('Functionality Cookies', 'h3'),
  block('These cookies enable enhanced functionality by remembering choices you make, such as your preferred language (English or Spanish) or region, so we can tailor the experience to your needs.'),
  block('Marketing & Targeting Cookies', 'h3'),
  block('These cookies track your visit to our website and may be used to build a profile of your interests in Tenerife real estate, enabling us to show you more relevant advertisements on third-party platforms.'),

  block('4. THIRD-PARTY COOKIES', 'h2'),
  block('Some cookies on our website are placed by third-party services. These may include:'),
  bullet('Google Analytics — for website traffic and usage analysis.'),
  bullet('Google Maps — used to display property locations and interactive maps.'),
  bullet('Social Media Platforms — if you use share or embed features, platforms like Facebook or Instagram may set their own cookies.'),
  block('We do not control these third-party cookies and recommend reviewing the privacy policies of these providers directly.'),

  block('5. MANAGING YOUR COOKIE PREFERENCES', 'h2'),
  block('You have the right to accept or refuse cookies. You can manage your cookie preferences in the following ways:'),
  bullet('Browser Settings: Most browsers allow you to refuse or delete cookies. Please refer to your browser\'s help documentation for guidance.'),
  bullet('Cookie Consent Banner: Upon your first visit, you can accept or decline non-essential cookies via our consent banner.'),
  bullet('Opt-Out Links: For Google Analytics, you can opt out using the Google Analytics Opt-out Browser Add-on.'),
  block('Please note that disabling certain cookies may affect the functionality of our website, including property search filters and the mortgage calculator.'),

  block('6. UPDATES TO THIS COOKIE POLICY', 'h2'),
  block('We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. We encourage you to review this page periodically. Continued use of our website after any changes constitutes your acceptance of the updated policy.'),

  block('7. CONTACT US', 'h2'),
  block('If you have any questions about our use of cookies or this Cookie Policy, please contact us at:'),
  bullet('Email: luis.villarreal@realvilla.es'),
  bullet('Phone: +34 675 15 15 97'),
];

async function translateText(text) {
  if (!text || text.trim() === '') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    console.error(`Failed to translate: "${text.substring(0, 50)}..."`, error.message);
    return text;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateBlocks(blocks) {
  const translated = JSON.parse(JSON.stringify(blocks));
  for (const block of translated) {
    if (block.children && block.children[0]) {
      block.children[0].text = await translateText(block.children[0].text);
      await sleep(150);
    }
  }
  return translated;
}

function makeHeroSection(title) {
  return {
    _key: rk(),
    _type: 'generalHeroSection',
    id: 'general-hero',
    title,
    desktopLayout: 'vertical',
    disableEntranceAnimation: false,
    disableHeaderEntranceAnimation: false,
    backgroundImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: HERO_BG_DESKTOP },
    },
    backgroundImageMobile: {
      _type: 'image',
      asset: { _type: 'reference', _ref: HERO_BG_MOBILE },
    },
    primaryButton: { linkType: 'external', openInNewWindow: false },
    secondaryButton: { linkType: 'external', openInNewWindow: false },
  };
}

function makeDocSection(body, tocLabel) {
  return {
    _key: rk(),
    _type: 'generalDocumentSection',
    anchor: 'cookie-policy',
    tocLabel,
    body,
  };
}

async function run() {
  console.log('Translating Cookie Policy body to Spanish...');
  const esBody = await translateBlocks(enBody);
  const esTitle = await translateText('Cookie Policy');

  const enPage = {
    _type: 'page',
    language: 'en',
    title: 'Cookie Policy',
    slug: { _type: 'slug', current: 'cookie-policy' },
    footerPaddingHigh: false,
    sections: [
      makeHeroSection('Cookie Policy'),
      makeDocSection(enBody, 'Table of Contents'),
    ],
  };

  const esPage = {
    _type: 'page',
    language: 'es',
    title: esTitle,
    slug: { _type: 'slug', current: 'politica-de-cookies' },
    footerPaddingHigh: false,
    sections: [
      makeHeroSection(esTitle),
      makeDocSection(esBody, 'Tabla de Contenidos'),
    ],
  };

  console.log('Creating EN Cookie Policy page...');
  const enResult = await client.create(enPage);
  console.log('Created EN:', enResult._id, enResult.title);

  console.log('Creating ES Cookie Policy page...');
  const esResult = await client.create(esPage);
  console.log('Created ES:', esResult._id, esResult.title);

  console.log('Done!');
}

run().catch(console.error);
