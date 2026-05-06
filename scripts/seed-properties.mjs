import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const TENERIFE_LOCATIONS = [
  { address: 'Calle Las Mimosas, 12', city: 'Adeje', price: 42995000, lat: 28.1167, lng: -16.7333 },
  { address: 'Avenida de las Americas, 5', city: 'Arona', price: 12500000, lat: 28.0500, lng: -16.7167 },
  { address: 'Paseo Maritimo, 102', city: 'Costa Adeje', price: 8500000, lat: 28.0833, lng: -16.7333 },
  { address: 'Calle El Duque, 8', city: 'Adeje', price: 18000000, lat: 28.0924, lng: -16.7412 },
  { address: 'Camino Real, 44', city: 'Santa Cruz de Tenerife', price: 3500000, lat: 28.4682, lng: -16.2546 },
  { address: 'Calle Los Roques, 15', city: 'Puerto de la Cruz', price: 4200000, lat: 28.4165, lng: -16.5475 },
  { address: 'Avenida Maritima, 88', city: 'Candelaria', price: 2100000, lat: 28.3541, lng: -16.3704 },
  { address: 'Calle del Mar, 1', city: 'El Medano', price: 1800000, lat: 28.0468, lng: -16.5369 },
  { address: 'Paseo del Sol, 20', city: 'Los Cristianos', price: 5600000, lat: 28.0526, lng: -16.7156 },
  { address: 'Calle La Caleta, 3', city: 'Adeje', price: 25000000, lat: 28.1023, lng: -16.7533 },
]

const PROPERTY_TITLES = [
  'Infinity by the Sea', 'Oceanfront Masterpiece', 'Villa Serenity', 'The Royal Cliff Estate',
  'Sunset Boulevard Villa', 'Majestic Heights', 'Casa Del Mar', 'The Glass House',
  'Palacio de Las Estrellas', 'Modern Oasis'
]

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4ea0d?w=1600&q=80',
]

async function downloadAndUploadImage(url, filename) {
  try {
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)
    const filePath = path.join(tempDir, filename)
    
    const response = await axios({ url, method: 'GET', responseType: 'stream' })
    const writer = fs.createWriteStream(filePath)
    response.data.pipe(writer)
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
    
    const asset = await client.assets.upload('image', fs.createReadStream(filePath))
    fs.unlinkSync(filePath)
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  } catch (err) {
    console.error(`Failed to upload ${filename}:`, err.message)
    return null
  }
}

