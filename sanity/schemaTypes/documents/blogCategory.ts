import { defineField, defineType } from 'sanity'

export const blogCategory = defineType({
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      description: 'Localized display name of the category (e.g., Market Insights, Tips & Guides).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
        isUnique: async (slug, context) => {
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2024-05-02' })
          const id = document?._id.replace(/^drafts\./, '')

          const query = `*[_type == "blogCategory" && slug.current == $slug && _id != $id && !(_id in path("drafts.**"))][0]`
          const result = await client.fetch(query, { slug, id })

          return !result
        }
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedString',
      description: 'A short description of this category.',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'Icon to represent this category in the archive tabs.',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      description: 'Ordering priority in category listings and filters.',
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Title: A-Z',
      name: 'titleAsc',
      by: [{ field: 'title.en', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      description: 'description.en',
      order: 'order',
      icon: 'icon',
    },
    prepare({ title, description, order, icon }) {
      return {
        title: title || 'Untitled Category',
        subtitle: `Order: ${order ?? 0}${description ? ` — ${description}` : ''}`,
        media: icon,
      }
    },
  },
})