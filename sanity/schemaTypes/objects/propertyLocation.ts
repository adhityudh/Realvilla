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

    // ── Coordinate Input Method Switch ──
    defineField({
      name: 'coordinateMethod',
      title: 'Input Method',
      type: 'string',
      options: {
        list: [
          { title: 'Interactive Map (Visual)', value: 'visual' },
          { title: 'Google Maps URL / Manual Coordinates', value: 'url' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'visual',
      description: 'Choose how you want to provide the coordinates.',
    }),

    // ── Map Coordinates (Visible only when visual selected) ──
    defineField({
      name: 'coordinates',
      title: 'Map Coordinates (Visual Picker)',
      type: 'geopoint',
      description: 'Interactively pick the location on the map.',
      hidden: ({ parent }) => parent?.coordinateMethod === 'url',
    }),

    // ── URL & Manual (Visible only when url selected) ──
    defineField({
      name: 'lat',
      title: 'Manual Latitude',
      type: 'number',
      hidden: ({ parent }) => parent?.coordinateMethod !== 'url',
    }),
    defineField({
      name: 'lng',
      title: 'Manual Longitude',
      type: 'number',
      hidden: ({ parent }) => parent?.coordinateMethod !== 'url',
    }),
  ],
})
