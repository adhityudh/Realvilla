import { EditIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

export const blogSection = defineType({
  name: 'blogSection',
  title: 'Blog Section',
  type: 'object',
  icon: EditIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'advanced', title: 'Advanced' },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #blog).',
      initialValue: 'blog',
      group: 'advanced',
    }),
    defineField({
      name: 'disableEntranceAnimation',
      title: 'Disable Entrance Animation',
      description: 'If checked, the section will load immediately without fade-in/slide-up animations.',
      type: 'boolean',
      initialValue: false,
      group: 'advanced',
    }),
    defineField({
      name: 'disableHeaderEntranceAnimation',
      title: 'Disable Header Entrance Animation',
      description: 'If checked, the section header (tagline, headline, intro) will load immediately without entrance animations.',
      type: 'boolean',
      initialValue: false,
      group: 'advanced',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'selectionType',
      title: 'Selection Type',
      type: 'string',
      options: {
        list: [
          { title: 'Latest Posts (Dynamic)', value: 'dynamic' },
          { title: 'Manual Selection', value: 'manual' },
          { title: 'Category Filter', value: 'category' },
        ],
        layout: 'radio',
      },
      initialValue: 'dynamic',
      group: 'content',
    }),
    // Settings for Dynamic Query
    defineField({
      name: 'limit',
      title: 'Number of Posts',
      type: 'number',
      description: 'How many blog posts to display.',
      initialValue: 3,
      hidden: ({ parent }) => parent?.selectionType !== 'dynamic' && parent?.selectionType !== 'category',
      group: 'content',
    }),
    defineField({
      name: 'showCategories',
      title: 'Show Category Tabs',
      type: 'boolean',
      description: 'If enabled, category tabs will be displayed above posts for filtering.',
      initialValue: true,
      hidden: ({ parent }) => parent?.selectionType !== 'category',
      group: 'content',
    }),
    // Settings for Manual Selection
    defineField({
      name: 'manualPosts',
      title: 'Select Posts',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'blogPost' }],
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
        }
      ],
      hidden: ({ parent }) => parent?.selectionType !== 'manual',
      group: 'content',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal Page', value: 'internal' },
          { title: 'External URL', value: 'external' },
          { title: 'Section', value: 'section' },
          { title: 'Component', value: 'component' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      group: 'content',
    }),
    defineField({
      name: 'openInNewWindow',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'Open this link in a new browser tab/window',
      initialValue: false,
      group: 'content',
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
      },
      group: 'content',
    }),
    defineField({
      name: 'internalSection',
      title: 'Internal Page Section',
      type: 'string',
      components: {
        input: InternalSectionSelector,
      },
      hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
      group: 'content',
    }),
    defineField({
      name: 'externalLink',
      title: 'External Link',
      type: 'string',
      description: 'Can be a full URL (https://...), a relative path (/blog), or an anchor (#blog).',
      hidden: ({ parent }) => parent?.linkType !== 'external',
      group: 'content',
    }),
    defineField({
      name: 'sectionLink',
      title: 'Section Link',
      type: 'string',
      components: {
        input: SectionSelector,
      },
      hidden: ({ parent }) => parent?.linkType !== 'section',
      group: 'content',
    }),
    defineField({
      name: 'componentLink',
      title: 'Component Link',
      type: 'string',
      components: {
        input: ComponentSelector,
      },
      hidden: ({ parent }) => parent?.linkType !== 'component',
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'headline',
      selectionType: 'selectionType',
    },
    prepare({ title, selectionType }) {
      const typeLabels: Record<string, string> = {
        dynamic: 'Latest Posts',
        manual: 'Manual Selection',
        category: 'Category Filter',
      }
      return {
        title: title || 'No Headline',
        subtitle: `Blog Section — ${typeLabels[selectionType || 'dynamic']}`,
      }
    },
  },
})