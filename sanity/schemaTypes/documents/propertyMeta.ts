import { defineField, defineType } from 'sanity'

export const propertyMeta = defineType({
  name: 'propertyMeta',
  title: 'Property Meta',
  type: 'document',
  fields: [
    defineField({
      name: 'shortLabel',
      title: 'Short Label',
      type: 'localizedString',
      description: 'Short display name for cards and compact views. E.g. "Beds", "Baths".',
    }),
    defineField({
      name: 'longLabel',
      title: 'Long Label',
      type: 'localizedString',
      description: 'Full display name for detail pages. E.g. "Total Bedrooms", "Full Bathrooms".',
    }),
    defineField({
      name: 'valueType',
      title: 'Value Type',
      type: 'string',
      description: 'Data type of this meta field.',
      options: {
        list: [
          { title: 'Number', value: 'number' },
          { title: 'Text', value: 'string' },
          { title: 'Yes/No', value: 'boolean' },
        ],
        layout: 'radio',
      },
      initialValue: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'unit',
      title: 'Unit / Suffix',
      type: 'localizedString',
      description: 'Optional unit displayed after the value. E.g. "Sq.Ft.", "/yr", "m²".',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'Optional icon for display on cards or detail pages.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'propertyMetaCategory' }],
      description: 'Which category group this meta belongs to on the detail page.',
    }),
    defineField({
      name: 'isHighlighted',
      title: 'Highlighted',
      type: 'boolean',
      description: 'If true, this meta will be shown prominently on property cards and detail page headers.',
      initialValue: false,
    }),
    defineField({
      name: 'highlightOrder',
      title: 'Highlight Order',
      type: 'number',
      description: 'Sort order for highlighted metas (lower = first).',
      hidden: ({ document }) => !document?.isHighlighted,
      initialValue: 0,
    }),
    defineField({
      name: 'filter',
      title: 'Filter Settings',
      type: 'object',
      description: 'Configure how this meta appears as a search filter.',
      fields: [
        defineField({
          name: 'isFilterable',
          title: 'Enable as Filter',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'filterType',
          title: 'Filter Type',
          type: 'string',
          options: {
            list: [
              { title: 'Range Slider', value: 'rangeSlider' },
              { title: 'Prefix Range (Any, 1+, 2+...)', value: 'prefixRange' },
              { title: 'Boolean Toggle', value: 'boolean' },
              { title: 'Single Select', value: 'select' },
              { title: 'Multi Select', value: 'multiSelect' },
            ],
          },
          hidden: ({ parent }) => !parent?.isFilterable,
        }),
        defineField({
          name: 'filterOrder',
          title: 'Filter Display Order',
          type: 'number',
          description: 'Sort order in the filter panel (lower = first).',
          hidden: ({ parent }) => !parent?.isFilterable,
          initialValue: 0,
        }),
        defineField({
          name: 'rangeMin',
          title: 'Range Minimum',
          type: 'number',
          hidden: ({ parent }) => parent?.filterType !== 'rangeSlider',
        }),
        defineField({
          name: 'rangeMax',
          title: 'Range Maximum',
          type: 'number',
          hidden: ({ parent }) => parent?.filterType !== 'rangeSlider',
        }),
        defineField({
          name: 'rangeStep',
          title: 'Range Step',
          type: 'number',
          hidden: ({ parent }) => parent?.filterType !== 'rangeSlider',
        }),
        defineField({
          name: 'rangePrefix',
          title: 'Range Value Prefix',
          type: 'localizedString',
          description: 'E.g. "$", "€"',
          hidden: ({ parent }) => parent?.filterType !== 'rangeSlider',
        }),
        defineField({
          name: 'rangeSuffix',
          title: 'Range Value Suffix',
          type: 'localizedString',
          description: 'E.g. "Sq.Ft.", "m²"',
          hidden: ({ parent }) => parent?.filterType !== 'rangeSlider',
        }),
        defineField({
          name: 'prefixOptions',
          title: 'Prefix Options',
          type: 'array',
          description: 'E.g. "Any", "1+", "2+", "3+", "4+", "5+"',
          of: [{ type: 'string' }],
          hidden: ({ parent }) => parent?.filterType !== 'prefixRange',
        }),
        defineField({
          name: 'selectOptions',
          title: 'Select Options',
          type: 'array',
          description: 'Available choices for select/multi-select filters.',
          of: [{ type: 'string' }],
          hidden: ({ parent }) =>
            parent?.filterType !== 'select' && parent?.filterType !== 'multiSelect',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      shortLabel: 'shortLabel.en',
      longLabel: 'longLabel.en',
      valueType: 'valueType',
      isHighlighted: 'isHighlighted',
    },
    prepare({ shortLabel, longLabel, valueType, isHighlighted }) {
      const badges = [valueType, isHighlighted ? '⭐ highlighted' : ''].filter(Boolean).join(' · ')
      return {
        title: `${shortLabel || 'Untitled'} — ${longLabel || ''}`,
        subtitle: badges,
      }
    },
  },
})
