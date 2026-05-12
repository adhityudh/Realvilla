import { defineField, defineType } from 'sanity'
import { BookIcon } from '@sanity/icons'

export const buyingProcessSection = defineType({
  name: 'buyingProcessSection',
  title: 'Buying Process Section',
  type: 'object',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Small subtitle above the headline. E.g. "Comprehensive Guide"',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Main section heading.',
    }),
    defineField({
      name: 'intro',
      title: 'Intro Text',
      type: 'blockContent',
      description: 'Optional introductory context.',
    }),
    defineField({
      name: 'imageOrder',
      title: 'First Item Image Side',
      description: 'Choose which side the image appears on for the FIRST item. Subequent items alternate dynamically.',
      type: 'string',
      options: {
        list: [
          { title: 'Left First', value: 'left-first' },
          { title: 'Right First', value: 'right-first' },
        ],
        layout: 'radio',
      },
      initialValue: 'left-first',
    }),
    defineField({
      name: 'steps',
      title: 'Process Steps',
      type: 'array',
      description: 'Create chronological steps explaining the buying phase.',
      of: [
        {
          type: 'object',
          name: 'step',
          title: 'Step',
          fields: [
            defineField({
              name: 'number',
              title: 'Step Number / Identifier',
              type: 'string',
              description: 'E.g. "01" or "Phase 1"',
            }),
            defineField({
              name: 'title',
              title: 'Step Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Step Description',
              type: 'blockContent',
            }),
            defineField({
              name: 'image',
              title: 'Visual Aid',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'quickFacts',
              title: 'Key Facts / Data Points',
              type: 'array',
              description: 'Important highlights like specific taxes, fees, or advice cards.',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string' }),
                    defineField({ name: 'value', title: 'Value', type: 'string' }),
                  ],
                }
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              number: 'number',
              media: 'image',
            },
            prepare({ title, number, media }) {
              return {
                title: `${number ? number + '. ' : ''}${title || 'Untitled Step'}`,
                media,
              }
            },
          },
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
        subtitle: 'Buying Process Section',
      }
    },
  },
})
