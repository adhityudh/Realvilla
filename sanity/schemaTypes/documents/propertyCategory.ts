import { defineField, defineType } from 'sanity'

export const propertyCategory = defineType({
  name: 'propertyCategory',
  title: 'Property Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      description: 'Localized display name of the category (e.g., Apartment, Villa).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'Icon to represent this category in filters and card highlights.',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      description: 'Ordering priority in filter sidebars and listings.',
    }),
    defineField({
      name: 'highlightedMetas',
      title: 'Highlighted Metas',
      type: 'array',
      description: 'Define and order which property meta fields should be highlighted for properties in this category.',
      of: [
        {
          type: 'object',
          name: 'highlightedMetaItem',
          fields: [
            defineField({
              name: 'metaKey',
              title: 'Meta Key',
              type: 'reference',
              to: [{ type: 'propertyMeta' }],
              description: 'Select the property meta document.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'hideLabel',
              title: 'Hide Label on Highlights',
              type: 'boolean',
              description: 'If enabled, only the value will be shown, not the label/unit.',
              initialValue: false,
            })
          ],
          preview: {
            select: {
              title: 'metaKey.shortLabel.en',
              hideLabel: 'hideLabel',
              media: 'metaKey.icon'
            },
            prepare({ title, hideLabel, media }) {
              return {
                title: title || 'Untitled Meta',
                subtitle: hideLabel ? 'Label hidden' : 'Label shown',
                media: media
              }
            }
          }
        }
      ]
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      icon: 'icon',
      order: 'order'
    },
    prepare({ title, icon, order }) {
      return {
        title: title || 'Untitled Category',
        subtitle: `Order: ${order || 0}`,
        media: icon
      }
    }
  }
})
