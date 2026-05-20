import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { ThLargeIcon } from '@sanity/icons'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

export const financingCardsSection = defineType({
  name: 'financingCardsSection',
  title: 'Financing Cards Section',
  type: 'object',
  icon: ThLargeIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'advanced', title: 'Advanced' },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'financing-cards',
    group: 'advanced',
}),
    defineField({
      name: 'disableEntranceAnimation',
      title: 'Disable Entrance Animation',
      description: 'If checked, the section will load immediately without fade-in/slide-up animations.',
      type: 'boolean',
      initialValue: false,
      group: 'advanced',
    }),
    defineField({
      name: 'disableHeaderEntranceAnimation',
      title: 'Disable Header Entrance Animation',
      description: 'If checked, the section header (tagline, headline, intro) will load immediately without entrance animations.',
      type: 'boolean',
      initialValue: false,
      group: 'advanced',
    }),
    defineField({
      name: 'mainDescription',
      title: 'Main Description (Top-Right Text Block)',
      type: 'text',
      description: 'The contextual copy placed in the top-right of the grid matrix.',
      group: 'content',
}),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      description: 'The luxury dark interior photo displayed behind the glass cards.',
      options: {
        hotspot: true,
      },
      group: 'content',
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
              { title: 'Section', value: 'section' },
              { title: 'Component', value: 'component' },
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
          name: 'internalSection',
          title: 'Internal Page Section',
          type: 'string',
          components: {
            input: InternalSectionSelector,
          },
          hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
        }),
        defineField({
          name: 'externalLink',
          title: 'External Link',
          type: 'string',
          description: 'Full URL (https://...), relative path (/buy), or anchor (#contact).',
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
      ],
      group: 'content',
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
    group: 'content',
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
