import { DashboardIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const buyHeroSection = defineType({
  name: 'buyHeroSection',
  title: 'Buy Hero Section',
  type: 'object',
  icon: DashboardIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'searchPlaceholder',
      title: 'Search Placeholder',
      type: 'string',
      initialValue: 'Search by Property Name, location, or Municipalities...'
    }),
    defineField({
      name: 'jumpLinks',
      title: 'Jump Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'link', title: 'Link', type: 'string' }),
          ]
        }
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'Buy Hero Section',
      }
    },
  },
})
