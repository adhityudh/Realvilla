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

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4ea0d?w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80',
  'https://images.unsplash.com/photo-1600570994443-d7a12f1f4567?w=1600&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6f3ea?w=1600&q=80',
  'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1600&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedbae1?w=1600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=80',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1600&q=80'
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
    console.log('1. Uploading gallery images...')
    const uploadedImages = []
    for (let i = 0; i < GALLERY_IMAGES.length; i++) {
      const img = await downloadAndUploadImage(GALLERY_IMAGES[i], `gallery-seed-${i}.jpg`)
      if (img) uploadedImages.push(img)
      process.stdout.write('.')
    }
    console.log(`\nUploaded ${uploadedImages.length} images.`)

    console.log('2. Fetching all properties...')
    const properties = await client.fetch(`*[_type == "property"]{ _id, title }`)
    console.log(`Found ${properties.length} properties.`)

    console.log('3. Updating properties with gallery data...')
    for (const prop of properties) {
      // Pick 5-10 random images for each property
      const shuffled = [...uploadedImages].sort(() => 0.5 - Math.random())
      const gallerySize = Math.floor(Math.random() * 6) + 5 // 5 to 10
      const selectedImages = shuffled.slice(0, gallerySize).map((img, idx) => ({
        ...img,
        _key: `gallery-item-${idx}-${Date.now()}`,
        alt: `Interior view ${idx + 1} of ${prop.title}`
      }))

      await client
        .patch(prop._id)
        .set({ gallery: selectedImages })
        .commit()
      
      process.stdout.write('.')
    }

    console.log('\n✅ Successfully updated all properties with gallery data!')
  } catch (error) {
    console.error('\nError:', error)
  }
}

run()
