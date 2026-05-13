import { defineField, defineType } from 'sanity'

export const settings = defineType({
  name: 'settings',
  title: 'Global Settings',
  type: 'document',
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'header', title: 'Header' },
    { name: 'footer', title: 'Footer' },
    { name: 'search', title: 'Search' },
    { name: 'propertiesSeo', title: 'Properties Page' },
    { name: 'propertyDetail', title: 'Property Detail Page' },
    { name: 'filters', title: 'Filters' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      initialValue: 'Realvilla Settings',
      readOnly: true,
    }),
    defineField({
      name: 'seo',
      title: 'Global SEO Defaults',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      group: 'seo',
    }),
    defineField({
      name: 'propertiesPageSeo',
      title: 'Properties Page SEO',
      description: 'SEO configurations for the properties archive/listing route (/properties).',
      type: 'seo',
      group: 'propertiesSeo',
    }),
    defineField({
      name: 'propertyDetailSections',
      title: 'Property Page Sections',
      description: 'These sections will dynamically appear on ALL property detail pages AFTER the main details content.',
      type: 'array',
      group: 'propertyDetail',
      of: [
        { type: 'heroSection' },
        { type: 'buyHeroSection' },
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
      ],
    }),
    defineField({
      name: 'propertyDetailFooterPaddingHigh',
      title: 'Footer: High Padding Mode',
      description: 'If enabled, the footer on all property detail pages will have larger top padding (like the homepage).',
      type: 'boolean',
      initialValue: false,
      group: 'propertyDetail',
    }),
    defineField({
      name: 'filterSidebar',
      title: 'Filter Sidebar Text',
      type: 'object',
      group: 'filters',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'SEARCH FILTERS' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'string', initialValue: 'Refine your perfect selection' }),
      ]
    }),

    defineField({
      name: 'mainNav',
      title: 'Main Navigation (Desktop & Nav Pill)',
      description: 'Links shown in the top header and the floating pill nav.',
      type: 'array',
      group: 'header',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Internal Page', value: 'internal' },
                  { title: 'External URL', value: 'external' },
                ],
                layout: 'radio',
              },
              initialValue: 'internal',
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
          ],
          preview: {
            select: {
              title: 'label',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'mobileNav',
      title: 'Mobile Hamburger Menu',
      description: 'Links shown inside the mobile hamburger overlay.',
      type: 'array',
      group: 'header',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Internal Page', value: 'internal' },
                  { title: 'External URL', value: 'external' },
                ],
                layout: 'radio',
              },
              initialValue: 'internal',
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
          ],
          preview: {
            select: {
              title: 'label',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'headerCta',
      title: 'Header CTA Button',
      description: 'The primary action button (e.g., "BOOK A CALL").',
      type: 'object',
      group: 'header',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({
          name: 'linkType',
          title: 'Link Type',
          type: 'string',
          options: {
            list: [
              { title: 'Internal Page', value: 'internal' },
              { title: 'External URL', value: 'external' },
            ],
            layout: 'radio',
          },
          initialValue: 'internal',
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
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer Configuration',
      type: 'object',
      group: 'footer',
      fields: [
        defineField({
          name: 'columns',
          title: 'Footer Columns',
          description: 'Define the 4 columns of the footer.',
          type: 'array',
          validation: (Rule) => Rule.max(4),
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Column Title', type: 'string' }),
                defineField({
                  name: 'subgroups',
                  title: 'Subgroups',
                  description: 'Add groups of links (e.g. Sellers, Buyers). If no subgroups are needed, just add one subgroup without a title.',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        defineField({ name: 'title', title: 'Subgroup Title (Optional)', type: 'string' }),
                        defineField({
                          name: 'links',
                          title: 'Links',
                          type: 'array',
                          of: [
                            {
                              type: 'object',
                              fields: [
                                defineField({ name: 'label', title: 'Label', type: 'string' }),
                                defineField({
                                  name: 'linkType',
                                  title: 'Link Type',
                                  type: 'string',
                                  options: {
                                    list: [
                                      { title: 'Internal Page', value: 'internal' },
                                      { title: 'External URL', value: 'external' },
                                    ],
                                    layout: 'radio',
                                  },
                                  initialValue: 'internal',
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
                              ],
                              preview: {
                                select: {
                                  title: 'label',
                                },
                                prepare({ title }) {
                                  return {
                                    title: title || 'Untitled Link',
                                  }
                                },
                              },
                            },
                          ],
                        }),
                      ],
                      preview: {
                        select: {
                          title: 'title',
                          links: 'links',
                        },
                        prepare({ title, links }) {
                          return {
                            title: title || 'Main Links',
                            subtitle: `${links?.length || 0} link(s)`,
                          }
                        },
                      },
                    },
                  ],
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                  subgroups: 'subgroups',
                },
                prepare({ title, subgroups }) {
                  return {
                    title: title || 'Untitled Column',
                    subtitle: `${subgroups?.length || 0} subgroup(s)`,
                  }
                },
              },
            },
          ],
        }),
        defineField({
          name: 'legalLinks',
          title: 'Legal Links',
          description: 'Privacy Policy, Terms, etc.',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Label', type: 'string' }),
                defineField({
                  name: 'linkType',
                  title: 'Link Type',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Internal Page', value: 'internal' },
                      { title: 'External URL', value: 'external' },
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'internal',
                }),
                defineField({
                  name: 'internalLink',
                  title: 'Internal Link',
                  type: 'reference',
                  to: [{ type: 'page' }],
                  hidden: ({ parent }) => parent?.linkType !== 'internal',
                }),
                defineField({
                  name: 'externalLink',
                  title: 'External Link',
                  type: 'string',
                  hidden: ({ parent }) => parent?.linkType !== 'external',
                }),
              ],
            },
          ],
        }),
        defineField({
          name: 'copyright',
          title: 'Copyright Text',
          type: 'string',
          initialValue: '© REALVILLA 2026. ALL RIGHTS RESERVED',
        }),
        defineField({
          name: 'disclaimer',
          title: 'Disclaimer Text',
          type: 'text',
        }),
        defineField({
          name: 'socialLinks',
          title: 'Social Media Links (Footer)',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Label', type: 'string' }),
                defineField({ name: 'icon', title: 'Icon', type: 'image' }),
                defineField({
                  name: 'linkType',
                  title: 'Link Type',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Internal Page', value: 'internal' },
                      { title: 'External URL', value: 'external' },
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'external',
                }),
                defineField({
                  name: 'internalLink',
                  title: 'Internal Link',
                  type: 'reference',
                  to: [{ type: 'page' }],
                  hidden: ({ parent }) => parent?.linkType !== 'internal',
                }),
                defineField({
                  name: 'externalLink',
                  title: 'External Link',
                  type: 'string',
                  hidden: ({ parent }) => parent?.linkType !== 'external',
                }),
              ],
            },
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      language: 'language',
    },
    prepare({ language }) {
      return {
        title: `Global Settings (${language?.toUpperCase() || 'EN'})`,
      }
    },
  },
})
