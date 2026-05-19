import { HelpCircleIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'

export const mortgageFAQSection = defineType({
  name: 'mortgageFAQSection',
  title: 'Mortgage FAQ Section',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'mortgage',
    }),
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
      name: 'description',
      title: 'Description',
      type: 'text',
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
    // Primary CTA (Consistent with other sections)
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
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
    // Secondary CTA
    defineField({
      name: 'showSecondaryCta',
      title: 'Show Secondary CTA',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Secondary CTA Label',
      type: 'string',
      hidden: ({ parent }) => !parent?.showSecondaryCta,
    }),
    defineField({
      name: 'secondaryLinkType',
      title: 'Secondary Link Type',
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
      hidden: ({ parent }) => !parent?.showSecondaryCta,
    }),
    defineField({
      name: 'secondaryInternalLink',
      title: 'Secondary Internal Link',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'internal',
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
      name: 'secondaryExternalLink',
      title: 'Secondary External Link',
      type: 'string',
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'external',
    }),
    defineField({
      name: 'secondarySectionLink',
      title: 'Secondary Section Link',
      type: 'string',
      components: {
        input: SectionSelector,
      },
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'section',
    }),
    defineField({
      name: 'secondaryComponentLink',
      title: 'Secondary Component Link',
      type: 'string',
      components: {
        input: ComponentSelector,
      },
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'component',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'Mortgage FAQ Section',
      }
    },
  },
})
