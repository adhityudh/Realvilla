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

// legalLinks keys from the fetched footer data
const EN_LEGAL_LINKS = [
  { key: 'e4220f29595c1a33', label: 'Legal Notice',    url: '/en/legal-notice' },
  { key: '5ebe7e45fdba6072', label: 'Privacy Policy',  url: '/en/privacy-policy' },
  { key: '7c76ff3d0487f917', label: 'Cookie Policy',   url: '/en/cookie-policy' },
];

const ES_LEGAL_LINKS = [
  { key: 'e4220f29595c1a33', label: 'Aviso Legal',             url: '/es/aviso-legal' },
  { key: '5ebe7e45fdba6072', label: 'Política de Privacidad',  url: '/es/politica-de-privacidad' },
  { key: '7c76ff3d0487f917', label: 'Política de Cookies',     url: '/es/politica-de-cookies' },
];

async function updateLegalLinks(settingsId, links) {
  const patches = {};
  for (const { key, label, url } of links) {
    patches[`footer.legalLinks[_key == "${key}"].label`] = label;
    patches[`footer.legalLinks[_key == "${key}"].externalLink`] = url;
  }
  await client.patch(settingsId).set(patches).commit();
  console.log(`Updated ${settingsId}`);
}

async function run() {
  const settings = await client.fetch(
    `*[_type == "settings"] { _id, language }`
  );
  console.log('Found settings:', settings.map(s => `${s._id} (${s.language})`));

  for (const s of settings) {
    if (s.language === 'en') {
      await updateLegalLinks(s._id, EN_LEGAL_LINKS);
    } else if (s.language === 'es') {
      await updateLegalLinks(s._id, ES_LEGAL_LINKS);
    }
  }

  console.log('Done! Legal links updated.');
}

run().catch(console.error);
