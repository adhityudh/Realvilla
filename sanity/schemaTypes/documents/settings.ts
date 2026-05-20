import { defineField, defineType } from 'sanity'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

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
    { name: 'contact', title: 'Contact Form' },
    { name: 'mortgage', title: 'Mortgage Calculator' },
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
        { type: 'sellHeroSection' },
        { type: 'generalHeroSection' },
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
        { type: 'statsSection' },
        { type: 'generalProcessSection' },
        { type: 'sellProcessSection' },
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
      name: 'propertyQuickLinks',
      title: 'Property Quick Links',
      description: 'Add editorial jumping links right beneath the property description block (e.g. BUYING PROCESS, MORTGAGE OPTIONS).',
      type: 'array',
      group: 'propertyDetail',
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
              name: 'internalSection',
              title: 'Internal Page Section',
              type: 'string',
              components: {
                input: InternalSectionSelector,
              },
              hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
            }),
            defineField({
              name: 'externalLink',
              title: 'External URL',
              type: 'string',
              hidden: ({ parent }) => parent?.linkType !== 'external',
              description: 'Enter a full URL (https://...) or relative path.',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'externalLink',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'propertyUseRequestGuidance',
      title: 'Use Request Guidance Modal',
      description: 'If enabled, the "REQUEST GUIDANCE" link will appear in the quick links and trigger the direct contact modal on click.',
      type: 'boolean',
      initialValue: true,
      group: 'propertyDetail',
    }),
    defineField({
      name: 'requestGuidancePresetMessage',
      title: 'Preset Form Message (Hidden)',
      description: 'Optional: Provide a default message. If set, this exact text will be pre-filled and the message input field will be hidden from the user. Use {{property_title}} and {{property_link}} to dynamically inject property details.',
      type: 'text',
      rows: 3,
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyUseRequestGuidance,
    }),
    defineField({
      name: 'hideRequestGuidanceWhatsApp',
      title: 'Hide WhatsApp Option (Request Guidance)',
      description: 'Check this to hide the WhatsApp option in the Request Guidance modal on Property pages.',
      type: 'boolean',
      initialValue: false,
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyUseRequestGuidance,
    }),

    defineField({
      name: 'contactPresetMessageTemplate',
      title: 'Request Guidance WhatsApp Template',
      description: 'The default text template for the WhatsApp button when requesting guidance on individual Property pages. Use {{property_title}} and {{property_link}} to dynamically inject property details.',
      type: 'text',
      rows: 2,
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyUseRequestGuidance || parent?.hideRequestGuidanceWhatsApp === true,
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
      name: 'contactRecipientEmails',
      title: 'Contact Recipient Email(s)',
      description: 'Submit notifications from contact forms will be delivered to these addresses. If empty, the system uses defaults.',
      type: 'array',
      group: 'contact',
      of: [{ 
        type: 'string',
        validation: (Rule) => Rule.email().error('Must enter a valid email formatting (e.g. name@domain.com)')
      }],
      initialValue: ['hello@realvilla.es'],
    }),

    defineField({
      name: 'contactWhatsAppNumber',
      title: 'WhatsApp Contact Number',
      description: 'The phone number for the WhatsApp CTA link (e.g. +34612345678). If empty, the WhatsApp option will not be displayed.',
      type: 'string',
      group: 'contact',
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
              name: 'internalSection',
              title: 'Internal Page Section',
              type: 'string',
              components: {
                input: InternalSectionSelector,
              },
              hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
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
              name: 'internalSection',
              title: 'Internal Page Section',
              type: 'string',
              components: {
                input: InternalSectionSelector,
              },
              hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
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
          name: 'internalSection',
          title: 'Internal Page Section',
          type: 'string',
          components: {
            input: InternalSectionSelector,
          },
          hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
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
                                  name: 'internalSection',
                                  title: 'Internal Page Section',
                                  type: 'string',
                                  components: {
                                    input: InternalSectionSelector,
                                  },
                                  hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
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
                  name: 'internalSection',
                  title: 'Internal Page Section',
                  type: 'string',
                  components: {
                    input: InternalSectionSelector,
                  },
                  hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
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
                  name: 'internalSection',
                  title: 'Internal Page Section',
                  type: 'string',
                  components: {
                    input: InternalSectionSelector,
                  },
                  hidden: ({ parent }) => parent?.linkType !== 'internal' || !parent?.internalLink,
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
    defineField({
      name: 'mortgageCalculator',
      title: 'Mortgage Calculator Settings',
      description: 'Global settings for the Mortgage Simulator. These values are shared across all pages.',
      type: 'mortgageCalculator',
      group: 'mortgage',
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
