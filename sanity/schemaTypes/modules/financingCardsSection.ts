import { defineField, defineType } from 'sanity'
import { ThLargeIcon } from '@sanity/icons'

export const financingCardsSection = defineType({
  name: 'financingCardsSection',
  title: 'Financing Cards Section',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'mainDescription',
      title: 'Main Description (Top-Right Text Block)',
      type: 'text',
      description: 'The contextual copy placed in the top-right of the grid matrix.',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      description: 'The luxury dark interior photo displayed behind the glass cards.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          initialValue: 'REQUEST A MORTGAGE STUDY',
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
          title: 'External Link',
          type: 'string',
          description: 'Full URL (https://...), relative path (/buy), or anchor (#contact).',
          hidden: ({ parent }) => parent?.linkType !== 'external',
        }),
      ]
    }),
    defineField({
      name: 'cards',
      title: 'Financing Option Cards',
      type: 'array',
      description: 'Maximum of 4 cards recommended to populate the layout matrix.',
      of: [
        {
          type: 'object',
          name: 'financingCard',
          title: 'Card Item',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
            }),
            defineField({
              name: 'copy',
              title: 'Copy Paragraph',
              type: 'text',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'mainDescription',
    },
    prepare({ title }) {
      return {
        title: title ? title.substring(0, 40) + '...' : 'Financing Cards Grid',
        subtitle: 'Financing Cards Section',
      }
    },
  },
})
