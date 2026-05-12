import { ControlsIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const buyMortgageSimSection = defineType({
  name: 'buyMortgageSimSection',
  title: 'Buy Mortgage Sim Section',
  type: 'object',
  icon: ControlsIcon,
  fields: [
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
      name: 'disclaimerText',
      title: 'Disclaimer Text',
      type: 'string',
      description: 'Text shown at the bottom of inputs, e.g., *Calculations are estimates.'
    }),
    defineField({
      name: 'defaultInterestRate',
      title: 'Default Annual Interest Rate (%)',
      type: 'number',
      description: 'Used for background formula. Default is 3.5% if empty.',
      initialValue: 3.5,
    }),
    defineField({
      name: 'defaultPrice',
      title: 'Default Property Price (€)',
      type: 'number',
      description: 'Initial price preset when first viewing this component (e.g. on the generic Buy page).',
      initialValue: 500000,
    }),
    defineField({
      name: 'downPaymentMin',
      title: 'Minimum Down Payment (%)',
      type: 'number',
      initialValue: 20,
    }),
    defineField({
      name: 'downPaymentMax',
      title: 'Maximum Down Payment (%)',
      type: 'number',
      initialValue: 100,
    }),
    defineField({
      name: 'loanTermMin',
      title: 'Minimum Loan Term (Years)',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'loanTermMax',
      title: 'Maximum Loan Term (Years)',
      type: 'number',
      initialValue: 30,
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
