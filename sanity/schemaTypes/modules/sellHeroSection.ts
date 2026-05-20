import { DashboardIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

export const sellHeroSection = defineType({
  name: 'sellHeroSection',
  title: 'Sell Hero Section',
  type: 'object',
  icon: DashboardIcon,
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
      initialValue: 'sell-hero',
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
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
}),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 3,
      group: 'content',
}),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      group: 'content',
}),
    defineField({
      name: 'searchPlaceholder',
      title: 'Search Placeholder',
      type: 'string',
      initialValue: 'Enter your property address...',
      group: 'content',
}),
    defineField({
      name: 'modalTitle',
      title: 'Modal Form Title',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'modalSubtitle',
      title: 'Modal Form Subtitle',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'hideWhatsApp',
      title: 'Hide WhatsApp Option',
      type: 'boolean',
      initialValue: true,
      group: 'content',
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
              title: 'External URL',
              type: 'string',
              description: 'Can be a full URL (https://...) or a relative path.',
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
      ],
    group: 'content',
}),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'Sell Hero Section',
      }
    },
  },
})
