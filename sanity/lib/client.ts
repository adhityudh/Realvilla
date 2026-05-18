import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Public client for standard visitors (super-fast, hits Sanity Edge CDN in production, no token)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  stega: {
    enabled: process.env.NEXT_PUBLIC_SANITY_STEGA === 'true',
    studioUrl: '/studio',
  },
})

// Preview client for draft reviews (bypasses CDN, authenticated with token)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  stega: {
    enabled: true,
    studioUrl: '/studio',
  },
})

/**
 * Returns the appropriate Sanity client based on whether draft/preview mode is active.
 */
export function getClient(usePreview = false) {
  return usePreview ? previewClient : client
}
