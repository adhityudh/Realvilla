import { defineField, defineType } from 'sanity'

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
    }),
    defineField({
      name: 'desktopVideoMP4',
      title: 'Desktop Video (MP4 - H.265)',
      type: 'file',
      options: { accept: 'video/mp4' }
    }),
    defineField({
      name: 'desktopVideoWebM',
      title: 'Desktop Video (WebM - VP9)',
      type: 'file',
      options: { accept: 'video/webm' }
    }),
    defineField({
      name: 'mobileVideoMP4',
      title: 'Mobile Video (MP4 - H.265)',
      type: 'file',
      options: { accept: 'video/mp4' }
    }),
    defineField({
      name: 'mobileVideoWebM',
      title: 'Mobile Video (WebM - VP9)',
      type: 'file',
      options: { accept: 'video/webm' }
    }),
    defineField({
      name: 'ctas',
      title: 'Call to Actions',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'cta',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'image',
            }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Internal Page', value: 'internal' },
                  { title: 'External URL', value: 'external' },
                ],
                layout: 'radio',
              },
              initialValue: 'internal',
            }),
            defineField({
              name: 'internalLink',
              title: 'Internal Link',
              type: 'reference',
              to: [{ type: 'page' }],
              hidden: ({ parent }) => parent?.linkType !== 'internal',
            }),
            defineField({
              name: 'externalLink',
              title: 'External Link',
              type: 'string',
              description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
              hidden: ({ parent }) => parent?.linkType !== 'external',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              media: 'icon'
            }
          }
        }
      ]
    }),
  ],
})
