import { defineField, defineType } from 'sanity'

export const propertiesSection = defineType({
  name: 'propertiesSection',
  title: 'Properties Section',
  type: 'object',
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
    }),
    defineField({
      name: 'selectionType',
      title: 'Selection Type',
      type: 'string',
      options: {
        list: [
          { title: 'Latest / Dynamic Query', value: 'dynamic' },
          { title: 'Manual Selection', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'dynamic',
    }),
    // Settings for Dynamic Query
    defineField({
      name: 'limit',
      title: 'Number of Properties',
      type: 'number',
      description: 'How many properties to display.',
      initialValue: 3,
      hidden: ({ parent }) => parent?.selectionType !== 'dynamic',
    }),
    defineField({
      name: 'orderBy',
      title: 'Order By',
      type: 'string',
      options: {
        list: [
          { title: 'Newest First', value: '_createdAt desc' },
          { title: 'Price (High to Low)', value: 'price desc' },
          { title: 'Price (Low to High)', value: 'price asc' },
        ],
      },
      initialValue: '_createdAt desc',
      hidden: ({ parent }) => parent?.selectionType !== 'dynamic',
    }),
    defineField({
      name: 'showSold',
      title: 'Show Sold Properties',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => parent?.selectionType !== 'dynamic',
    }),
    // Settings for Manual Selection
    defineField({
      name: 'manualProperties',
      title: 'Select Properties',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'property' }] }],
      hidden: ({ parent }) => parent?.selectionType !== 'manual',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      initialValue: 'View All Properties',
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal Page', value: 'internal' },
          { title: 'External URL', value: 'external' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
    }),
    defineField({
      name: 'internalLink',
      title: 'Internal Link',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'externalLink',
      title: 'External Link',
      type: 'string',
      description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),
  ],
  preview: {
    select: {
      title: 'headline',
    },
    prepare({ title }) {
      return {
        title: title || 'No Headline',
        subtitle: 'Properties Section',
      }
    },
  },
})
