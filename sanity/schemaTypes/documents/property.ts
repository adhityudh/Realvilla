import { defineField, defineType } from 'sanity'

export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'address',
        maxLength: 96,
        isUnique: async (slug, context) => {
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2024-05-02' })
          const id = document?._id.replace(/^drafts\./, '')
          const language = document?.language

          // Only check uniqueness within the same language
          const query = `*[_type == "property" && slug.current == $slug && language == $language && _id != $id && !(_id in path("drafts.**"))][0]`
          const result = await client.fetch(query, { slug, language, id })
          
          return !result
        }
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
    }),
    defineField({
      name: 'beds',
      title: 'Beds',
      type: 'number',
    }),
    defineField({
      name: 'baths',
      title: 'Baths',
      type: 'number',
    }),
    defineField({
      name: 'sqft',
      title: 'Sq. Ft.',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Primary Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'secondaryImage',
      title: 'Secondary Image (Hover)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'For Sale', value: 'for-sale' },
          { title: 'Sold', value: 'sold' },
          { title: 'Reserved', value: 'reserved' },
        ],
      },
      initialValue: 'for-sale',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'address',
      subtitle: 'price',
      media: 'image',
      language: 'language',
    },
    prepare({ title, subtitle, media, language }) {
      return {
        title: `${language ? `[${language.toUpperCase()}] ` : ''}${title}`,
        subtitle,
        media,
      }
    },
  },
})
