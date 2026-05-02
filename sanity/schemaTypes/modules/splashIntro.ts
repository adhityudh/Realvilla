import { defineField, defineType } from 'sanity'

export const splashIntro = defineType({
  name: 'splashIntro',
  title: 'Splash Intro (Preloader)',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
    }),
  ],
})
