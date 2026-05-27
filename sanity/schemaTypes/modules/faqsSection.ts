import { HelpCircleIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const faqsSection = defineType({
  name: 'faqsSection',
  title: 'FAQs Section',
  type: 'object',
  icon: HelpCircleIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'advanced', title: 'Advanced' },
  ],
  fields: [
    defineField({
      name: 'anchor',
      title: 'Anchor ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #faqs).',
      initialValue: 'faqs',
      group: 'advanced',
    }),
    defineField({
      name: 'disableEntranceAnimation',
      title: 'Disable Entrance Animation',
      type: 'boolean',
      initialValue: false,
      group: 'advanced',
    }),
    defineField({
      name: 'tocLabel',
      title: 'Table of Contents Label',
      type: 'string',
      description: 'Label shown above the TOC sidebar (e.g. "Table of Contents").',
      group: 'content',
    }),
    defineField({
      name: 'groups',
      title: 'FAQ Groups',
      type: 'array',
      description: 'Add multiple FAQ groups, each with a title and its own list of questions.',
      of: [
        {
          type: 'object',
          name: 'faqGroup',
          title: 'FAQ Group',
          fields: [
            defineField({ name: 'title', title: 'Group Title', type: 'string' }),
            defineField({
              name: 'items',
              title: 'FAQ Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'faqItem',
                  fields: [
                    defineField({ name: 'question', title: 'Question', type: 'string' }),
                    defineField({ name: 'answer', title: 'Answer', type: 'text' }),
                  ],
                  preview: {
                    select: { title: 'question' },
                    prepare({ title }) { return { title: title || 'Untitled Question' } },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare({ title, items }) {
              return {
                title: title || 'Untitled Group',
                subtitle: `${items?.length || 0} question(s)`,
              }
            },
          },
        },
      ],
      group: 'content',
    }),
  ],
  preview: {
    select: { groups: 'groups' },
    prepare({ groups }) {
      return {
        title: 'FAQs Section',
        subtitle: `${groups?.length || 0} group(s)`,
      }
    },
  },
})
