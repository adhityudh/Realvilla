import { ThLargeIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

export const propertiesSection = defineType({
  name: 'propertiesSection',
  title: 'Properties Section',
  type: 'object',
  icon: ThLargeIcon,
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
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'properties',
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
          { title: 'Latest / Dynamic Query', value: 'dynamic' },
          { title: 'Manual Selection', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'dynamic',
      group: 'content',
}),
    // Settings for Dynamic Query
    defineField({
      name: 'limit',
      title: 'Number of Properties',
      type: 'number',
      description: 'How many properties to display.',
      initialValue: 3,
      hidden: ({ parent }) => parent?.selectionType !== 'dynamic',
      group: 'content',
}),
    defineField({
      name: 'limitMobile',
      title: 'Number of Properties for Mobile',
      type: 'number',
      description: 'How many properties to display on mobile devices under 768px. (Optional, defaults to same as desktop limit)',
      group: 'content',
}),
    defineField({
      name: 'orderBy',
      title: 'Order By',
      type: 'string',
      options: {
        list: [
          { title: 'Newest First', value: '_createdAt desc' },
          { title: 'Price (High to Low)', value: 'price desc' },
          { title: 'Price (Low to High)', value: 'price asc' },
        ],
      },
      initialValue: '_createdAt desc',
      hidden: ({ parent }) => parent?.selectionType !== 'dynamic',
      group: 'content',
}),
    defineField({
      name: 'showSold',
      title: 'Show Sold Properties',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => parent?.selectionType !== 'dynamic',
      group: 'content',
}),
    // Settings for Manual Selection
    defineField({
      name: 'manualProperties',
      title: 'Select Properties',
      type: 'array',
      of: [
        { 
          type: 'reference', 
          to: [{ type: 'property' }],
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
      initialValue: 'View All Properties',
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
      description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
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
    },
    prepare({ title }) {
      return {
        title: title || 'No Headline',
        subtitle: 'Properties Section',
      }
    },
  },
})
