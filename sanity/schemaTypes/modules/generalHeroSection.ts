import { DashboardIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

export const generalHeroSection = defineType({
  name: 'generalHeroSection',
  title: 'General Hero Section',
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
      initialValue: 'general-hero',
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
      description: 'Displays as elegant text replacing the search bar in this hero variant.',
      type: 'text',
      rows: 3,
      group: 'content',
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
      group: 'content',
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
              { title: 'External URL', value: 'external' },
              { title: 'Section', value: 'section' },
              { title: 'Component', value: 'component' },
            ],
            layout: 'radio',
          },
          initialValue: 'external',
        }),
        defineField({
          name: 'openInNewWindow',
          title: 'Open in New Tab',
          type: 'boolean',
          description: 'Open this link in a new browser tab/window',
          initialValue: false,
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
      ],
      group: 'content',
}),
    defineField({
      name: 'secondaryButton',
      title: 'Secondary Button',
      description: 'Alternative call to action button displayed next to the primary button.',
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
          name: 'openInNewWindow',
          title: 'Open in New Tab',
          type: 'boolean',
          description: 'Open this link in a new browser tab/window',
          initialValue: false,
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
      ],
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
              name: 'openInNewWindow',
              title: 'Open in New Tab',
              type: 'boolean',
              description: 'Open this link in a new browser tab/window',
              initialValue: false,
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
        subtitle: 'General Hero Section',
      }
    },
  },
})
