import { HomeIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const buyPropertiesSection = defineType({
  name: 'buyPropertiesSection',
  title: 'Buy Properties Section',
  type: 'object',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: 'properties-list',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
    }),
    defineField({
      name: 'itemsPerPage',
      title: 'Items per Page (Desktop)',
      type: 'number',
      description: 'How many properties to display per page on desktop. (Default: 6)',
      initialValue: 6,
    }),
    defineField({
      name: 'itemsPerPageMobile',
      title: 'Items per Page (Mobile)',
      type: 'number',
      description: 'How many properties to display per page on mobile devices under 768px. (Optional, defaults to same as desktop limit)',
    }),
    defineField({
      name: 'showQuickFilters',
      title: 'Show Quick Filter Chips',
      description: 'Whether to display horizontal quick-filter category chips beneath the section header.',
      type: 'boolean',
      initialValue: true,
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
    }),
    defineField({
      name: 'quickFilterCategories',
      title: 'Select Specific Categories',
      description: 'Choose which categories to display as quick filter chips in this section.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'propertyCategory' }] }],
      hidden: ({ parent }) => parent?.showQuickFilters !== true || parent?.quickFilterSelection !== 'custom',
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
    }),
    defineField({
      name: 'showSold',
      title: 'Show Sold Properties',
      type: 'boolean',
      initialValue: false,
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
