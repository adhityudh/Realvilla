import { DashboardIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const buyHeroSection = defineType({
  name: 'buyHeroSection',
  title: 'Buy Hero Section',
  type: 'object',
  icon: DashboardIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'searchPlaceholder',
      title: 'Search Placeholder',
      type: 'string',
      initialValue: 'Search by Property Name, location, or Municipalities...'
    }),
    defineField({
      name: 'jumpLinks',
      title: 'Jump Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Internal Page', value: 'internal' },
                  { title: 'External URL / Anchor', value: 'external' },
                ],
                layout: 'radio',
              },
              initialValue: 'external',
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
              title: 'External Link / Anchor',
              type: 'string',
              description: 'Can be a full URL, absolute path, or an anchor like #buying-process.',
              hidden: ({ parent }) => parent?.linkType !== 'external',
            }),
          ]
        }
      ]
    }),
    defineField({
      name: 'trendingSearches',
      title: 'Trending Searches',
      description: 'The search recommendation terms displayed inside the Search Modal.',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['Villa', 'Adeje', 'Costa Adeje', 'Arona', 'Santa Cruz'],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'Buy Hero Section',
      }
    },
  },
})
