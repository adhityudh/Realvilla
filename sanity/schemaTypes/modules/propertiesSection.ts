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
  ],
})
