import { ChartUpwardIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'

export const statsSection = defineType({
  name: 'statsSection',
  title: 'Stats Section',
  type: 'object',
  icon: ChartUpwardIcon,
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
      initialValue: 'stats',
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
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
    group: 'content',
}),
    defineField({
      name: 'body',
      title: 'Body / Copy Text',
      type: 'text',
    group: 'content',
}),
    defineField({
      name: 'stats',
      title: 'Stats Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ 
              name: 'prefix', 
              title: 'Prefix Text', 
              type: 'string',
              description: 'Optional smaller text before the value, e.g., Up to, Avg., Over'
            }),
            defineField({ 
              name: 'value', 
              title: 'Main Value', 
              type: 'string',
              description: 'e.g., €2,850, 60, 150k, 2.76%'
            }),
            defineField({ 
              name: 'suffix', 
              title: 'Suffix / Unit', 
              type: 'string',
              description: 'Optional smaller text, e.g., / m², %, sq. ft.'
            }),
            defineField({ 
              name: 'label', 
              title: 'Label / Description', 
              type: 'text',
              rows: 2,
              description: 'Short explanation below the number'
            }),
          ],
          preview: {
            select: {
              prefix: 'prefix',
              value: 'value',
              suffix: 'suffix',
              label: 'label'
            },
            prepare({ prefix, value, suffix, label }) {
              return {
                title: `${prefix ? prefix + ' ' : ''}${value || ''}${suffix ? ' ' + suffix : ''}`,
                subtitle: label || 'No label'
              }
            }
          }
        }
      ],
    group: 'content',
}),
  ],
  preview: {
    select: {
      title: 'heading',
    },
    prepare({ title }) {
      return {
        title: title || 'No Heading',
        subtitle: 'Stats Section',
      }
    },
  },
})
