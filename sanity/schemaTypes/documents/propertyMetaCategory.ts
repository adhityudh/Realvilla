import { defineField, defineType } from 'sanity'

export const propertyMetaCategory = defineType({
  name: 'propertyMetaCategory',
  title: 'Property Meta Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      description: 'Category name (e.g., Interior, Exterior, Details).',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: 'title.en', order: 'order' },
    prepare({ title, order }) {
      return {
        title: title || 'Untitled Category',
        subtitle: `Order: ${order ?? 0}`
      }
    },
  },
})
