import { ChartUpwardIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const statsSection = defineType({
  name: 'statsSection',
  title: 'Stats Section',
  type: 'object',
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body / Copy Text',
      type: 'text',
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
      ]
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
