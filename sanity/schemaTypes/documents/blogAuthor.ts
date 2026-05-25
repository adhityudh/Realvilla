import { defineField, defineType } from 'sanity'

export const blogAuthor = defineType({
  name: 'blogAuthor',
  title: 'Blog Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: 'Author display name (e.g., John Doe, Maria García).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      description: 'Profile photo of the author.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'Professional title (e.g., Real Estate Agent, Content Writer).',
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
      description: 'A brief biography displayed at the end of blog posts.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'avatar',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Unnamed Author',
        subtitle: subtitle || '',
        media,
      }
    },
  },
})