import { defineField, defineType } from 'sanity'

export const mortgageFAQSection = defineType({
  name: 'mortgageFAQSection',
  title: 'Mortgage FAQ Section',
  type: 'object',
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string' }),
            defineField({ name: 'answer', title: 'Answer', type: 'text' }),
          ],
        },
      ],
    }),
    // Primary CTA
    defineField({
      name: 'ctaPrimaryLabel',
      title: 'Primary CTA Label',
      type: 'string',
    }),
    defineField({
      name: 'ctaPrimaryLinkType',
      title: 'Primary Link Type',
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
      name: 'ctaPrimaryInternalLink',
      title: 'Primary Internal Link',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.ctaPrimaryLinkType !== 'internal',
    }),
    defineField({
      name: 'ctaPrimaryExternalLink',
      title: 'Primary External Link',
      type: 'string',
      hidden: ({ parent }) => parent?.ctaPrimaryLinkType !== 'external',
    }),
    // Secondary CTA
    defineField({
      name: 'showSecondaryCta',
      title: 'Show Secondary CTA',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'ctaSecondaryLabel',
      title: 'Secondary CTA Label',
      type: 'string',
      hidden: ({ parent }) => !parent?.showSecondaryCta,
    }),
    defineField({
      name: 'ctaSecondaryLinkType',
      title: 'Secondary Link Type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal Page', value: 'internal' },
          { title: 'External URL', value: 'external' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      hidden: ({ parent }) => !parent?.showSecondaryCta,
    }),
    defineField({
      name: 'ctaSecondaryInternalLink',
      title: 'Secondary Internal Link',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.ctaSecondaryLinkType !== 'internal',
    }),
    defineField({
      name: 'ctaSecondaryExternalLink',
      title: 'Secondary External Link',
      type: 'string',
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.ctaSecondaryLinkType !== 'external',
    }),
  ],
})
