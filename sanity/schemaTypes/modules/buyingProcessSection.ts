import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { BookIcon } from '@sanity/icons'

export const buyingProcessSection = defineType({
  name: 'buyingProcessSection',
  title: 'Buying Process Section',
  type: 'object',
  icon: BookIcon,
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
      initialValue: 'buying-process',
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
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Small subtitle above the headline. E.g. "Comprehensive Guide"',
    group: 'content',
}),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Main section heading.',
    group: 'content',
}),
    defineField({
      name: 'intro',
      title: 'Intro Text',
      type: 'blockContent',
      description: 'Optional introductory context.',
    group: 'content',
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
    group: 'content',
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
    group: 'content',
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
