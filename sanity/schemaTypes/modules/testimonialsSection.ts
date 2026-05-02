import { defineField, defineType } from 'sanity'

export const testimonialsSection = defineType({
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
    }),
    defineField({
      name: 'overlapImage',
      title: 'Overlap Image (Bottom)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
