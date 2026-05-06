import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-05-02',
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const imageUrls = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80', // Exterior
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80', // Living Room
  'https://images.unsplash.com/photo-1600607687931-cebf10cb8cb3?w=1600&q=80', // Kitchen
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80', // Bedroom
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1600&q=80', // Bathroom
]

async function uploadImage(url) {
  console.log(`Downloading ${url}...`)
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  console.log(`Uploading to Sanity...`)
  const asset = await client.assets.upload('image', buffer, { filename: 'property-image.jpg' })
  return asset._id
}

async function seed() {
  try {
    console.log('1. Clearing references to properties...')

    // Clear translation.metadata docs for properties
    const translationDocs = await client.fetch(`*[_type == "translation.metadata"]`)
    if (translationDocs.length > 0) {
      const tx = client.transaction()
      translationDocs.forEach(doc => tx.delete(doc._id))
      await tx.commit()
    }

    // Unset manualProperties arrays everywhere
    const docsWithManualProps = await client.fetch(`*[defined(manualProperties)]`)
    if (docsWithManualProps.length > 0) {
      const tx = client.transaction()
      docsWithManualProps.forEach(doc => {
        tx.patch(doc._id, p => p.unset(['manualProperties']))
      })
      await tx.commit()
    }

    console.log('2. Deleting existing properties and metas...')
    const existingIds = await client.fetch(`*[_type in ["property", "propertyMeta", "propertyMetaCategory"]]._id`)
    if (existingIds.length > 0) {
      const transaction = client.transaction()
      existingIds.forEach(id => transaction.delete(id))
      await transaction.commit()
      console.log(`Deleted ${existingIds.length} documents.`)
    }

    console.log('3. Creating categories...')
    const catInterior = await client.create({ _type: 'propertyMetaCategory', title: { en: 'Interior', es: 'Interior' }, order: 1 })
    const catExterior = await client.create({ _type: 'propertyMetaCategory', title: { en: 'Exterior', es: 'Exterior' }, order: 2 })
    const catDetails = await client.create({ _type: 'propertyMetaCategory', title: { en: 'Details', es: 'Detalles' }, order: 3 })
    const catFinancial = await client.create({ _type: 'propertyMetaCategory', title: { en: 'Financial', es: 'Financiero' }, order: 4 })

    console.log('4. Creating metas...')
    const metasToCreate = [
      { key: 'beds', cat: catInterior, short: 'Beds', long: 'Total Bedrooms', type: 'number', val: 6, hl: true, hlOrder: 1 },
      { key: 'fbaths', cat: catInterior, short: 'Full Baths', long: 'Full Bathrooms', type: 'number', val: 6, hl: true, hlOrder: 2 },
      { key: 'hbaths', cat: catInterior, short: 'Half Baths', long: 'Half Bathrooms', type: 'number', val: 3 },
      { key: 'intOther', cat: catInterior, short: 'Other Interior', long: 'Other Interior Features', type: 'string', val: 'Kitchen Island, Bookcases, Sauna, Sep Shower, Pantry, Back Stairs' },

      { key: 'garage', cat: catExterior, short: 'Garage', long: 'Garage Spaces', type: 'number', val: 3 },
      { key: 'waterSrc', cat: catExterior, short: 'Water Source', long: 'Water Source', type: 'string', val: 'Public' },
      { key: 'roof', cat: catExterior, short: 'Roof', long: 'Roof', type: 'string', val: 'Slate' },
      { key: 'lotFeat', cat: catExterior, short: 'Lot Features', long: 'Lot Features', type: 'string', val: 'Level, Parklike' },
      { key: 'parking', cat: catExterior, short: 'Parking', long: 'Parking', type: 'string', val: 'Attached Garage, Garage Door Opener' },
      { key: 'heat', cat: catExterior, short: 'Heat Type', long: 'Heat Type', type: 'string', val: 'Natural Gas, Combination, Geothermal' },
      { key: 'ac', cat: catExterior, short: 'Air Cond.', long: 'Air Conditioning', type: 'string', val: 'Central Air' },
      { key: 'sewer', cat: catExterior, short: 'Sewer', long: 'Sewer', type: 'string', val: 'Septic Tank' },
      { key: 'amenities', cat: catExterior, short: 'Amenities', long: 'Amenities', type: 'string', val: 'Gated' },
      { key: 'security', cat: catExterior, short: 'Security', long: 'Security Features', type: 'string', val: 'Security Guard' },
      { key: 'extOther', cat: catExterior, short: 'Other Exterior', long: 'Other Exterior Features', type: 'string', val: 'Boat Slip, Dock, Gas Grill' },

      { key: 'area', cat: catDetails, short: 'Area', long: 'Total Area', type: 'number', unit: 'Sq.Ft.', val: 12492, hl: true, hlOrder: 3 },
      { key: 'neighborhood', cat: catDetails, short: 'Neighborhood', long: 'Neighborhood', type: 'string', val: 'Greenwich' },
      { key: 'architecture', cat: catDetails, short: 'Architecture', long: 'Architecture Styles', type: 'string', val: 'Georgian' },
      { key: 'waterFrontage', cat: catDetails, short: 'Water Frontage', long: 'Water Frontage', type: 'string', val: 'LI Sound, Tidal, Waterfront, Waterviews, Winter Waterviews' },

      { key: 'tax', cat: catFinancial, short: 'Real Estate Tax', long: 'Real Estate Tax', type: 'number', unit: '/yr', val: 134122 },
    ]

    const createdMetas = []
    for (const m of metasToCreate) {
      const doc = await client.create({
        _type: 'propertyMeta',
        shortLabel: { en: m.short },
        longLabel: { en: m.long },
        valueType: m.type,
        category: { _type: 'reference', _ref: m.cat._id },
        unit: m.unit ? { en: m.unit } : undefined,
        isHighlighted: m.hl || false,
        highlightOrder: m.hlOrder || 0,
        filter: { isFilterable: false }
      })
      createdMetas.push({ ...m, id: doc._id })
    }

    console.log('5. Uploading images...')
    const assetIds = []
    for (const url of imageUrls) {
      const id = await uploadImage(url)
      assetIds.push(id)
    }

    console.log('6. Creating property...')
    const propertyDoc = {
      _type: 'property',
      title: '545 Indian Field Road | Infinity by the Sea',
      slug: { _type: 'slug', current: '545-indian-field-road-infinity-by-the-sea' },
      description: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'A rare waterfront estate of true scale and presence, this reimagined coastal masterpiece commands 1.6 acres on the Long Island Sound with sweeping, unobstructed horizon views. Rebuilt from the foundation up, the home delivers level beachfront living with powerful architectural lines, floor-to-ceiling glass, and a seamless connection to the water at every turn. The approach opens to a 19-foot entry and a 21-foot great room that presents the Sound as a moving canvas of light and color. Terraces, manicured grounds, and a heated Gunite pool extend the living space outdoors, creating a private resort environment ideal for year-round enjoyment. Six ensuite bedrooms and two half baths include a serene primary wing with balcony, steam shower, and sauna. Savant smart-home systems geothermal efficiency, and refined materials anchor the residence in modern comfort and longevity. A sandy private beach, deep-water dock, and protected cove support boating, paddleboarding, kayaking, swimming, and quiet waterfront mornings. This is coastal living without compromise. Infinity by the Sea. A legacy property where luxury meets the horizon.'
            }
          ],
          markDefs: []
        }
      ],
      price: 42995000,
      status: 'for-sale',
      featured: true,
      location: {
        _type: 'propertyLocation',
        fullAddress: '545 Indian Field Road, Greenwich, CT 06830',
        municipality: 'Greenwich',
      },
      image: { _type: 'image', asset: { _type: 'reference', _ref: assetIds[0] } },
      secondaryImage: { _type: 'image', asset: { _type: 'reference', _ref: assetIds[1] } },
      gallery: assetIds.slice(1).map(id => ({ _type: 'image', asset: { _type: 'reference', _ref: id } })),
      meta: createdMetas.map(m => {
        const metaItem = {
          _key: Math.random().toString(36).substring(7),
          metaKey: { _type: 'reference', _ref: m.id }
        }
        if (m.type === 'number') metaItem.numberValue = m.val
        if (m.type === 'string') metaItem.stringValue = m.val
        if (m.type === 'boolean') metaItem.booleanValue = m.val
        return metaItem
      })
    }

    await client.create(propertyDoc)
    console.log('Seed completed successfully!')

  } catch (err) {
    console.error('Error during seeding:', err)
  }
}

seed()
