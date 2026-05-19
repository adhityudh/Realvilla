import { DashboardIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'

export const buyHeroSection = defineType({
  name: 'buyHeroSection',
  title: 'Buy Hero Section',
  type: 'object',
  icon: DashboardIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'buy-hero',
    }),
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
                  { title: 'External URL', value: 'external' },
                  { title: 'Section', value: 'section' },
                  { title: 'Component', value: 'component' },
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
              options: {
                filter: ({ document }) => {
                  const language = document?.language;
                  if (!language) return {};
                  return {
                    filter: 'language == $language || !defined(language)',
                    params: { language }
                  };
                }
              }
            }),
            defineField({
              name: 'externalLink',
              title: 'External URL',
              type: 'string',
              description: 'Can be a full URL (https://...) or a relative path (/buy).',
              hidden: ({ parent }) => parent?.linkType !== 'external',
            }),
            defineField({
              name: 'sectionLink',
              title: 'Section Link',
              type: 'string',
              components: {
                input: SectionSelector,
              },
              hidden: ({ parent }) => parent?.linkType !== 'section',
            }),
            defineField({
              name: 'componentLink',
              title: 'Component Link',
              type: 'string',
              components: {
                input: ComponentSelector,
              },
              hidden: ({ parent }) => parent?.linkType !== 'component',
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
