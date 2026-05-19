import { CommentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const contactModalComponent = defineType({
  name: 'contactModalComponent',
  title: 'Contact Modal',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'componentId',
      title: 'Component ID',
      type: 'slug',
      description: 'Unique identifier for this component. Use this ID in any link to open this modal (e.g., "sell-modal", "general-inquiry"). Links must use the format: modal:<componentId>',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'formType',
        slugify: (input) => input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
    }),
    defineField({
      name: 'formType',
      title: 'Form Type',
      type: 'string',
      options: {
        list: [
          { title: 'General Inquiry', value: 'general' },
          { title: 'Sell Property', value: 'sell' },
          { title: 'Mortgage Study', value: 'mortgage' },
        ],
        layout: 'radio',
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'title',
      title: 'Form Title',
      type: 'string',
      description: 'Title displayed in the modal header and form.',
    }),
    defineField({
      name: 'subtitle',
      title: 'Form Subtitle',
      type: 'text',
      rows: 2,
      description: 'Subtitle displayed below the title.',
    }),
    defineField({
      name: 'hideWhatsApp',
      title: 'Hide WhatsApp Option',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'whatsappMessageTemplate',
      title: 'WhatsApp Message Template',
      type: 'text',
      rows: 2,
      hidden: ({ parent }) => parent?.hideWhatsApp === true,
    }),
    defineField({
      name: 'presetMessage',
      title: 'Preset Form Message (Hidden)',
      type: 'text',
      rows: 2,
      description: 'If set, pre-fills and hides the message input field (General form only).',
      hidden: ({ parent }) => parent?.formType !== 'general',
    }),
  ],
  preview: {
    select: {
      title: 'componentId.current',
      subtitle: 'formType',
    },
    prepare({ title, subtitle }) {
      return {
        title: title ? `modal:${title}` : 'No ID set',
        subtitle: subtitle === 'sell' ? 'Sell Property Form' : 'General Inquiry Form',
      }
    },
  },
})
