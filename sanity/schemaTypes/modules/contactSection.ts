import { EnvelopeIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'

export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'object',
  icon: EnvelopeIcon,
  groups: [
    { name: 'header', title: 'Header & Layout', default: true },
    { name: 'intent', title: 'Intent Step' },
    { name: 'general', title: 'General Form' },
    { name: 'sell', title: 'Sell Form' },
    { name: 'mortgage', title: 'Mortgage Form' },
    { name: 'advanced', title: 'Advanced' },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'contact',
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
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'header',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
      group: 'header',
      description: 'Supporting text shown directly beneath the main headline.'
    }),
    defineField({
      name: 'marketData',
      title: 'Market Data',
      type: 'array',
      group: 'header',
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
    defineField({
      name: 'initialStep',
      title: 'Initial Form Step',
      type: 'string',
      group: 'header',
      options: {
        list: [
          { title: 'Intent Selector (Initial Multi-Choice)', value: 'intent' },
          { title: 'General Inquiry Form', value: 'general' },
          { title: 'Sell Property Form', value: 'sell' },
          { title: 'Mortgage Study Form', value: 'mortgage' },
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
      group: 'header',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') !== 'intent',
      description: 'If enabled, choosing a choice from the Intent Selector opens the form in a sliding sidebar modal.'
    }),
    defineField({
      name: 'formTitle',
      title: 'Form Title',
      type: 'string',
      group: 'intent',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') !== 'intent',
    }),
    defineField({
      name: 'formSubtitle',
      title: 'Form Subtitle',
      type: 'text',
      group: 'intent',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') !== 'intent',
    }),
    defineField({
      name: 'showIntentWhatsApp',
      title: 'Show WhatsApp Option (Intent Step)',
      type: 'boolean',
      initialValue: false,
      group: 'intent',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') !== 'intent',
      description: 'Show a Contact via WhatsApp option above the choices in the Intent Selector.'
    }),
    defineField({
      name: 'intentWhatsappMessageTemplate',
      title: 'Intent WhatsApp Message Template',
      type: 'text',
      rows: 2,
      group: 'intent',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') !== 'intent' || !parent?.showIntentWhatsApp,
      description: 'Optional: Provide a default template for the WhatsApp button on the Intent step.'
    }),
    defineField({
      name: 'generalTitle',
      title: 'General Form Title',
      type: 'string',
      group: 'general',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'sell' || step === 'mortgage';
      },
      description: 'Heading text when viewing the General Inquiry form.'
    }),
    defineField({
      name: 'generalSubtitle',
      title: 'General Form Subtitle',
      type: 'text',
      rows: 2,
      group: 'general',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'sell' || step === 'mortgage';
      },
      description: 'Subtitle text when viewing the General Inquiry form.'
    }),
    defineField({
      name: 'presetMessage',
      title: 'Preset Form Message (Hidden)',
      type: 'text',
      rows: 3,
      group: 'general',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'sell' || step === 'mortgage';
      },
      description: 'Optional: Provide a default message. If set, this exact text will be pre-filled and the message input field will be hidden from the user.'
    }),
    defineField({
      name: 'hideGeneralWhatsApp',
      title: 'Hide WhatsApp Option (General Form)',
      type: 'boolean',
      initialValue: false,
      group: 'general',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'sell' || step === 'mortgage';
      },
    }),
    defineField({
      name: 'whatsappMessageTemplate',
      title: 'General WhatsApp Message Template',
      type: 'text',
      rows: 2,
      group: 'general',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'sell' || step === 'mortgage' || parent?.hideGeneralWhatsApp === true;
      },
      description: 'Optional: Provide a default template for the WhatsApp button on the General form.'
    }),
    defineField({
      name: 'sellTitle',
      title: 'Sell Form Title',
      type: 'string',
      group: 'sell',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'general' || step === 'mortgage';
      },
      description: 'Heading text when viewing the Sell Property form.'
    }),
    defineField({
      name: 'sellSubtitle',
      title: 'Sell Form Subtitle',
      type: 'text',
      rows: 2,
      group: 'sell',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'general' || step === 'mortgage';
      },
      description: 'Subtitle text when viewing the Sell Property form.'
    }),
    defineField({
      name: 'hideSellWhatsApp',
      title: 'Hide WhatsApp Option (Sell Form)',
      type: 'boolean',
      initialValue: false,
      group: 'sell',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'general' || step === 'mortgage';
      },
    }),
    defineField({
      name: 'sellWhatsappMessageTemplate',
      title: 'Sell WhatsApp Message Template',
      type: 'text',
      rows: 2,
      group: 'sell',
      hidden: ({ parent }) => {
        const step = parent?.initialStep || 'intent';
        return step === 'general' || step === 'mortgage' || parent?.hideSellWhatsApp === true;
      },
      description: 'Optional: Provide a default template for the WhatsApp button on the Sell form.'
    }),
    defineField({
      name: 'mortgageTitle',
      title: 'Mortgage Form Title',
      type: 'string',
      group: 'mortgage',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') === 'general' || (parent?.initialStep || 'intent') === 'sell',
      description: 'Heading text when viewing the Mortgage Study form.'
    }),
    defineField({
      name: 'mortgageSubtitle',
      title: 'Mortgage Form Subtitle',
      type: 'text',
      rows: 2,
      group: 'mortgage',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') === 'general' || (parent?.initialStep || 'intent') === 'sell',
      description: 'Subtitle text when viewing the Mortgage Study form.'
    }),
    defineField({
      name: 'hideMortgageWhatsApp',
      title: 'Hide WhatsApp Option (Mortgage Form)',
      type: 'boolean',
      initialValue: false,
      group: 'mortgage',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') === 'general' || (parent?.initialStep || 'intent') === 'sell',
    }),
    defineField({
      name: 'mortgageWhatsappMessageTemplate',
      title: 'Mortgage WhatsApp Message Template',
      type: 'text',
      rows: 2,
      group: 'mortgage',
      hidden: ({ parent }) => (parent?.initialStep || 'intent') === 'general' || (parent?.initialStep || 'intent') === 'sell' || parent?.hideMortgageWhatsApp === true,
      description: 'Optional: Provide a default template for the WhatsApp button on the Mortgage form.'
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
