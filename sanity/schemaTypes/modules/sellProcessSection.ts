import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { ClipboardIcon } from '@sanity/icons'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'

export const sellProcessSection = defineType({
  name: 'sellProcessSection',
  title: 'Sell Process Section',
  type: 'object',
  icon: ClipboardIcon,
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
      initialValue: 'sell-process',
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
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Small subtitle above the headline. E.g. "HOW WE SELL"',
    group: 'content',
}),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Main section heading.',
    group: 'content',
}),
    defineField({
      name: 'intro',
      title: 'Intro Text',
      type: 'blockContent',
      description: 'Optional introductory context.',
    group: 'content',
}),

    defineField({
      name: 'steps',
      title: 'Process Steps',
      type: 'array',
      description: 'Steps explaining the property selling phases.',
      of: [
        {
          type: 'object',
          name: 'step',
          title: 'Step',
          fields: [
            defineField({
              name: 'number',
              title: 'Step Number / Identifier',
              type: 'string',
              description: 'E.g. "01" or "Step 1"',
            }),
            defineField({
              name: 'title',
              title: 'Step Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Step Description',
              type: 'blockContent',
            }),
                        defineField({
              name: 'image',
              title: 'Visual Aid (Background)',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: {
              title: 'title',
              number: 'number',
              media: 'image',
            },
            prepare({ title, number, media }) {
              return {
                title: `${number ? number + '. ' : ''}${title || 'Untitled Step'}`,
                media,
              }
            },
          },
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      group: 'content',
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
      group: 'content',
    }),
    defineField({
      name: 'openInNewWindow',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'Open this link in a new browser tab/window',
      initialValue: false,
      group: 'content',
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
      },
      group: 'content',
    }),
    defineField({
      name: 'internalSection',
      title: 'Internal Page Section',
      type: 'string',
      components: {
        input: InternalSectionSelector,
      },
      hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
      group: 'content',
    }),
    defineField({
      name: 'externalLink',
      title: 'External Link',
      type: 'string',
      description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
      hidden: ({ parent }) => parent?.linkType !== 'external',
      group: 'content',
    }),
    defineField({
      name: 'sectionLink',
      title: 'Section Link',
      type: 'string',
      components: {
        input: SectionSelector,
      },
      hidden: ({ parent }) => parent?.linkType !== 'section',
      group: 'content',
    }),
    defineField({
      name: 'componentLink',
      title: 'Component Link',
      type: 'string',
      components: {
        input: ComponentSelector,
      },
      hidden: ({ parent }) => parent?.linkType !== 'component',
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'headline',
    },
    prepare({ title }) {
      return {
        title: title || 'No Headline',
        subtitle: 'Sell Process Section',
      }
    },
  },
})
