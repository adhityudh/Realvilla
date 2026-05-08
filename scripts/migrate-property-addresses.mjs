import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const POSTAL_CODES = {
  'costa adeje': '38679',
  'caleta': '38679',
  'adeje': '38670',
  'los cristianos': '38650',
  'cristianos': '38650',
  'playa de las américas': '38660',
  'américas': '38660',
  'palm-mar': '38632',
  'arona': '38640',
  'santa cruz': '38001',
  'laguna': '38200',
  'puerto de la cruz': '38400',
  'isora': '38680',
  'teide': '38683',
  'gigantes': '38683',
  'candelaria': '38530',
  'granadilla': '38600',
  'médano': '38612',
  'güímar': '38500',
  'icod': '38430',
  'realejos': '38410',
  'miguel': '38639',
  'tegueste': '38280',
  'sauzal': '38360',
  'orotava': '38300',
  'tacoronte': '38350',
  'matanza': '38370',
  'victoria': '38380',
  'santa úrsula': '38390',
  'rosario': '38290',
  'arafo': '38509',
  'fasnia': '38570',
  'arico': '38580',
  'vilaflor': '38613',
  'guancha': '38440',
  'rambla': '38420',
  'garachico': '38450',
  'tanque': '38435',
  'silos': '38470',
  'buenavista': '38480'
};

function getFallbackPostalCode(fullAddress, municipality) {
  const text = `${fullAddress || ''} ${municipality || ''}`.toLowerCase();
  for (const [key, code] of Object.entries(POSTAL_CODES)) {
    if (text.includes(key)) {
      return code;
    }
  }
  return '38000'; // General Tenerife base postal prefix
}

function parseFullAddress(fullAddress, municipality) {
  if (!fullAddress) return { streetAddress: '', complexName: '', postalCode: '' };

  const parts = fullAddress.split(',').map(s => s.trim()).filter(Boolean);
  let streetAddress = '';
  let complexName = '';
  let postalCode = '';

  // Extract postal code (5 consecutive digits)
  const zipIndex = parts.findIndex(p => /^\d{5}$/.test(p));
  if (zipIndex !== -1) {
    postalCode = parts[zipIndex];
    parts.splice(zipIndex, 1);
  } else {
    postalCode = getFallbackPostalCode(fullAddress, municipality);
  }

  // Remove municipality if it's explicitly written in parts
  if (municipality) {
    const munIndex = parts.findIndex(p => p.toLowerCase() === municipality.toLowerCase());
    if (munIndex !== -1) {
      parts.splice(munIndex, 1);
    }
  }

  // Heuristics to classify street vs complex
  if (parts.length === 1) {
    const p = parts[0];
    if (/\b(calle|avenida|av|c\/|road|street|st|ave|camino|paseo)\b/i.test(p)) {
      streetAddress = p;
    } else {
      complexName = p;
    }
  } else if (parts.length >= 2) {
    const p0 = parts[0];
    const p1 = parts[1];
    if (/\b(calle|avenida|av|c\/|road|street|st|ave|camino|paseo)\b/i.test(p0)) {
      streetAddress = p0;
      complexName = p1;
    } else {
      complexName = p0;
      streetAddress = p1;
    }
  }

  return { streetAddress, complexName, postalCode };
}

async function migratePropertyAddresses() {
  console.log('Fetching properties from Sanity...');
  const properties = await client.fetch(`*[_type == "property"]`);

  if (!properties || properties.length === 0) {
    console.log('No properties found to migrate.');
    return;
  }

  console.log(`Found ${properties.length} properties. Commencing address migration & cleanup...`);
  let migrationCount = 0;

  for (const prop of properties) {
    const fullAddress = prop.location?.fullAddress || prop.address;
    const municipality = prop.location?.municipality || '';

    if (!fullAddress && prop.location?.streetAddress) {
      console.log(`Property "${prop.title?.en || prop._id}" is already migrated. Skipping.`);
      continue;
    }

    if (!fullAddress) {
      console.log(`Property "${prop.title?.en || prop._id}" has no address data. Skipping.`);
      continue;
    }

    console.log(`\nAnalyzing address for property: "${prop.title?.en || prop.title || prop._id}"`);
    console.log(`Original Address: "${fullAddress}"`);

    const parsed = parseFullAddress(fullAddress, municipality);
    console.log('Parsed Results:', parsed);

    // Apply the patch and unset legacy fields
    await client.patch(prop._id)
      .set({
        'location.streetAddress': parsed.streetAddress || prop.location?.streetAddress || '',
        'location.complexName': parsed.complexName || prop.location?.complexName || '',
        'location.postalCode': parsed.postalCode || prop.location?.postalCode || '',
      })
      .unset(['address', 'location.fullAddress'])
      .commit();

    console.log(`✓ Successfully migrated and cleaned property "${prop.title?.en || prop._id}"!`);
    migrationCount++;
  }

  console.log(`\nAddress migration complete! Total updated properties: ${migrationCount}`);
}

migratePropertyAddresses().catch(console.error);
