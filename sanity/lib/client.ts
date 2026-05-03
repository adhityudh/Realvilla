import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  stega: {
    enabled: process.env.NEXT_PUBLIC_SANITY_STEGA === 'true',
    studioUrl: '/studio',
  },
  token: process.env.SANITY_API_READ_TOKEN,
})
