import { UsersIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'

export const partnerSection = defineType({
  name: 'partnerSection',
  title: 'Partner Section',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'partners',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'partners',
      title: 'Partners',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Partner Name',
              type: 'string',
            }),
            defineField({
              name: 'logo',
              title: 'Partner Logo',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'No Link', value: 'none' },
                  { title: 'Internal Page', value: 'internal' },
                  { title: 'External URL', value: 'external' },
                  { title: 'Section', value: 'section' },
                  { title: 'Component', value: 'component' },
                ],
                layout: 'radio',
              },
              initialValue: 'none',
            }),
            defineField({
              name: 'internalLink',
              title: 'Internal Link',
              type: 'reference',
              to: [{ type: 'page' }],
              hidden: ({ parent }) => parent?.linkType !== 'internal',
              options: {
                filter: ({ document }) => {
                  const language = document?.language;
                  if (!language) return {};
                  return {
                    filter: 'language == $language || !defined(language)',
                    params: { language }
                  };
                }
              }
            }),
            defineField({
              name: 'externalLink',
              title: 'External Link',
              type: 'string',
              hidden: ({ parent }) => parent?.linkType !== 'external',
            }),
            defineField({
              name: 'sectionLink',
              title: 'Section Link',
              type: 'string',
              components: {
                input: SectionSelector,
              },
              hidden: ({ parent }) => parent?.linkType !== 'section',
            }),
            defineField({
              name: 'componentLink',
              title: 'Component Link',
              type: 'string',
              components: {
                input: ComponentSelector,
              },
              hidden: ({ parent }) => parent?.linkType !== 'component',
            }),
          ],
          preview: {
            select: {
              title: 'name',
              media: 'logo',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'Partner Section',
      }
    },
  },
})
