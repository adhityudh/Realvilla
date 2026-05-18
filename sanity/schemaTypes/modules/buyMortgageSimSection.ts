import { ControlsIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const buyMortgageSimSection = defineType({
  name: 'buyMortgageSimSection',
  title: 'Buy Mortgage Sim Section',
  type: 'object',
  icon: ControlsIcon,
  fields: [
    // ── Section Header ──────────────────────────────────────
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

    // ── CTA ──────────────────────────────────────
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
        ],
        layout: 'radio',
      },
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
    }),
    defineField({
      name: 'externalLink',
      title: 'External Link',
      type: 'string',
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),

    // ── Bottom Disclaimer ──────────────────────────────────────
    defineField({
      name: 'disclaimerText',
      title: 'Bottom Disclaimer Text',
      type: 'text',
      description: 'Disclaimer shown below the calculator.',
    }),
  ],
  preview: {
    select: {
      title: 'headline',
    },
    prepare({ title }) {
      return {
        title: title || 'No Headline',
        subtitle: 'Mortgage Simulation Section',
      }
    },
  },
})
