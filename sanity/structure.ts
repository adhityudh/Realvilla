import { type StructureResolver } from 'sanity/structure'
import {
  HomeIcon,
  ProjectsIcon,
  EditIcon,
  CogIcon,
  UsersIcon,
  TagIcon,
  FolderIcon,
} from '@sanity/icons'

export const structure: StructureResolver = (S, context) => {
  return S.list()
    .title('Content')
    .items([
      // ─────────────────────────────────────
      //  PAGES
      // ─────────────────────────────────────
      S.listItem()
        .title('Pages')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.documentTypeListItem('page').title('All Pages').icon(HomeIcon),
              S.divider(),
              // Add filtered views for each language
              S.listItem()
                .title('English Pages')
                .icon(HomeIcon)
                .child(
                  S.documentList()
                    .title('English Pages')
                    .filter('_type == "page" && language == "en"')
                ),
              S.listItem()
                .title('Spanish Pages')
                .icon(HomeIcon)
                .child(
                  S.documentList()
                    .title('Spanish Pages')
                    .filter('_type == "page" && language == "es"')
                ),
            ])
        ),

      // ─────────────────────────────────────
      //  PROPERTIES
      // ─────────────────────────────────────
      S.divider(),
      S.listItem()
        .title('Properties')
        .icon(ProjectsIcon)
        .child(
          S.list()
            .title('Properties')
            .items([
              S.documentTypeListItem('property').title('All Properties').icon(ProjectsIcon),
              S.divider(),
              // Filtered views
              S.listItem()
                .title('For Sale')
                .child(
                  S.documentList()
                    .title('For Sale')
                    .filter('_type == "property" && status == "for-sale"')
                    .apiVersion('2024-05-02')
                ),
              S.listItem()
                .title('Sold')
                .child(
                  S.documentList()
                    .title('Sold')
                    .filter('_type == "property" && status == "sold"')
                    .apiVersion('2024-05-02')
                ),
              S.listItem()
                .title('Reserved')
                .child(
                  S.documentList()
                    .title('Reserved')
                    .filter('_type == "property" && status == "reserved"')
                    .apiVersion('2024-05-02')
                ),
              S.divider(),
              S.documentTypeListItem('propertyCategory').title('Categories').icon(FolderIcon),
              S.documentTypeListItem('propertyMeta').title('Meta Definitions').icon(TagIcon),
              S.documentTypeListItem('propertyMetaCategory').title('Meta Groups').icon(FolderIcon),
            ])
        ),

      // ─────────────────────────────────────
      //  BLOG
      // ─────────────────────────────────────
      S.divider(),
      S.listItem()
        .title('Blog')
        .icon(EditIcon)
        .child(
          S.list()
            .title('Blog')
            .items([
              S.documentTypeListItem('blogPost').title('All Posts').icon(EditIcon),
              S.divider(),
              // Language filters
              S.listItem()
                .title('English Posts')
                .child(
                  S.documentList()
                    .title('English Posts')
                    .filter('_type == "blogPost" && language == "en"')
                    .apiVersion('2024-05-02')
                ),
              S.listItem()
                .title('Spanish Posts')
                .child(
                  S.documentList()
                    .title('Spanish Posts')
                    .filter('_type == "blogPost" && language == "es"')
                    .apiVersion('2024-05-02')
                ),
              S.divider(),
              S.documentTypeListItem('blogCategory').title('Categories').icon(FolderIcon),
              S.documentTypeListItem('blogAuthor').title('Authors').icon(UsersIcon),
            ])
        ),

      // ─────────────────────────────────────
      //  SETTINGS
      // ─────────────────────────────────────
      S.divider(),
      S.documentTypeListItem('settings').title('Settings').icon(CogIcon),
    ])
}