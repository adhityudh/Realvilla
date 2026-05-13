import { EnvelopeIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
      description: 'Supporting text shown directly beneath the main headline.'
    }),
    defineField({
      name: 'initialStep',
      title: 'Initial Form Step',
      type: 'string',
      options: {
        list: [
          { title: 'Intent Selector (Initial Multi-Choice)', value: 'intent' },
          { title: 'General Inquiry Form', value: 'general' },
          { title: 'Sell Property Form', value: 'sell' },
        ],
        layout: 'radio'
      },
      initialValue: 'intent',
      description: 'Select which form step appears first by default.'
    }),
    defineField({
      name: 'nextStepAsModal',
      title: 'Display Next Step as Sidebar Modal',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => (parent?.initialStep || 'intent') !== 'intent',
      description: 'If enabled, choosing a choice from the Intent Selector opens the form in a sliding sidebar modal.'
    }),
    defineField({
      name: 'formTitle',
      title: 'Form Title',
      type: 'string',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') !== 'intent',
    }),
    defineField({
      name: 'formSubtitle',
      title: 'Form Subtitle',
      type: 'text',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') !== 'intent',
    }),
    defineField({
      name: 'generalTitle',
      title: 'General Form Title',
      type: 'string',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') === 'sell',
      description: 'Heading text when viewing the General Inquiry form.'
    }),
    defineField({
      name: 'generalSubtitle',
      title: 'General Form Subtitle',
      type: 'text',
      rows: 2,
      hidden: ({ parent }) => (parent?.initialStep || 'intent') === 'sell',
      description: 'Subtitle text when viewing the General Inquiry form.'
    }),
    defineField({
      name: 'sellTitle',
      title: 'Sell Form Title',
      type: 'string',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') === 'general',
      description: 'Heading text when viewing the Sell Property form.'
    }),
    defineField({
      name: 'sellSubtitle',
      title: 'Sell Form Subtitle',
      type: 'text',
      rows: 2,
      hidden: ({ parent }) => (parent?.initialStep || 'intent') === 'general',
      description: 'Subtitle text when viewing the Sell Property form.'
    }),
    defineField({
      name: 'marketData',
      title: 'Market Data',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'marketItem',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string' }),
            defineField({ name: 'prefix', title: 'Prefix', type: 'string' }),
            defineField({ name: 'unit', title: 'Unit', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
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
        subtitle: 'Contact Section',
      }
    },
  },
})
