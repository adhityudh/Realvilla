import { HomeIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'

export const buyPropertiesSection = defineType({
  name: 'buyPropertiesSection',
  title: 'Buy Properties Section',
  type: 'object',
  icon: HomeIcon,
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
      initialValue: 'properties-list',
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
      name: 'title',
      title: 'Title',
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
      name: 'itemsPerPage',
      title: 'Items per Page (Desktop)',
      type: 'number',
      description: 'How many properties to display per page on desktop. (Default: 6)',
      initialValue: 6,
    group: 'content',
}),
    defineField({
      name: 'itemsPerPageMobile',
      title: 'Items per Page (Mobile)',
      type: 'number',
      description: 'How many properties to display per page on mobile devices under 768px. (Optional, defaults to same as desktop limit)',
    group: 'content',
}),
    defineField({
      name: 'showQuickFilters',
      title: 'Show Quick Filter Chips',
      description: 'Whether to display horizontal quick-filter category chips beneath the section header.',
      type: 'boolean',
      initialValue: true,
    group: 'content',
}),
    defineField({
      name: 'quickFilterSelection',
      title: 'Quick Filter Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Display All Categories', value: 'all' },
          { title: 'Display Specific Selection', value: 'custom' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'all',
      hidden: ({ parent }) => parent?.showQuickFilters !== true,
    group: 'content',
}),
    defineField({
      name: 'quickFilterCategories',
      title: 'Select Specific Categories',
      description: 'Choose which categories to display as quick filter chips in this section.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'propertyCategory' }] }],
      hidden: ({ parent }) => parent?.showQuickFilters !== true || parent?.quickFilterSelection !== 'custom',
    group: 'content',
}),
    defineField({
      name: 'orderBy',
      title: 'Order By',
      type: 'string',
      options: {
        list: [
          { title: "Newest First", value: "_createdAt desc" },
          { title: "Price (High to Low)", value: "price desc" },
          { title: "Price (Low to High)", value: "price asc" },
        ],
      },
      initialValue: "_createdAt desc",
    group: 'content',
}),
    defineField({
      name: 'showSold',
      title: 'Show Sold Properties',
      type: 'boolean',
      initialValue: false,
    group: 'content',
}),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'No Title',
        subtitle: 'Buy Properties Section',
      }
    },
  },
})
