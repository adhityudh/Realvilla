import React, { useEffect, useState, useCallback } from 'react'
import { StringInputProps, useClient, useFormValue, set } from 'sanity'

/**
 * Custom Sanity input that auto-generates a property code with format RV + 4 digits.
 * E.g. RV0001, RV0002, ..., RV9999.
 *
 * - For new documents: generates the next available unique code.
 * - For translations (same property, different language): reuses the code from sibling documents.
 * - For existing documents: keeps the previously assigned code unchanged.
 * - Allows manual regeneration via "Regenerate" button.
 */
export function PropertyCodeInput(props: StringInputProps) {
  const { value, onChange } = props
  const documentId = (useFormValue(['_id']) as string) || ''
  const client = useClient({ apiVersion: '2024-05-02' })
  const [generated, setGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Strip language suffixes from a document ID to get the base ID.
   * Sanity documentInternationalization appends language codes like "-es", "-en", "-fr", etc.
   * Also strips "drafts." prefix.
   *
   * E.g. "drafts.property-1-es" -> "property-1"
   *       "property-2-es" -> "property-2"
   *       "property-3" -> "property-3"
   */
  const getBaseId = (id: string): string => {
    let clean = id.replace(/^drafts\./, '')
    // Strip language suffix if present (e.g. -es, -en)
    // Language codes are 2-3 letter codes
    clean = clean.replace(/-(es|en|fr|de|it|pt|nl|ru|zh|ja|ko|ar|hi|th|vi|pl|tr|ro|hu|cs|sv|da|fi|nb|el|he|id|ms|tl|bn|ta|te|mr|gu|kn|ml|pa)$/, '')
    return clean
  }

  /**
   * Generate the smallest unused property code.
   * Fills gaps from deleted properties before generating a new highest number.
   * E.g. if RV0001, RV0003 exist (RV0002 was deleted), returns RV0002.
   */
  const generateNextCode = useCallback(async (): Promise<string | null> => {
    const existingCodes: string[] = await client.fetch(
      `*[_type == "property" && defined(propertyCode)].propertyCode`
    )

    const usedNums = new Set<number>()
    for (const code of existingCodes) {
      const match = code?.match(/^RV(\d{4})$/)
      if (match) {
        usedNums.add(parseInt(match[1], 10))
      }
    }

    // Find the smallest positive integer not already in use
    let nextNum = 1
    while (usedNums.has(nextNum)) {
      nextNum++
    }

    if (nextNum > 9999) {
      setError('Maximum number of properties reached (RV9999).')
      return null
    }

    return `RV${String(nextNum).padStart(4, '0')}`
  }, [client])

  /**
   * Find if a sibling translation already has a property code.
   * Uses two strategies:
   *   1. Query translation.metadata to find all translations of this document
   *   2. Fallback: find other documents sharing the same base ID
   */
  const findSiblingCode = useCallback(async (): Promise<string | null> => {
    const publishedId = documentId.replace(/^drafts\./, '')

    // Strategy 1: Query translation.metadata
    const meta = await client.fetch<any>(
      `*[_type == "translation.metadata" && references($publishedId)][0]{
        translations[] { "refId": value->._id }
      }`,
      { publishedId }
    )

    const siblingIds = new Set<string>()
    if (meta?.translations?.length) {
      for (const t of meta.translations) {
        const refId = t.refId
        if (refId && refId !== publishedId && refId !== documentId) {
          siblingIds.add(refId)
          siblingIds.add(`drafts.${refId}`)
        }
      }
    }

    // Strategy 2: Fallback — extract base ID and find siblings sharing it
    const baseId = getBaseId(publishedId)
    if (baseId && baseId !== publishedId) {
      // Find docs that have the same base ID with any language suffix
      const siblingDocs = await client.fetch<{ _id: string; propertyCode: string | null }[]>(
        `*[_type == "property" && _id != $docId && _id != $publishedId && !(_id in ["drafts." + $docId, "drafts." + $publishedId]) && string::startsWith(_id, $baseIdPrefix)] {
          _id,
          propertyCode
        }`,
        {
          docId: documentId,
          publishedId,
          baseIdPrefix: baseId,
        }
      )
      for (const doc of siblingDocs) {
        if (doc?.propertyCode) siblingIds.add(doc._id)
      }

      // Also check drafts of those
      for (const doc of siblingDocs) {
        const draftId = `drafts.${doc._id.replace(/^drafts\./, '')}`
        if (draftId !== documentId) {
          const draftDoc = await client.fetch<{ propertyCode: string | null } | null>(
            `*[_id == $id][0] { propertyCode }`,
            { id: draftId }
          )
          if (draftDoc?.propertyCode) siblingIds.add(draftId)
        }
      }
    }

    // Now query all sibling IDs for their propertyCode
    const allIds = Array.from(siblingIds)
    if (allIds.length === 0) return null

    for (const id of allIds) {
      // Normalize — strip drafts prefix for query since we already include both versions
      const normalizedId = id.replace(/^drafts\./, '')
      const doc = await client.fetch<{ propertyCode: string | null } | null>(
        `*[_id == $id || _id == "drafts." + $id][0] { propertyCode }`,
        { id: normalizedId }
      )
      if (doc?.propertyCode) return doc.propertyCode
    }

    return null
  }, [client, documentId])

  useEffect(() => {
    // Skip if already generated/generating, unless the user explicitly clicked Regenerate
    if (generated || isGenerating) return
    if (value && !isRegenerating) return

    const init = async () => {
      setIsGenerating(true)
      setError(null)

      try {
        // For Regenerate: skip sibling lookup and go straight to a new unique code
        if (!isRegenerating) {
          const siblingCode = await findSiblingCode()
          if (siblingCode) {
            onChange(set(siblingCode))
            setGenerated(true)
            setIsRegenerating(false)
            return
          }
        }

        // Generate the smallest unused code
        const newCode = await generateNextCode()
        if (newCode) {
          onChange(set(newCode))
        }
        setGenerated(true)
      } catch (err) {
        console.error('Failed to generate property code:', err)
        setError('Failed to generate property code. Please try saving again.')
      } finally {
        setIsGenerating(false)
        setIsRegenerating(false)
      }
    }

    init()
  }, [generated, isGenerating, isRegenerating, value, onChange, findSiblingCode, generateNextCode])

  const handleRegenerate = () => {
    setIsRegenerating(true)
    setGenerated(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          readOnly
          value={value || (isGenerating ? 'Generating...' : '')}
          placeholder="RVXXXX"
          style={{
            width: '100%',
            padding: '7px 12px',
            border: '1px solid var(--card-border-color, #e0e0e0)',
            borderRadius: 4,
            background: 'var(--input-bg, #f5f5f5)',
            color: 'var(--text-color, #333)',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 1,
            fontFamily: 'monospace',
          }}
        />
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isGenerating}
          style={{
            padding: '7px 12px',
            border: '1px solid var(--card-border-color, #e0e0e0)',
            borderRadius: 4,
            background: 'var(--input-bg, #f5f5f5)',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontSize: 13,
            whiteSpace: 'nowrap',
          }}
          title="Generate a new unique code"
        >
          {isGenerating ? '...' : '↻ Regenerate'}
        </button>
      </div>
      {error && (
        <p style={{ color: 'var(--red-600, #e53e3e)', fontSize: 13, marginTop: 6 }}>
          {error}
        </p>
      )}
      <p style={{ fontSize: 12, color: 'var(--text-color-secondary, #666)', marginTop: 4, marginBottom: 0 }}>
        Auto-generated property code (format: RV + 4 digits). Same code is shared across all language versions of this property.
      </p>
    </div>
  )
}