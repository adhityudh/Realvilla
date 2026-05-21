import { TrendUpwardIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

export const valuationSection = defineType({
  name: 'valuationSection',
  title: 'Valuation Section',
  type: 'object',
  icon: TrendUpwardIcon,
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
      initialValue: 'valuation',
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
      name: 'body',
      title: 'Body Text',
      type: 'text',
      group: 'content',
}),
    defineField({
      name: 'trustText',
      title: 'Trust Text',
      type: 'string',
      group: 'content',
}),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
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
      name: 'openInNewWindow',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'Open this link in a new browser tab/window',
      initialValue: false,
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
    defineField({
      name: 'iframeUrl',
      title: 'Iframe URL',
      type: 'url',
      group: 'content',
}),
    defineField({
      name: 'showSecondaryCta',
      title: 'Show Secondary CTA',
      type: 'boolean',
      initialValue: false,
      group: 'content',
}),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Secondary CTA Label',
      type: 'string',
      hidden: ({ parent }) => !parent?.showSecondaryCta,
      group: 'content',
}),
    defineField({
      name: 'secondaryLinkType',
      title: 'Secondary Link Type',
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
      hidden: ({ parent }) => !parent?.showSecondaryCta,
      group: 'content',
}),
    defineField({
      name: 'secondaryOpenInNewWindow',
      title: 'Secondary Open in New Tab',
      type: 'boolean',
      description: 'Open this link in a new browser tab/window',
      initialValue: false,
      hidden: ({ parent }) => !parent?.showSecondaryCta,
      group: 'content',
    }),
    defineField({
      name: 'secondaryInternalLink',
      title: 'Secondary Internal Link',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'internal',
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
      name: 'secondaryInternalSection',
      title: 'Secondary Internal Page Section',
      type: 'string',
      components: {
        input: InternalSectionSelector,
      },
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'internal' || !parent?.secondaryInternalLink,
      group: 'content',
    }),
    defineField({
      name: 'secondaryExternalLink',
      title: 'Secondary External Link',
      type: 'string',
      description: 'Can be a full URL (https://...), a relative path (/buy), or an anchor (#contact).',
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'external',
      group: 'content',
}),
    defineField({
      name: 'secondarySectionLink',
      title: 'Secondary Section Link',
      type: 'string',
      components: {
        input: SectionSelector,
      },
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'section',
      group: 'content',
}),
    defineField({
      name: 'secondaryComponentLink',
      title: 'Secondary Component Link',
      type: 'string',
      components: {
        input: ComponentSelector,
      },
      hidden: ({ parent }) => !parent?.showSecondaryCta || parent?.secondaryLinkType !== 'component',
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
        subtitle: 'Valuation Section',
      }
    },
  },
})
