import { TrendUpwardIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'

export const valuationSection = defineType({
  name: 'valuationSection',
  title: 'Valuation Section',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'valuation',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body Text',
      type: 'text',
    }),
    defineField({
      name: 'trustText',
      title: 'Trust Text',
      type: 'string',
    }),
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
      description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
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
    defineField({
      name: 'iframeUrl',
      title: 'Iframe URL',
      type: 'url',
    }),
    defineField({
      name: 'showSecondaryCta',
      title: 'Show Secondary CTA',
      type: 'boolean',
      initialValue: false,
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
      description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
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
      title: 'headline',
    },
    prepare({ title }) {
      return {
        title: title || 'No Headline',
        subtitle: 'Valuation Section',
      }
    },
  },
})
