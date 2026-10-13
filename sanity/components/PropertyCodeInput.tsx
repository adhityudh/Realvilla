import React, { useEffect, useState, useCallback, useRef } from 'react'
import { StringInputProps, useClient, useFormValue, set, unset } from 'sanity'

/**
 * Property code input with format RV + 4 digits. E.g. RV0001, RV0002, ..., RV9999.
 *
 * - Editable text field: type a code manually (auto-uppercased).
 * - Leave empty on a new document to auto-generate the next available code
 *   (translations reuse the sibling document's code).
 * - "Regenerate" fills the next available code on demand.
 * - Async validation in the schema (property.ts) rejects duplicates.
 */
export function PropertyCodeInput(props: StringInputProps) {
  const { value, onChange } = props
  const documentId = (useFormValue(['_id']) as string) || ''
  const client = useClient({ apiVersion: '2024-05-02' })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // One-shot auto-generate per mount (reset by Regenerate). A ref (not state)
  // so the guard itself never retriggers the effect; prevents the infinite
  // fetch-retry storm when generation fails while the field is empty.
  const autoTriedRef = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

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
        translations[] { "refId": value._ref }
      }`,
      { publishedId }
    )

    const siblingIds = new Set<string>()
    if (meta?.translations?.length) {
      for (const t of meta.translations) {
        const refId = t.refId
        if (refId) {
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
        `*[_type == "property" && string::startsWith(_id, $baseIdPrefix)] {
          _id,
          propertyCode
        }`,
        { baseIdPrefix: baseId }
      )
      for (const doc of siblingDocs) {
        siblingIds.add(doc._id)
      }
    }

    // Now query all sibling IDs for their propertyCode
    const allIds = Array.from(siblingIds)
    if (allIds.length === 0) return null

    const siblingCodes: string[] = []

    for (const id of allIds) {
      // Normalize — strip drafts prefix for query since we already include both versions
      const normalizedId = id.replace(/^drafts\./, '')
      const doc = await client.fetch<{ propertyCode: string | null } | null>(
        `*[_id == $id || _id == "drafts." + $id][0] { propertyCode }`,
        { id: normalizedId }
      )
      if (doc?.propertyCode) {
        siblingCodes.push(doc.propertyCode)
      }
    }

    if (siblingCodes.length > 0) {
      // Return the smallest property code to ensure consistency across all translations
      siblingCodes.sort()
      return siblingCodes[0]
    }

    return null
  }, [client, documentId])

  /**
   * Race a fetch against a timeout so a hanging request can never leave the
   * input stuck in "Generating..." with no escape hatch.
   */
  const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    let timer: ReturnType<typeof setTimeout>
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Property code request timed out')), ms)
        }),
      ])
    } finally {
      clearTimeout(timer!)
    }
  }

  const runAutoGenerate = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setError(null)

    try {
      // Translations MUST share the sibling's code — always check first.
      const siblingCode = await withTimeout(findSiblingCode(), 12000)
      if (siblingCode) {
        if (mounted.current) onChange(set(siblingCode))
        return
      }

      // Generate the smallest unused code
      const newCode = await withTimeout(generateNextCode(), 12000)
      if (newCode && mounted.current) {
        onChange(set(newCode))
      }
    } catch (err) {
      console.error('Failed to generate property code:', err)
      if (mounted.current) {
        setError('Could not auto-generate a code (request timed out or failed). Type one manually or press Regenerate to retry.')
      }
    } finally {
      if (mounted.current) setIsGenerating(false)
    }
  }, [isGenerating, findSiblingCode, generateNextCode, onChange])

  useEffect(() => {
    // Auto-generate only once per mount and only while the field is empty.
    // Typing a value (or clearing it and typing again) never triggers a fetch.
    if (value || autoTriedRef.current) return
    autoTriedRef.current = true
    runAutoGenerate()
  }, [value, runAutoGenerate])

  const handleRegenerate = () => {
    autoTriedRef.current = true
    runAutoGenerate()
  }

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.toUpperCase().replace(/\s+/g, '')
    if (!clean) {
      onChange(unset())
    } else {
      onChange(set(clean))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          value={value || ''}
          onChange={handleManualChange}
          placeholder="RVXXXX"
          style={{
            width: '100%',
            padding: '7px 12px',
            border: '1px solid var(--card-border-color, #e0e0e0)',
            borderRadius: 4,
            background: 'var(--input-bg, #ffffff)',
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
        Type the code manually (format: RV + 4 digits) or press Regenerate to auto-fill the next available one. Same code is shared across all language versions of this property.
      </p>
    </div>
  )
}