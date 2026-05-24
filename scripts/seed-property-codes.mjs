import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

/**
 * Strip language suffix from document ID.
 * E.g. "property-1-es" -> "property-1"
 *       "drafts.property-1-en" -> "property-1"
 */
function getBaseId(id) {
  return id
    .replace(/^drafts\./, '')
    .replace(/-(es|en|fr|de|it|pt|nl|ru|zh|ja|ko|ar|hi|th|vi|pl|tr|ro|hu|cs|sv|da|fi|nb|el|he|id|ms|tl|bn|ta|te|mr|gu|kn|ml|pa)$/, '')
}

async function run() {
  console.log('=== Property Code Migration (v3 — properties only) ===\n')

  // ── Step 1: Cleanup non-property docs ──
  const nonPropertyWithCode = await client.fetch(
    `*[_type != "property" && defined(propertyCode)] { _id, _type, propertyCode }`
  )
  if (nonPropertyWithCode.length > 0) {
    console.log(`Removing propertyCode from ${nonPropertyWithCode.length} non-property docs:`)
    for (const doc of nonPropertyWithCode) {
      await client.patch(doc._id).unset(['propertyCode']).commit()
      console.log(`  ✗ ${doc._id} (${doc._type}) had code ${doc.propertyCode} — removed`)
    }
    console.log('')
  }

  // ── Step 2: Fetch all property docs ──
  const allDocs = await client.fetch(
    `*[_type == "property"] { _id, propertyCode, title, language } | order(_createdAt asc)`
  )
  console.log(`Found ${allDocs.length} property documents.\n`)

  // ── Step 3: Group by base ID ──
  const groups = new Map() // baseId -> [{ id, code, title, lang }]
  const orderedBaseIds = [] // preserve creation order

  for (const doc of allDocs) {
    const baseId = getBaseId(doc._id)
    if (!groups.has(baseId)) {
      groups.set(baseId, [])
      orderedBaseIds.push(baseId)
    }
    groups.get(baseId).push(doc)
  }

  console.log(`Grouped into ${groups.size} properties (each base = 1 property regardless of language):\n`)

  // ── Step 4: Find max existing code number ──
  let maxNum = 0
  const existingGroupCodes = new Map() // baseId -> existing code
  for (const [baseId, docs] of groups) {
    for (const doc of docs) {
      const match = doc.propertyCode?.match(/^RV(\d{4})$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
        if (!existingGroupCodes.has(baseId)) {
          existingGroupCodes.set(baseId, doc.propertyCode)
        }
        break
      }
    }
  }

  if (maxNum > 0) {
    console.log(`Highest existing code number: ${maxNum} (${'RV' + String(maxNum).padStart(4, '0')})\n`)
  }

  // ── Step 5: Assign same code to all docs in each group ──
  let nextCode = maxNum + 1
  const updates = []
  // Track codes we assign so we detect duplicates
  const assignedCodes = new Map() // code -> baseId

  for (const baseId of orderedBaseIds) {
    const docs = groups.get(baseId)

    // Use existing code if any doc in this group already has one
    let code = existingGroupCodes.get(baseId) || null

    if (!code) {
      code = `RV${String(nextCode++).padStart(4, '0')}`
    }

    // Check for duplicate code (shouldn't happen but just in case)
    if (assignedCodes.has(code) && assignedCodes.get(code) !== baseId) {
      console.log(`  ⚠ Duplicate code ${code} — generating new one`)
      code = `RV${String(nextCode++).padStart(4, '0')}`
    }
    assignedCodes.set(code, baseId)

    const langs = docs.map(d => d.language || '?').join(', ')
    const titles = docs.map(d => d.title || 'untitled').filter((v, i, a) => a.indexOf(v) === i)
    console.log(`  ${code} → [${langs}] ${titles[0] || baseId}`)

    for (const doc of docs) {
      const cleanId = doc._id.replace(/^drafts\./, '')
      updates.push({ id: cleanId, code })
    }
  }

  // ── Step 6: Apply all updates ──
  console.log(`\nApplying ${updates.length} updates...`)
  let successCount = 0

  for (const update of updates) {
    try {
      // Fetch current doc to see if it already has the correct code
      const current = await client.fetch(
        `*[_id == $id][0] { propertyCode }`,
        { id: update.id }
      )

      if (current?.propertyCode === update.code) {
        successCount++
        continue // skip if already correct
      }

      await client.patch(update.id).set({ propertyCode: update.code }).commit()
      successCount++
    } catch (err) {
      console.error(`  ✗ Failed ${update.id}: ${err.message}`)
    }
  }

  console.log(`\n✅ Updated ${successCount}/${updates.length} documents.`)
  console.log(`   Next available code: RV${String(nextCode).padStart(4, '0')}`)
}

run().catch(console.error)