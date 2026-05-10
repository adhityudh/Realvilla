import { defineField, defineType } from 'sanity'
import { MetaValueInput } from '../../components/MetaValueInput'

export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'media', title: 'Media' },
    { name: 'meta', title: 'Meta & Features' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),

    // ═══════════════════════════════════════
    //  GENERAL
    // ═══════════════════════════════════════
    defineField({
      name: 'title',
      title: 'Property Title',
      type: 'string',
      description: 'Property name or headline. E.g. "Infinity by the Sea".',
      group: 'general',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional tagline. E.g. "A Legacy Where Luxury Meets the Horizon".',
      group: 'general',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) => (doc.title as string) || (doc.address as string) || '',
        maxLength: 96,
        isUnique: async (slug, context) => {
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2024-05-02' })
          const id = document?._id.replace(/^drafts\./, '')
          const language = document?.language

          // Only check uniqueness within the same language
          const query = `*[_type == "property" && slug.current == $slug && language == $language && _id != $id && !(_id in path("drafts.**"))][0]`
          const result = await client.fetch(query, { 
            slug, 
            language: language || null, 
            id 
          })
          
          return !result
        }
      },
      validation: (Rule) => Rule.required(),
      group: 'general',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'Rich text property description.',
      group: 'general',
    }),

    // ── Pricing ──
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Numeric price for display, sorting and filtering. E.g. 42995000. (Currency is fixed to Euro €)',
      group: 'general',
      validation: (Rule) => Rule.min(0),
    }),

    // ── Status ──
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'For Sale', value: 'for-sale' },
          { title: 'Sold', value: 'sold' },
          { title: 'Reserved', value: 'reserved' },
        ],
      },
      initialValue: 'for-sale',
      group: 'general',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      group: 'general',
    }),

    // ── Location ──
    defineField({
      name: 'location',
      title: 'Location',
      type: 'propertyLocation',
      group: 'general',
    }),

    // ── Legacy address field (for backwards compatibility) ──
    defineField({
      name: 'address',
      title: 'Address (Legacy)',
      type: 'string',
      description: 'Legacy field — use Location → Full Address instead. Kept for backward compatibility.',
      group: 'general',
      hidden: true,
    }),

    // ═══════════════════════════════════════
    //  MEDIA
    // ═══════════════════════════════════════
    defineField({
      name: 'image',
      title: 'Primary Image',
      type: 'image',
      description: 'Main image shown on property cards.',
      options: { hotspot: true },
      group: 'media',
    }),
    defineField({
      name: 'secondaryImage',
      title: 'Secondary Image (Hover)',
      type: 'image',
      description: 'Image shown on card hover.',
      options: { hotspot: true },
      group: 'media',
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      description: 'Property media. You can add individual images/videos or group them (e.g., "Interior", "Exterior").',
      group: 'media',
      of: [
        // Option 1: Gallery Group
        {
          type: 'object',
          name: 'galleryGroup',
          title: 'Media Group',
          fields: [
            { name: 'title', type: 'string', title: 'Group Title (e.g. Interior, Exterior)' },
            {
              name: 'items',
              type: 'array',
              title: 'Media Items',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    { name: 'alt', type: 'string', title: 'Alt Text' },
                    { name: 'caption', type: 'string', title: 'Caption' },
                  ],
                  preview: {
                    select: {
                      title: 'caption',
                      alt: 'alt',
                      media: 'asset',
                    },
                    prepare({ title, alt, media }) {
                      return {
                        title: title || alt || 'Untitled Image',
                        subtitle: 'Image',
                        media,
                      }
                    },
                  },
                },
                {
                  type: 'object',
                  name: 'videoItem',
                  title: 'YouTube Video',
                  fields: [
                    { name: 'url', type: 'url', title: 'YouTube URL', validation: Rule => Rule.required().uri({ scheme: ['http', 'https'] }) },
                    { name: 'thumbnail', type: 'image', title: 'Custom Thumbnail (Optional)', options: { hotspot: true } },
                    { name: 'alt', type: 'string', title: 'Alt Text' },
                  ],
                  preview: {
                    select: {
                      url: 'url',
                      alt: 'alt',
                      media: 'thumbnail',
                    },
                    prepare({ url, alt, media }) {
                      return {
                        title: alt || 'YouTube Video',
                        subtitle: url,
                        media,
                      }
                    },
                  },
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'title',
              items: 'items',
            },
            prepare({ title, items }) {
              return {
                title: title || 'Untitled Group',
                subtitle: `${items?.length || 0} items`,
              }
            },
          },
        },
        // Option 2: Individual Image
        {
          type: 'image',
          title: 'Individual Image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
          preview: {
            select: {
              title: 'caption',
              alt: 'alt',
              media: 'asset',
            },
            prepare({ title, alt, media }) {
              return {
                title: title || alt || 'Untitled Image',
                subtitle: 'Individual Image',
                media,
              }
            },
          },
        },
        // Option 3: Individual Video
        {
          type: 'object',
          name: 'videoItem',
          title: 'Individual YouTube Video',
          fields: [
            { name: 'url', type: 'url', title: 'YouTube URL', validation: Rule => Rule.required().uri({ scheme: ['http', 'https'] }) },
            { name: 'thumbnail', type: 'image', title: 'Custom Thumbnail (Optional)', options: { hotspot: true } },
            { name: 'alt', type: 'string', title: 'Alt Text' },
          ],
          preview: {
            select: {
              url: 'url',
              alt: 'alt',
              media: 'thumbnail',
            },
            prepare({ url, alt, media }) {
              return {
                title: alt || 'YouTube Video',
                subtitle: url,
                media,
              }
            },
          },
        },
      ],
    }),

    // ═══════════════════════════════════════
    //  META & FEATURES (Dynamic)
    // ═══════════════════════════════════════
    defineField({
      name: 'meta',
      title: 'Property Meta',
      type: 'array',
      description: 'Dynamic property attributes (beds, baths, sq.ft., amenities, etc.). Select a meta definition and fill in the value.',
      group: 'meta',
      of: [
        {
          type: 'object',
          components: {
            input: MetaValueInput,
          },
          fields: [
            defineField({
              name: 'metaKey',
              title: 'Meta Field',
              type: 'reference',
              to: [{ type: 'propertyMeta' }],
              description: 'Select which meta field this value is for.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'numberValue',
              title: 'Number Value',
              type: 'number',
              description: 'Value for number-type meta fields.',
            }),
            defineField({
              name: 'stringValue',
              title: 'Text Value',
              type: 'string',
              description: 'Value for text-type meta fields.',
            }),
            defineField({
              name: 'booleanValue',
              title: 'Yes/No Value',
              type: 'boolean',
              description: 'Value for boolean-type meta fields.',
            }),
          ],
          preview: {
            select: {
              metaKey: 'metaKey.shortLabel.en',
              numberValue: 'numberValue',
              stringValue: 'stringValue',
              booleanValue: 'booleanValue',
            },
            prepare({ metaKey, numberValue, stringValue, booleanValue }) {
              const value = numberValue ?? stringValue ?? (booleanValue !== undefined ? (booleanValue ? 'Yes' : 'No') : '—')
              return {
                title: metaKey || 'No meta selected',
                subtitle: `${value}`,
              }
            },
          },
        },
      ],
    }),

    // ── Legacy fields (kept hidden for backward compatibility) ──
    defineField({
      name: 'beds',
      title: 'Beds (Legacy)',
      type: 'number',
      hidden: true,
    }),
    defineField({
      name: 'baths',
      title: 'Baths (Legacy)',
      type: 'number',
      hidden: true,
    }),
    defineField({
      name: 'sqft',
      title: 'Sq.Ft. (Legacy)',
      type: 'string',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      address: 'location.fullAddress',
      legacyAddress: 'address',
      price: 'price',
      legacyPrice: 'price',
      media: 'image',
      language: 'language',
    },
    prepare({ title, address, legacyAddress, price, legacyPrice, media, language }) {
      const displayTitle = title || address || legacyAddress || 'Untitled Property'
      const displayPrice = price ? `${price}` : (legacyPrice ? `${legacyPrice}` : '')
      return {
        title: `${language ? `[${language.toUpperCase()}] ` : ''}${displayTitle}`,
        subtitle: displayPrice,
        media,
      }
    },
  },
})
