import { defineField, defineType } from 'sanity'

export const settings = defineType({
  name: 'settings',
  title: 'Global Settings',
  type: 'document',
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'header', title: 'Header' },
    { name: 'footer', title: 'Footer' },
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
