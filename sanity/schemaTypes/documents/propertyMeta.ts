import { defineField, defineType, defineArrayMember } from 'sanity'
import { FilterTypeInput } from '../../components/FilterTypeInput'

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
          { title: 'Yes/No', value: 'boolean' },
          { title: 'Select', value: 'select' },
        ],
        layout: 'radio',
      },
      initialValue: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'selectOptions',
      title: 'Options',
      type: 'array',
      description: 'The list of available values for selection.',
      of: [
        defineArrayMember({
          name: 'selectOption',
          title: 'Option',
          type: 'object',
          fields: [
            defineField({ name: 'en', title: 'English Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'es', title: 'Spanish Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'icon', title: 'Icon', type: 'image', description: 'Optional icon to display if using Grid view.' }),
          ],
          preview: {
            select: { title: 'en', subtitle: 'es', media: 'icon' }
          }
        })
      ],
      hidden: ({ document }) => document?.valueType !== 'select',
    }),
    defineField({
      name: 'isMultiSelect',
      title: 'Allow Multi-Select',
      type: 'boolean',
      description: 'If enabled, users can select multiple values.',
      initialValue: false,
      hidden: ({ document }) => document?.valueType !== 'select',
    }),
    defineField({
      name: 'selectDisplayType',
      title: 'Display Style',
      type: 'string',
      options: {
        list: [
          { title: 'Pills / Chips', value: 'pill' },
          { title: 'Grid Box', value: 'grid' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'pill',
      hidden: ({ document }) => document?.valueType !== 'select',
    }),
    defineField({
      name: 'showOnSearchModal',
      title: 'Searchable & Show Options in Global Search',
      type: 'boolean',
      description: 'If enabled, properties containing this value will appear in keyword searches, AND the options themselves will appear as direct groupings in the search modal.',
      initialValue: false,
      hidden: ({ document }) => document?.valueType !== 'select',
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
      name: 'hideLabelOnHighlight',
      title: 'Hide Label on Highlights',
      type: 'boolean',
      description: 'If enabled, the label/text unit won\'t show on cards/highlights, ONLY the value.',
      hidden: ({ document }) => !document?.isHighlighted,
      initialValue: false,
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
          components: {
            input: FilterTypeInput,
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
          name: 'isDoubleSlider',
          title: 'Use Double Slider (Min & Max)',
          type: 'boolean',
          description: 'If enabled, the slider will have two thumbs to select a range (min and max) instead of just a max value.',
          initialValue: false,
          hidden: ({ parent }) => parent?.filterType !== 'rangeSlider',
        }),
        defineField({
          name: 'useAutomaticMax',
          title: 'Use Automatic Maximum',
          type: 'boolean',
          description: 'If enabled, the slider will automatically use the highest property value from your database as the upper limit.',
          initialValue: true,
          hidden: ({ parent }) => parent?.filterType !== 'rangeSlider',
        }),
        defineField({
          name: 'rangeMax',
          title: 'Manual Range Maximum',
          type: 'number',
          description: 'Specify the maximum value for the slider manually if automatic maximum is disabled.',
          hidden: ({ parent }) => parent?.filterType !== 'rangeSlider' || parent?.useAutomaticMax === true,
        }),
        defineField({
          name: 'prefixOptions',
          title: 'Prefix / Comparison Options',
          type: 'array',
          description: 'Configure choices for this filter with precise matching rules (e.g. "2" means equal to 2, "3+" means greater than or equal to 3).',
          hidden: ({ parent }) => parent?.filterType !== 'prefixRange',
          of: [
            {
              type: 'object',
              name: 'prefixOptionItem',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Option Label',
                  type: 'string',
                  description: 'The text shown to the user. E.g. "Any", "2", "3+"',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'isAny',
                  title: 'Is "Any" Option?',
                  type: 'boolean',
                  description: 'If enabled, this option will remove the filter for this field (showing all properties).',
                  initialValue: false,
                }),
                defineField({
                  name: 'operator',
                  title: 'Comparison Rule',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Equal (==)', value: 'equals' },
                      { title: 'Greater Than or Equal (>=)', value: 'gte' },
                      { title: 'Less Than or Equal (<=)', value: 'lte' },
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'gte',
                  hidden: ({ parent }) => parent?.isAny === true,
                  validation: (Rule) => Rule.custom((value, context: any) => {
                    if (context.parent?.isAny !== true && !value) return 'Comparison rule is required for non-Any options';
                    return true;
                  }),
                }),
                defineField({
                  name: 'value',
                  title: 'Numeric Value',
                  type: 'number',
                  description: 'The number to compare against. E.g. 2, 3.',
                  hidden: ({ parent }) => parent?.isAny === true,
                  validation: (Rule) => Rule.custom((value, context: any) => {
                    if (context.parent?.isAny !== true && value === undefined) return 'Numeric value is required for non-Any options';
                    return true;
                  }),
                }),
              ],
              preview: {
                select: {
                  label: 'label',
                  operator: 'operator',
                  value: 'value',
                  isAny: 'isAny'
                },
                prepare({ label, operator, value }) {
                  const opMap: Record<string, string> = {
                    equals: '==',
                    gte: '>=',
                    lte: '<=',
                  };
                  return {
                    title: label || 'Untitled Option',
                    subtitle: value !== undefined ? `Rule: value ${opMap[operator] || '>='} ${value}` : 'No rule set',
                  };
                }
              }
            }
          ]
        }),
        defineField({
          name: 'selectOptions',
          title: 'Select Options',
          type: 'array',
          description: 'Available choices for select/multi-select filters.',
          of: [
            defineArrayMember({
              name: 'selectOption',
              title: 'Option',
              type: 'object',
              fields: [
                defineField({ name: 'en', title: 'English Label', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'es', title: 'Spanish Label', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'icon', title: 'Icon', type: 'image' }),
              ],
              preview: {
                select: { title: 'en', subtitle: 'es', media: 'icon' }
              }
            })
          ],
          hidden: ({ parent, document }) =>
            document?.valueType === 'select' ||
            (parent?.filterType !== 'select' && parent?.filterType !== 'multiSelect'),
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
