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

const IMAGES = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4ea0d?w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80',
  'https://images.unsplash.com/photo-1600570994443-d7a12f1f4567?w=1600&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6f3ea?w=1600&q=80',
]

const VIDEOS = [
  'https://www.youtube.com/watch?v=LXb3EKWsInQ', // Costa Rica
  'https://www.youtube.com/watch?v=tO01J-M3g0U', // Tenerife
  'https://www.youtube.com/watch?v=H_Z9Yf-7Y_A'  // Modern House
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
    console.log('1. Uploading base images for seed...')
    const uploadedImages = []
    for (let i = 0; i < IMAGES.length; i++) {
      const img = await downloadAndUploadImage(IMAGES[i], `grouped-seed-${i}.jpg`)
      if (img) uploadedImages.push(img)
      process.stdout.write('.')
    }
    console.log(`\nUploaded ${uploadedImages.length} images.`)

    console.log('2. Fetching all properties...')
    const properties = await client.fetch(`*[_type == "property"]{ _id, title }`)
    console.log(`Found ${properties.length} properties.`)

    console.log('3. Updating properties with flexible gallery...')
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i]
      const isEven = i % 2 === 0
      
      let gallery = []

      if (isEven) {
        // Complex Grouped Structure
        gallery = [
          {
            _key: `group-exterior-${Date.now()}`,
            _type: 'galleryGroup',
            title: 'Exterior',
            items: [
              { ...uploadedImages[0], _key: `item-ext-1-${Date.now()}`, alt: 'Main Front View' },
              { ...uploadedImages[1], _key: `item-ext-2-${Date.now()}`, alt: 'Swimming Pool Area' },
              { _key: `item-vid-1-${Date.now()}`, _type: 'videoItem', url: VIDEOS[0], alt: 'Drone Tour' }
            ]
          },
          {
            _key: `group-interior-${Date.now()}`,
            _type: 'galleryGroup',
            title: 'Interior',
            items: [
              { ...uploadedImages[2], _key: `item-int-1-${Date.now()}`, alt: 'Living Room' },
              { ...uploadedImages[3], _key: `item-int-2-${Date.now()}`, alt: 'Modern Kitchen' },
              { _key: `item-vid-2-${Date.now()}`, _type: 'videoItem', url: VIDEOS[1], alt: 'Interior Walkthrough' }
            ]
          }
        ]
      } else {
        // Mixed Structure (Individual + Group)
        gallery = [
          { ...uploadedImages[5], _key: `indiv-img-1-${Date.now()}`, alt: 'Premium Facade' },
          { _key: `indiv-vid-1-${Date.now()}`, _type: 'videoItem', url: VIDEOS[2], alt: 'Property Overview' },
          {
            _key: `group-details-${Date.now()}`,
            _type: 'galleryGroup',
            title: 'Property Details',
            items: [
              { ...uploadedImages[6], _key: `item-det-1-${Date.now()}`, alt: 'Bathroom' },
              { ...uploadedImages[7], _key: `item-det-2-${Date.now()}`, alt: 'Garden' }
            ]
          }
        ]
      }

      await client
        .patch(prop._id)
        .set({ gallery })
        .commit()
      
      process.stdout.write('.')
    }

    console.log('\n✅ Successfully updated all properties with grouped gallery data!')
  } catch (error) {
    console.error('\nError:', error)
  }
}

run()
