import { defineField, defineType } from 'sanity'
import { FeaturedArticleInput } from '@/sanity/plugins/featuredArticleInput'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      group: 'content',
    }),

    // ═══════════════════════════════════════
    //  CONTENT
    // ═══════════════════════════════════════
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Blog post headline.',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 120,
        isUnique: async (slug, context) => {
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2024-05-02' })
          const id = document?._id.replace(/^drafts\./, '')
          const language = document?.language

          const query = `*[_type == "blogPost" && slug.current == $slug && language == $language && _id != $id && !(_id in path("drafts.**"))][0]`
          const result = await client.fetch(query, {
            slug,
            language: language || null,
            id
          })

          return !result
        }
      },
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'The date and time this post was published. Used for sorting and display.',
      group: 'content',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'blogAuthor' }],
      description: 'The author of this post.',
      group: 'content',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Assign this post to one or more categories.',
      group: 'content',
      of: [
        {
          type: 'reference',
          to: [{ type: 'blogCategory' }],
        },
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'A short summary displayed in blog cards and listings (Recommended: 120-160 characters).',
      group: 'content',
      validation: (Rule) => Rule.max(200).warning('Longer excerpts may be truncated in listings'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      description: 'The main content of the blog post.',
      group: 'content',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Optional tags for filtering and search.',
      group: 'content',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Article',
      type: 'boolean',
      description: 'Mark this article as featured. Only one article can be featured at a time.',
      group: 'content',
      initialValue: false,
      components: {
        input: FeaturedArticleInput,
      },
    }),

    // ═══════════════════════════════════════
    //  MEDIA
    // ═══════════════════════════════════════
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: 'Main image shown on blog cards and at the top of the post.',
      options: { hotspot: true },
      group: 'media',
    }),

    // ═══════════════════════════════════════
    //  SEO
    // ═══════════════════════════════════════
    defineField({
      name: 'seo',
      title: 'SEO Override',
      description: 'Customize how this post appears in search engines and social media. Leave blank to auto-generate from title and excerpt.',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Published Date: Newest First',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Published Date: Oldest First',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
    {
      title: 'Title: A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Recently Updated',
      name: 'updatedAtDesc',
      by: [{ field: '_updatedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      excerpt: 'excerpt',
      media: 'featuredImage',
      publishedAt: 'publishedAt',
      language: 'language',
      isFeatured: 'isFeatured',
    },
    prepare({ title, excerpt, media, publishedAt, language, isFeatured }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-IE', { year: 'numeric', month: 'short', day: 'numeric' })
        : ''

      const featuredIndicator = isFeatured ? '⭐ ' : ''

      return {
        title: `${featuredIndicator}${language ? `[${language.toUpperCase()}] ` : ''}${title || 'Untitled Post'}`,
        subtitle: `${date}${excerpt ? ` — ${excerpt}` : ''}`,
        media,
      }
    },
  },
})