import { DashboardIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const generalHeroSection = defineType({
  name: 'generalHeroSection',
  title: 'General Hero Section',
  type: 'object',
  icon: DashboardIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      description: 'Displays as elegant text replacing the search bar in this hero variant.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'desktopLayout',
      title: 'Desktop Layout Variant',
      description: 'Choose how the content aligns on desktop viewports for maximum spatial efficiency.',
      type: 'string',
      options: {
        list: [
          { title: 'Vertical (Centered stack, matching Buy Hero)', value: 'vertical' },
          { title: 'Horizontal (Side-by-side split columns)', value: 'horizontal' },
        ],
        layout: 'radio',
      },
      initialValue: 'vertical',
    }),
    defineField({
      name: 'primaryButton',
      title: 'Primary Button',
      description: 'Main call to action button displayed below the subtitle.',
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
          description: 'Can be a full URL, relative path, or anchor (#).',
          hidden: ({ parent }) => parent?.linkType !== 'external',
        }),
      ]
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true }
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
              description: 'Can be a full URL, relative path, or anchor (#).',
              hidden: ({ parent }) => parent?.linkType !== 'external',
            }),
          ]
        }
      ]
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'General Hero Section',
      }
    },
  },
})
