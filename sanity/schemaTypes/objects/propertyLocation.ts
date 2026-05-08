import { defineField, defineType } from 'sanity'
import { TENERIFE_MUNICIPALITIES } from '../../../lib/municipalities'

/**
 * Property Location object type.
 *
 * Provides two input methods for coordinates:
 *   1. Interactive map via `geopoint` type (enhanced by @sanity/google-maps-input plugin)
 *   2. Paste a Google Maps URL to auto-extract coordinates
 *
 * Also includes structured address fields for display and filtering.
 */
export const propertyLocation = defineType({
  name: 'propertyLocation',
  title: 'Location',
  type: 'object',
  fields: [
    // ── Structured Address ──
    defineField({
      name: 'complexName',
      title: 'Complex / Building Name',
      type: 'string',
      description: 'E.g. Abama Resort, Caleta Palms, Sunset Harbour (Leave blank if individual villa)',
    }),
    defineField({
      name: 'streetAddress',
      title: 'Street Address',
      type: 'string',
      description: 'E.g. Calle Alcojora, No. 12',
    }),
    defineField({
      name: 'municipality',
      title: 'Municipality / City',
      type: 'string',
      description: 'Select the municipality in Tenerife.',
      options: {
        list: TENERIFE_MUNICIPALITIES.map((mun) => ({ title: mun, value: mun })),
        layout: 'dropdown'
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'postalCode',
      title: 'Postal Code / ZIP',
      type: 'string',
      description: 'E.g. 38679',
    }),

    // ── Map Coordinates ──
    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps URL',
      type: 'url',
      description: 'Paste a Google Maps link here. Coordinates will be extracted automatically when you save. Supports links like "https://maps.google.com/?q=28.0468,-16.5722" or shared links with @lat,lng.',
    }),
    defineField({
      name: 'lat',
      title: 'Latitude',
      type: 'number',
      description: 'E.g. 28.0468',
    }),
    defineField({
      name: 'lng',
      title: 'Longitude',
      type: 'number',
      description: 'E.g. -16.5722',
    }),
    defineField({
      name: 'coordinates',
      title: 'Map Coordinates (Visual)',
      type: 'geopoint',
      description: 'Visual map point. This can be used if you prefer the map UI.',
    }),
  ],
})
