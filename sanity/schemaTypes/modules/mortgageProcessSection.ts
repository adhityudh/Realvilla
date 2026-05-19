import { defineField, defineType } from 'sanity'
import { ClipboardIcon } from '@sanity/icons'

export const mortgageProcessSection = defineType({
  name: 'mortgageProcessSection',
  title: 'Mortgage Process Section',
  type: 'object',
  icon: ClipboardIcon,
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Small subtitle above the headline. E.g. "Step-by-Step"',
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
      name: 'timelineMode',
      title: 'Timeline Mode',
      type: 'boolean',
      description: 'Enable an animated horizontal timeline line that connects steps and moves/fills as the page is scrolled.',
      initialValue: false,
    }),

    defineField({
      name: 'steps',
      title: 'Process Steps',
      type: 'array',
      description: 'Steps explaining the financing & mortgage phases.',
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
              description: 'E.g. "01" or "Step 1"',
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
              title: 'Visual Aid (Background)',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'icon',
              title: 'Overlay Icon',
              description: 'Upload a clean, transparent SVG/PNG icon to overlay in the center of the image.',
              type: 'image',
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
        subtitle: 'Mortgage Process Section',
      }
    },
  },
})
