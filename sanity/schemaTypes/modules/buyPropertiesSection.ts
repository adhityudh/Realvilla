import { defineField, defineType } from 'sanity'

export const buyPropertiesSection = defineType({
  name: 'buyPropertiesSection',
  title: 'Buy Properties Section',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'Buy Properties Section',
      }
    },
  },
})
