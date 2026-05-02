import { defineField, defineType } from 'sanity'

export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'object',
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
    defineField({
      name: 'bgImage',
      title: 'Background Image (Desktop)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'mobileBgImage',
      title: 'Background Image (Mobile)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
