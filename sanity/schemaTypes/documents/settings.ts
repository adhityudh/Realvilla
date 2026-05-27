import { defineField, defineType } from 'sanity'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'
import { CurrentPageSectionSelector } from '../../components/CurrentPageSectionSelector'

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
    { name: 'filters', title: 'Property Filters' },
    { name: 'blogSeo', title: 'Blog Page' },
    { name: 'blogDetail', title: 'Blog Detail Page' },
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
      name: 'blogPageSeo',
      title: 'Blog Page SEO',
      description: 'SEO configurations for the blog archive/listing route (/blog).',
      type: 'seo',
      group: 'blogSeo',
    }),
    defineField({
      name: 'blogPageFooterPaddingHigh',
      title: 'Footer: High Padding Mode',
      description: 'If enabled, the footer on the blog page will have larger top padding (like the homepage).',
      type: 'boolean',
      initialValue: false,
      group: 'blogSeo',
    }),
    defineField({
      name: 'blogDetailCta',
      title: 'Sidebar CTA Card',
      description: 'A promotional CTA card shown on the right side of every blog article (desktop only). Leave empty to hide.',
      type: 'object',
      group: 'blogDetail',
      fields: [
        defineField({
          name: 'headline',
          title: 'Headline',
          description: 'Main headline shown inside the CTA card. e.g. "GET AN ACCURATE PROPERTY VALUATION IN MINUTES"',
          type: 'string',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'CTA Button Label',
          description: 'Text on the button. e.g. "GET YOUR VALUATION"',
          type: 'string',
        }),
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
          name: 'openInNewWindow',
          title: 'Open in New Tab',
          type: 'boolean',
          description: 'Open this link in a new browser tab/window',
          initialValue: false,
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
          description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
          hidden: ({ parent }) => parent?.linkType !== 'external',
        }),
      ],
    }),
    defineField({
      name: 'blogDetailAbout',
      title: 'Blog Detail — About REALVILLA Card',
      description: 'About REALVILLA introduction card displayed under the article body. Leave empty to hide.',
      type: 'object',
      group: 'blogDetail',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          description: 'Title of the card. e.g. "About REALVILLA"',
        }),
        defineField({
          name: 'body',
          title: 'Body Text',
          type: 'text',
          rows: 4,
          description: 'Introduction details.',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'CTA Button Label',
          description: 'Text on the button. e.g. "Discover our services"',
          type: 'string',
        }),
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
          name: 'openInNewWindow',
          title: 'Open in New Tab',
          type: 'boolean',
          description: 'Open this link in a new browser tab/window',
          initialValue: false,
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
          description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
          hidden: ({ parent }) => parent?.linkType !== 'external',
        }),
      ],
    }),
    defineField({
      name: 'blogPageSections',
      title: 'Blog Page Sections',
      description: 'These sections will dynamically appear on the blog page (/blog) AFTER the main blog grid.',
      type: 'array',
      group: 'blogSeo',
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
        { type: 'blogSection' },
      ],
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
        { type: 'blogSection' },
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
      name: 'contactPresetMessageTemplate',
      title: 'WhatsApp Message Template',
      description: 'The default text template for the WhatsApp button on individual Property pages. Use {{property_title}} and {{property_link}} to dynamically inject property details.',
      type: 'text',
      rows: 2,
      group: 'propertyDetail',
    }),
    defineField({
      name: 'propertyContactPresetMessage',
      title: 'Contact Form Preset Message',
      description: 'The default text that will be pre-filled in the MESSAGE field of the property contact form. This helps users get started with their inquiry.',
      type: 'text',
      rows: 2,
      group: 'propertyDetail',
    }),

    // ── Make an Offer Feature ──
    defineField({
      name: 'propertyOfferEnabled',
      title: '💼 Enable "Make an Offer" Feature',
      description: 'If enabled, a "MAKE AN OFFER" button will appear on property detail pages, opening a multi-step offer form with Stripe payment.',
      type: 'boolean',
      initialValue: false,
      group: 'propertyDetail',
    }),
    defineField({
      name: 'propertyOfferDepositAmount',
      title: 'Deposit Amount (€)',
      description: 'The non-refundable deposit amount buyers must pay via Stripe to submit a proposal. This amount is charged immediately upon form submission.',
      type: 'number',
      validation: (Rule) => Rule.custom((value, context) => {
        const parent = context.parent as any;
        if (parent?.propertyOfferEnabled && !value) {
          return 'Deposit Amount is required when the Make an Offer feature is enabled.';
        }
        if (value !== undefined && value !== null && value < 1) {
          return 'Deposit Amount must be at least €1.';
        }
        return true;
      }),
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
    }),
    defineField({
      name: 'propertyOfferPdfTemplate',
      title: '📄 PDF Proposal Template',
      description: `Upload a single fillable PDF (interactive PDF / AcroForm). The system will auto-fill the form fields in any language, since the content is pulled from the offer form data.

HOW TO PREPARE YOUR PDF
────────────────────────
1. Create your proposal document in Word, Google Docs, or any editor.
2. Export/save as PDF.
3. Open the PDF in Adobe Acrobat (Tools → Prepare Form), LibreOffice (Insert → Form Controls), or an online tool like PDFescape.com or DocHub.com.
4. Add a Text Field wherever you want data to be filled automatically.
5. Name each field using the Field IDs configured in "PDF Field Name Mapping" below.
6. Save the file and upload it here.

Fields that don't exist in your PDF are simply skipped — you don't need all of them.`,
      type: 'file',
      options: {
        accept: '.pdf,application/pdf',
      },
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
    }),
    defineField({
      name: 'propertyOfferPdfFieldMap',
      title: '🗂️ PDF Field Name Mapping',
      description: 'These are the exact field names the system looks for in your PDF template. If your PDF uses different names, change them here to match — the system will fill each field with the data described. Defaults work out of the box.',
      type: 'object',
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
      options: { collapsible: true, collapsed: true },
      initialValue: {
        propertyTitle:        'property_title',
        propertyReference:    'property_reference',
        propertyCode:         'property_code',
        buyerFullName:        'buyer_full_name',
        buyerIdNumber:        'buyer_id_number',
        buyerEmail:           'buyer_email',
        buyerPhone:           'buyer_phone',
        buyerAddress:         'buyer_address',
        offerPrice:           'offer_price',
        offerPriceWords:      'offer_price_words',
        additionalConditions: 'additional_conditions',
        depositAmount:        'deposit_amount',
        stripePaymentId:      'stripe_payment_id',
        submissionDate:       'submission_date',
        validityDate:         'validity_date',
      },
      fields: [
        defineField({
          name: 'propertyTitle',
          title: 'Property Title',
          description: 'Filled with: the property name/title from Sanity.',
          type: 'string',
          initialValue: 'property_title',
          placeholder: 'property_title',
        }),
        defineField({
          name: 'propertyReference',
          title: 'Property Reference',
          description: 'Filled with: the property internal ID from Sanity.',
          type: 'string',
          initialValue: 'property_reference',
          placeholder: 'property_reference',
        }),
        defineField({
          name: 'propertyCode',
          title: 'Property Code',
          description: 'Filled with: the property code (e.g. RV0001) from Sanity.',
          type: 'string',
          initialValue: 'property_code',
          placeholder: 'property_code',
        }),
        defineField({
          name: 'buyerFullName',
          title: 'Buyer Full Name',
          description: "Filled with: buyer's full legal name (Step 2).",
          type: 'string',
          initialValue: 'buyer_full_name',
          placeholder: 'buyer_full_name',
        }),
        defineField({
          name: 'buyerIdNumber',
          title: 'Buyer ID / Passport',
          description: "Filled with: buyer's DNI / NIE / Passport number (Step 2).",
          type: 'string',
          initialValue: 'buyer_id_number',
          placeholder: 'buyer_id_number',
        }),
        defineField({
          name: 'buyerEmail',
          title: 'Buyer Email',
          description: "Filled with: buyer's email address (Step 2).",
          type: 'string',
          initialValue: 'buyer_email',
          placeholder: 'buyer_email',
        }),
        defineField({
          name: 'buyerPhone',
          title: 'Buyer Phone',
          description: "Filled with: buyer's phone number with country code (Step 2).",
          type: 'string',
          initialValue: 'buyer_phone',
          placeholder: 'buyer_phone',
        }),
        defineField({
          name: 'buyerAddress',
          title: 'Buyer Address',
          description: "Filled with: buyer's notification address / domicilio (Step 2).",
          type: 'string',
          initialValue: 'buyer_address',
          placeholder: 'buyer_address',
        }),
        defineField({
          name: 'offerPrice',
          title: 'Offer Price (formatted)',
          description: 'Filled with: offered price formatted with currency symbol (e.g. €450,000).',
          type: 'string',
          initialValue: 'offer_price',
          placeholder: 'offer_price',
        }),
        defineField({
          name: 'offerPriceWords',
          title: 'Offer Price (number only)',
          description: 'Filled with: offered price as a plain number without formatting (e.g. 450000). Useful for fields that require numeric input.',
          type: 'string',
          initialValue: 'offer_price_words',
          placeholder: 'offer_price_words',
        }),
        defineField({
          name: 'additionalConditions',
          title: 'Additional Conditions',
          description: 'Filled with: additional conditions or remarks entered by the buyer (optional, Step 3).',
          type: 'string',
          initialValue: 'additional_conditions',
          placeholder: 'additional_conditions',
        }),
        defineField({
          name: 'depositAmount',
          title: 'Deposit Amount',
          description: 'Filled with: the deposit amount paid via Stripe (e.g. €500).',
          type: 'string',
          initialValue: 'deposit_amount',
          placeholder: 'deposit_amount',
        }),
        defineField({
          name: 'stripePaymentId',
          title: 'Stripe Payment ID',
          description: 'Filled with: the Stripe checkout session ID — serves as the payment reference.',
          type: 'string',
          initialValue: 'stripe_payment_id',
          placeholder: 'stripe_payment_id',
        }),
        defineField({
          name: 'submissionDate',
          title: 'Submission Date',
          description: 'Filled with: the date the proposal was submitted (e.g. 22 May 2026).',
          type: 'string',
          initialValue: 'submission_date',
          placeholder: 'submission_date',
        }),
        defineField({
          name: 'validityDate',
          title: 'Validity Date',
          description: 'Filled with: the date until which the proposal is valid (+7 days from submission).',
          type: 'string',
          initialValue: 'validity_date',
          placeholder: 'validity_date',
        }),
      ],
    }),

    defineField({
      name: 'propertyOfferConditionsTitle',
      title: 'Offer Conditions: Title',
      description: 'Override the title for Step 1 (Conditions) in the Make an Offer modal.',
      type: 'string',
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
    }),
    defineField({
      name: 'propertyOfferConditionsIntro',
      title: 'Offer Conditions: Intro Text',
      description: 'Override the introduction text for Step 1 in the Make an Offer modal.',
      type: 'text',
      rows: 3,
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
    }),
    defineField({
      name: 'propertyOfferConditionsTerms',
      title: 'Offer Conditions: Terms & Conditions',
      description: 'Override the bullet points of terms and conditions in Step 1.',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
    }),
    defineField({
      name: 'propertyOfferConditionsAccept',
      title: 'Offer Conditions: Consent Checkbox Label',
      description: 'Override the text next to the checkbox to accept terms in Step 1.',
      type: 'string',
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
    }),
    defineField({
      name: 'propertyOfferPriceHelper',
      title: 'Offer Form: Price Helper Text',
      description: 'Override the helper text underneath the Offered Price field in Step 3.',
      type: 'string',
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
    }),
    defineField({
      name: 'propertyOfferConditionsHelper',
      title: 'Offer Form: Additional Conditions Helper Text',
      description: 'Override the helper text underneath the Additional Conditions field in Step 3.',
      type: 'text',
      rows: 4,
      group: 'propertyDetail',
      hidden: ({ parent }) => !parent?.propertyOfferEnabled,
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
              name: 'openInNewWindow',
              title: 'Open in New Tab',
              type: 'boolean',
              description: 'Open this link in a new browser tab/window',
              initialValue: false,
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
              name: 'openInNewWindow',
              title: 'Open in New Tab',
              type: 'boolean',
              description: 'Open this link in a new browser tab/window',
              initialValue: false,
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
          name: 'openInNewWindow',
          title: 'Open in New Tab',
          type: 'boolean',
          description: 'Open this link in a new browser tab/window',
          initialValue: false,
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
                  name: 'dynamicSource',
                  title: 'Dynamic Source',
                  type: 'string',
                  description: 'If set, this column\'s links will be auto-populated from the selected data source instead of the Subgroups below.',
                  options: {
                    list: [
                      { title: 'None (use Subgroups below)', value: '' },
                      { title: 'Property Categories', value: 'propertyCategories' },
                    ],
                    layout: 'radio',
                  },
                  initialValue: '',
                }),
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
                                  name: 'openInNewWindow',
                                  title: 'Open in New Tab',
                                  type: 'boolean',
                                  description: 'Open this link in a new browser tab/window',
                                  initialValue: false,
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
                  name: 'openInNewWindow',
                  title: 'Open in New Tab',
                  type: 'boolean',
                  description: 'Open this link in a new browser tab/window',
                  initialValue: false,
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
                  name: 'externalLink',
                  title: 'Link URL',
                  type: 'string',
                  description: 'External URL (e.g., https://facebook.com/yourpage). Will always open in a new tab.',
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
