import { ControlsIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

export const buyMortgageSimSection = defineType({
  name: 'buyMortgageSimSection',
  title: 'Buy Mortgage Sim Section',
  type: 'object',
  icon: ControlsIcon,
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
      initialValue: 'mortgage-simulator',
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
    // ── Section Header ──────────────────────────────────────
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

    // ── CTA ──────────────────────────────────────
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

    // ── Bottom Disclaimer ──────────────────────────────────────
    defineField({
      name: 'disclaimerText',
      title: 'Bottom Disclaimer Text',
      type: 'text',
      description: 'Disclaimer shown below the calculator.',
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
        subtitle: 'Mortgage Simulation Section',
      }
    },
  },
})
