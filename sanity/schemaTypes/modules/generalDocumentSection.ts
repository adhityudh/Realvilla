import { defineField, defineType } from 'sanity';

export const generalDocumentSection = defineType({
  name: 'generalDocumentSection',
  title: 'General Document Section',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'advanced', title: 'Advanced' },
  ],
  fields: [
    defineField({
      name: 'anchor',
      title: 'Anchor ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #document).',
      initialValue: 'general-document',
      group: 'advanced',
    }),
    defineField({
      name: 'disableEntranceAnimation',
      title: 'Disable Entrance Animation',
      type: 'boolean',
      description: 'If true, disables the scroll reveal animations.',
      initialValue: false,
      group: 'advanced',
    }),

    defineField({
      name: 'tocLabel',
      title: 'Table of Contents Label',
      type: 'string',
      description: 'Label for the table of contents sidebar (e.g., "Table of Contents")',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'blockContent',
      description: 'Main portable text body content. Use H2 and H3 for table of contents generation.',
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'General Document Section',
        subtitle: 'Displays a document layout with an auto-generated TOC',
      };
    },
  },
});
