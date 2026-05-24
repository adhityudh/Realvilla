import { defineField, defineType } from 'sanity'
import { MetaValueInput } from '../../components/MetaValueInput'
import { PropertyCodeInput } from '../../components/PropertyCodeInput'

export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'media', title: 'Media' },
    { name: 'meta', title: 'Meta & Features' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      group: 'general',
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
      name: 'propertyCode',
      title: 'Property Code',
      type: 'string',
      description: 'Unique property identifier with format RV + 4 digits (e.g. RV0001). Auto-generated and read-only.',
      components: {
        input: PropertyCodeInput,
      },
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return 'Property code is required.'
          if (!/^RV\d{4}$/.test(value)) return 'Must be in format RV followed by 4 digits (e.g. RV0001).'
          return true
        }),
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


    // ── Location ──
    defineField({
      name: 'location',
      title: 'Location',
      type: 'propertyLocation',
      group: 'general',
      options: {
        collapsible: false,
      }
    }),
    defineField({
      name: 'category',
      title: 'Property Category',
      type: 'reference',
      to: [{ type: 'propertyCategory' }],
      description: 'Primary property type classification (e.g., Villa, Apartment).',
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
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      description: 'Property media groups. Create groups for photos, videos, or virtual tours.',
      group: 'media',
      of: [
        // Media Group (only option)
        {
          type: 'object',
          name: 'galleryGroup',
          title: 'Media Group',
          fields: [
            { name: 'title', type: 'string', title: 'Group Title (e.g. Photos, Videos, Virtual Tour)', validation: (Rule) => Rule.required() },
            {
              name: 'mediaType',
              type: 'string',
              title: 'Media Type',
              description: 'Choose between regular media (photos/videos) or virtual tour (Floorfy)',
              options: {
                list: [
                  { title: 'Regular Media', value: 'regular' },
                  { title: 'Virtual Tour (Floorfy)', value: 'virtualTour' },
                ],
                layout: 'radio',
              },
              initialValue: 'regular',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'floorfyUrl',
              type: 'url',
              title: 'Floorfy URL',
              description: 'Enter the Floorfy virtual tour embed URL',
              hidden: ({ parent }) => parent?.mediaType !== 'virtualTour',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as any;
                  if (parent?.mediaType === 'virtualTour' && !value) {
                    return 'Floorfy URL is required for virtual tour';
                  }
                  return true;
                }).uri({ scheme: ['http', 'https'] }),
            },
            {
              name: 'thumbnail',
              type: 'image',
              title: 'Virtual Tour Thumbnail',
              description: 'Thumbnail image for the virtual tour (shown in gallery grid)',
              options: { hotspot: true },
              hidden: ({ parent }) => parent?.mediaType !== 'virtualTour',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as any;
                  if (parent?.mediaType === 'virtualTour' && !value) {
                    return 'Thumbnail is required for virtual tour';
                  }
                  return true;
                }),
            },
            {
              name: 'items',
              type: 'array',
              title: 'Media Items',
              description: 'Add images and videos to this group',
              hidden: ({ parent }) => parent?.mediaType === 'virtualTour',
              validation: (Rule) =>
                Rule.custom((value: any[] | undefined, context) => {
                  const parent = context.parent as any;
                  if (parent?.mediaType !== 'virtualTour' && (!value || value.length === 0)) {
                    return 'Please add at least one media item to this group';
                  }
                  return true;
                }),
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    { name: 'caption', type: 'string', title: 'Caption' },
                  ],
                  preview: {
                    select: {
                      title: 'caption',
                      media: 'asset',
                    },
                    prepare({ title, media }) {
                      return {
                        title: title || 'Untitled Image',
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
                  ],
                  preview: {
                    select: {
                      url: 'url',
                      media: 'thumbnail',
                    },
                    prepare({ url, media }) {
                      return {
                        title: 'YouTube Video',
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
              mediaType: 'mediaType',
              floorfyUrl: 'floorfyUrl',
              thumbnail: 'thumbnail',
            },
            prepare({ title, items, mediaType, floorfyUrl, thumbnail }) {
              if (mediaType === 'virtualTour') {
                return {
                  title: title || 'Untitled Virtual Tour',
                  subtitle: floorfyUrl ? 'Virtual Tour (Floorfy)' : 'Virtual Tour (No URL)',
                  media: thumbnail,
                };
              }
              return {
                title: title || 'Untitled Group',
                subtitle: `${items?.length || 0} items`,
              };
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
              options: {
                filter: '!defined(children) || count(children) == 0',
              },
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
            defineField({
              name: 'selectValue',
              title: 'Selected Value',
              type: 'string',
              description: 'Value for single-select meta fields.',
            }),
            defineField({
              name: 'selectArrayValue',
              title: 'Selected Values',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Values for multi-select meta fields.',
            }),
          ],
          preview: {
            select: {
              metaKey: 'metaKey.shortLabel.en',
              numberValue: 'numberValue',
              stringValue: 'stringValue',
              booleanValue: 'booleanValue',
              selectValue: 'selectValue',
              selectArrayValue: 'selectArrayValue',
            },
            prepare({ metaKey, numberValue, stringValue, booleanValue, selectValue, selectArrayValue }) {
              let value: string | number | boolean = '—'
              
              if (numberValue !== undefined) value = numberValue
              else if (stringValue !== undefined) value = stringValue
              else if (booleanValue !== undefined) value = booleanValue ? 'Yes' : 'No'
              else if (selectValue !== undefined) value = selectValue
              else if (Array.isArray(selectArrayValue) && selectArrayValue.length > 0) value = selectArrayValue.join(', ')
              
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
      group: 'general',
    }),
    defineField({
      name: 'baths',
      title: 'Baths (Legacy)',
      type: 'number',
      hidden: true,
      group: 'general',
    }),
    defineField({
      name: 'sqft',
      title: 'Sq.Ft. (Legacy)',
      type: 'string',
      hidden: true,
      group: 'general',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Override',
      description: 'Customize how this property appears in Search engines and social media. Leave blank to auto-generate from property name.',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Recently Updated',
      name: 'updatedAtDesc',
      by: [
        {field: '_updatedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Price: High to Low',
      name: 'priceDesc',
      by: [
        {field: 'price', direction: 'desc'}
      ]
    },
    {
      title: 'Price: Low to High',
      name: 'priceAsc',
      by: [
        {field: 'price', direction: 'asc'}
      ]
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [
        {field: 'status', direction: 'asc'}
      ]
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Language',
      name: 'languageAsc',
      by: [
        {field: 'language', direction: 'asc'}
      ]
    }
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
      status: 'status',
    },
    prepare({ title, address, legacyAddress, price, legacyPrice, media, language, status }) {
      const displayTitle = title || address || legacyAddress || 'Untitled Property'
      const actualPrice = price ?? legacyPrice
      const formattedPrice = actualPrice 
        ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(actualPrice) 
        : ''
      const displayStatus = status ? status.toUpperCase().replace('-', ' ') : 'FOR SALE'
      
      return {
        title: `${language ? `[${language.toUpperCase()}] ` : ''}${displayTitle}`,
        subtitle: `${formattedPrice}${formattedPrice && displayStatus ? ' • ' : ''}${displayStatus}`,
        media,
      }
    },
  },
})
