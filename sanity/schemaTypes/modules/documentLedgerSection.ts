import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'

export const documentLedgerSection = defineType({
  name: 'documentLedgerSection',
  title: 'Document Ledger Section',
  type: 'object',
  icon: DocumentTextIcon,
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
      initialValue: 'document-ledger',
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
      description: 'Small caption above the title, e.g., "Essential Documentation"',
    group: 'content',
}),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'The primary heading, e.g., "What You Need to Start"',
    group: 'content',
}),
    defineField({
      name: 'intro',
      title: 'Introductory Text',
      type: 'blockContent',
      description: 'Brief contextual description placed below the header.',
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
          initialValue: 'PRE-APPROVE NOW',
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
      name: 'items',
      title: 'Document Checklist Items',
      type: 'array',
      description: 'A stack of documented items arranged in a clean ledger.',
      of: [
        {
          type: 'object',
          name: 'ledgerItem',
          title: 'Ledger Item',
          fields: [
            defineField({
              name: 'number',
              title: 'Number / Label',
              type: 'string',
              description: 'E.g., "01" or "Req".',
            }),
            defineField({
              name: 'title',
              title: 'Document Title',
              type: 'string',
              description: 'E.g., "Valid Passport or ID".',
            }),
            defineField({
              name: 'hint',
              title: 'Short Hint / Subtext',
              type: 'string',
              description: 'Subtle hint, e.g., "Both original and copies".',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              number: 'number',
            },
            prepare({ title, number }) {
              return {
                title: `${number ? number + '. ' : ''}${title || 'Untitled Item'}`,
              }
            },
          },
        },
      ],
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
        subtitle: 'Document Ledger Section',
      }
    },
  },
})
