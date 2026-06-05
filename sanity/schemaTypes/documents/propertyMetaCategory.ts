import { defineField, defineType } from 'sanity'

export const propertyMetaCategory = defineType({
  name: 'propertyMetaCategory',
  title: 'Property Meta Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      description: 'Category name (e.g., Interior, Exterior, Details).',
    }),
    defineField({
      name: 'filterGroupDisplayOrder',
      title: 'Filter Group Display Order',
      type: 'number',
      description: 'The order in which this category group appears in the filter sidebar (lower numbers appear first).',
      initialValue: 0,
    }),
    defineField({
      name: 'filterSortOrder',
      title: 'Filter Items Sort Order',
      type: 'string',
      description: 'How the filters inside this category group are sorted.',
      options: {
        list: [
          { title: 'Default (Meta Property Filter Order)', value: 'default' },
          { title: 'Alphabetical', value: 'alphabetical' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'default',
    }),
    defineField({
      name: 'ungroupFilters',
      title: 'Ungroup Filters',
      type: 'boolean',
      description: 'If checked, all Property Metas related to this category will be displayed individually as standalone filters, instead of being grouped inside an accordion.',
      initialValue: false,
    }),
    defineField({
      name: 'overviewGroupDisplayOrder',
      title: 'Overview Group Display Order',
      type: 'number',
      description: 'The order in which this category group appears in the property overview section on the detail page (lower numbers appear first).',
      initialValue: 0,
    }),
    defineField({
      name: 'overviewItemsSortOrder',
      title: 'Overview Items Sort Order',
      type: 'string',
      description: 'How the items inside this category group are sorted in the property overview.',
      options: {
        list: [
          { title: 'Default (Meta Display Order)', value: 'custom' },
          { title: 'Alphabetical', value: 'alphabetical' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'custom',
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      filterOrder: 'filterGroupDisplayOrder',
      filterSort: 'filterSortOrder',
      overviewOrder: 'overviewGroupDisplayOrder',
      overviewSort: 'overviewItemsSortOrder',
    },
    prepare({ title, filterOrder, filterSort, overviewOrder, overviewSort }) {
      const filterSortLabel = filterSort === 'alphabetical' ? 'A–Z' : 'Default';
      const overviewSortLabel = overviewSort === 'alphabetical' ? 'A–Z' : 'Custom';
      return {
        title: title || 'Untitled Category',
        subtitle: `Filter: #${filterOrder ?? 0} (${filterSortLabel}) · Overview: #${overviewOrder ?? 0} (${overviewSortLabel})`
      }
    },
  },
})

