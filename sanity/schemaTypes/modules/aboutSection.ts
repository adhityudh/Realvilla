import { InfoOutlineIcon } from '@sanity/icons'
import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'
import { SectionSelector } from '../../components/SectionSelector'
import { ComponentSelector } from '../../components/ComponentSelector'
import { InternalSectionSelector } from '../../components/InternalSectionSelector'

export const aboutSection = defineType({
  name: 'aboutSection',
  title: 'About Section',
  type: 'object',
  icon: InfoOutlineIcon,
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
      initialValue: 'about',
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
      name: 'profileName',
      title: 'Profile Name',
      type: 'string',
      group: 'content',
}),
    defineField({
      name: 'bgImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      group: 'content',
}),
    defineField({
      name: 'objectImage',
      title: 'Object Image (Floating)',
      type: 'image',
      options: { hotspot: true },
      group: 'content',
}),
    defineField({
      name: 'certificates',
      title: 'Certificates',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      group: 'content',
}),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
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
        subtitle: 'About Section',
      }
    },
  },
})
