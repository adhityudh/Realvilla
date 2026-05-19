import { CommentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const genericModalComponent = defineType({
  name: 'genericModalComponent',
  title: 'Generic Modal',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'componentId',
      title: 'Component ID',
      type: 'slug',
      description: 'Unique identifier for this component. Use this ID in any link to open this modal (e.g., "about-details"). Links must use the format: modal:<componentId>',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'title',
        slugify: (input) => input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
    }),
    defineField({
      name: 'title',
      title: 'Modal Title',
      type: 'string',
      description: 'Title displayed in the modal header.',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
      description: 'Rich text content displayed inside the modal.',
    }),
  ],
  preview: {
    select: {
      title: 'componentId.current',
      subtitle: 'title',
    },
    prepare({ title, subtitle }) {
      return {
        title: title ? `modal:${title}` : 'No ID set',
        subtitle: subtitle || 'Generic Modal',
      }
    },
  },
})
