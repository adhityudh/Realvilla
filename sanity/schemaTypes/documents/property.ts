import { defineField, defineType } from 'sanity'

export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: Rule => Rule.required(),
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
    },
  },
})
