import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const documentLedgerSection = defineType({
  name: 'documentLedgerSection',
  title: 'Document Ledger Section',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Small caption above the title, e.g., "Essential Documentation"',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'The primary heading, e.g., "What You Need to Start"',
    }),
    defineField({
      name: 'intro',
      title: 'Introductory Text',
      type: 'blockContent',
      description: 'Brief contextual description placed below the header.',
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
