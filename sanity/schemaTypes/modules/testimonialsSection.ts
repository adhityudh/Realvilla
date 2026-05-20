import { HeartIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'

export const testimonialsSection = defineType({
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'object',
  icon: HeartIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'advanced', title: 'Advanced' },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'testimonials',
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
      name: 'title',
      title: 'Title',
      type: 'string',
    group: 'content',
}),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'testimonial',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'title', title: 'Reviewer Title', type: 'string' }),
            defineField({ 
              name: 'stars', 
              title: 'Stars', 
              type: 'number', 
              initialValue: 5,
              validation: Rule => Rule.min(1).max(5) 
            }),
            defineField({ name: 'text', title: 'Testimonial Text', type: 'text' }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'title'
            }
          }
        },
      ],
    group: 'content',
}),
    defineField({
      name: 'overlapImage',
      title: 'Overlap Image (Bottom)',
      type: 'image',
      options: { hotspot: true },
    group: 'content',
}),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'Testimonials Section',
      }
    },
  },
})