async function run() {
  try {
    console.log('1. Clearing existing documents...')
    const props = await client.fetch(`*[_type == "property"]._id`)
    const metas = await client.fetch(`*[_type in ["propertyMeta", "propertyMetaCategory"]]._id`)
    const translations = await client.fetch(`*[_type == "translation.metadata" && references(*[_type == "property"]._id)]._id`)
    
    for (const id of [...translations, ...props, ...metas]) {
      await client.delete(id).catch(() => {})
    }

    console.log('3. Creating Categories...')
    const catInterior = await client.create({ _type: 'propertyMetaCategory', title: { en: 'Interior', es: 'Interior' }, order: 1 })
    const catExterior = await client.create({ _type: 'propertyMetaCategory', title: { en: 'Exterior', es: 'Exterior' }, order: 2 })
    const catDetails = await client.create({ _type: 'propertyMetaCategory', title: { en: 'Details', es: 'Detalles' }, order: 3 })
    const catFinancial = await client.create({ _type: 'propertyMetaCategory', title: { en: 'Financial', es: 'Financiero' }, order: 4 })

    console.log('4. Creating Meta Definitions...')
    const metaBeds = await client.create({ _type: 'propertyMeta', category: { _type: 'reference', _ref: catInterior._id }, shortLabel: { en: 'Beds', es: 'Camas' }, longLabel: { en: 'Total Bedrooms', es: 'Dormitorios Totales' }, valueType: 'number', isHighlighted: true, highlightOrder: 1 })
    const metaBaths = await client.create({ _type: 'propertyMeta', category: { _type: 'reference', _ref: catInterior._id }, shortLabel: { en: 'Baths', es: 'Baños' }, longLabel: { en: 'Full Bathrooms', es: 'Baños Completos' }, valueType: 'number', isHighlighted: true, highlightOrder: 2 })
    const metaSqft = await client.create({ _type: 'propertyMeta', category: { _type: 'reference', _ref: catDetails._id }, shortLabel: { en: 'Area', es: 'Área' }, longLabel: { en: 'Total Area', es: 'Área Total' }, valueType: 'number', unit: { en: 'Sq.Ft.', es: 'm²' }, isHighlighted: true, highlightOrder: 3 })
    const metaGarage = await client.create({ _type: 'propertyMeta', category: { _type: 'reference', _ref: catExterior._id }, shortLabel: { en: 'Garage', es: 'Garaje' }, longLabel: { en: 'Garage Spaces', es: 'Plazas de Garaje' }, valueType: 'number' })
    const metaPool = await client.create({ _type: 'propertyMeta', category: { _type: 'reference', _ref: catExterior._id }, shortLabel: { en: 'Pool', es: 'Piscina' }, longLabel: { en: 'Swimming Pool', es: 'Piscina' }, valueType: 'boolean' })

    console.log('5. Uploading Images (this will take a moment)...')
    const uploadedImages = []
    for (let i = 0; i < UNSPLASH_IMAGES.length; i++) {
      const img = await downloadAndUploadImage(UNSPLASH_IMAGES[i], `unsplash-${i}.jpg`)
      if (img) uploadedImages.push(img)
    }

    console.log('6. Generating 20 Properties...')
    for (let i = 1; i <= 20; i++) {
      const loc = TENERIFE_LOCATIONS[i % TENERIFE_LOCATIONS.length]
      const title = `${loc.address} | ${PROPERTY_TITLES[i % PROPERTY_TITLES.length]}`
      
      const img1 = uploadedImages[Math.floor(Math.random() * uploadedImages.length)]
      const img2 = uploadedImages[Math.floor(Math.random() * uploadedImages.length)]

      const propId = `property-${i}-${Date.now()}`
      
      const propertyEn = {
        _id: propId,
        _type: 'property',
        language: 'en',
        title: title,
        slug: { _type: 'slug', current: propId },
        price: loc.price - (i * 100000),
        status: 'for-sale',
        featured: i <= 3,
        location: {
          fullAddress: `${loc.address}, ${loc.city}, Santa Cruz de Tenerife, Spain`,
          municipality: loc.city,
          googleMapsUrl: `https://maps.google.com/?q=${loc.lat},${loc.lng}`,
          lat: loc.lat,
          lng: loc.lng,
          coordinates: { _type: 'geopoint', lat: loc.lat, lng: loc.lng }
        },
        description: [
          {
            _key: `block-${i}`,
            _type: 'block',
            style: 'normal',
            markDefs: [],
            children: [{ _key: `span-${i}`, _type: 'span', marks: [], text: `A rare estate of true scale and presence in ${loc.city}, Tenerife. Rebuilt from the foundation up, the home delivers premium living with powerful architectural lines, floor-to-ceiling glass, and a seamless connection to the natural beauty of the Canary Islands at every turn.` }]
          }
        ],
        image: img1,
        secondaryImage: img2,
        meta: [
          { _key: `meta-beds-${i}`, metaKey: { _type: 'reference', _ref: metaBeds._id }, numberValue: Math.floor(Math.random() * 5) + 3 },
          { _key: `meta-baths-${i}`, metaKey: { _type: 'reference', _ref: metaBaths._id }, numberValue: Math.floor(Math.random() * 4) + 2 },
          { _key: `meta-sqft-${i}`, metaKey: { _type: 'reference', _ref: metaSqft._id }, numberValue: Math.floor(Math.random() * 8000) + 2000 },
          { _key: `meta-garage-${i}`, metaKey: { _type: 'reference', _ref: metaGarage._id }, numberValue: Math.floor(Math.random() * 3) + 1 },
          { _key: `meta-pool-${i}`, metaKey: { _type: 'reference', _ref: metaPool._id }, booleanValue: true }
        ]
      }

      const propertyEs = {
        ...propertyEn,
        _id: `${propId}-es`,
        language: 'es',
        description: [
          {
            _key: `block-${i}`,
            _type: 'block',
            style: 'normal',
            markDefs: [],
            children: [{ _key: `span-${i}`, _type: 'span', marks: [], text: `Una rara propiedad de verdadera escala y presencia en ${loc.city}, Tenerife. Reconstruida desde los cimientos, la casa ofrece una vida premium con poderosas líneas arquitectónicas y una conexión perfecta con la belleza natural de las Islas Canarias.` }]
          }
        ]
      }

      await client.createIfNotExists(propertyEn)
      await client.createIfNotExists(propertyEs)

      await client.createIfNotExists({
        _id: `translation-${propId}`,
        _type: 'translation.metadata',
        translations: [
          { _key: `en-${propId}`, _type: 'internationalizedArrayReferenceValue', language: 'en', value: { _type: 'reference', _ref: propertyEn._id } },
          { _key: `es-${propId}`, _type: 'internationalizedArrayReferenceValue', language: 'es', value: { _type: 'reference', _ref: propertyEs._id } }
        ]
      })

      process.stdout.write('.')
    }
    console.log('\n✅ Successfully generated 20 properties!')
  } catch (error) {
    console.error('\nError:', error)
  }
}

run()
