import { defineField, defineType, ALL_FIELDS_GROUP } from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      group: 'content',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: async (slug, context) => {
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2024-05-02' })
          const id = document?._id.replace(/^drafts\./, '')
          const language = document?.language

          // Only check uniqueness within the same language
          const query = `*[_type == "page" && slug.current == $slug && language == $language && _id != $id && !(_id in path("drafts.**"))][0]`
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
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'buyHeroSection' },
        { type: 'sellHeroSection' },
        { type: 'generalHeroSection' },
        { type: 'buyPropertiesSection' },
        { type: 'aboutSection' },
        { type: 'propertiesSection' },
        { type: 'valuationSection' },
        { type: 'partnerSection' },
        { type: 'testimonialsSection' },
        { type: 'contactSection' },
        { type: 'mortgageFAQSection' },
        { type: 'buyingProcessSection' },
        { type: 'buyMortgageSimSection' },
        { type: 'statsSection' },
        { type: 'mortgageProcessSection' },
        { type: 'sellProcessSection' },
        { type: 'documentLedgerSection' },
        { type: 'financingCardsSection' },
      ],
      group: 'content',
    }),
    defineField({
      name: 'pageComponents',
      title: 'Page Components',
      description: 'Reusable components (like modals) that can be triggered anywhere on this page by referencing their Component ID in any link (e.g., "modal:sell-modal").',
      type: 'array',
      of: [
        { type: 'contactModalComponent' },
        { type: 'genericModalComponent' },
      ],
      group: 'content',
    }),
    defineField({
      name: 'footerPaddingHigh',
      title: 'Footer: High Padding Mode',
      description: 'If enabled, the footer will have larger top padding (like the homepage).',
      type: 'boolean',
      initialValue: false,
      group: 'content',
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Social',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
    },
    prepare({ title, language }) {
      return {
        title: `${language ? `[${language.toUpperCase()}] ` : ''}${title}`,
      }
    },
  },
})
