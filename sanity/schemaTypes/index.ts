import { type SchemaTypeDefinition } from 'sanity'

import { page } from './documents/page'
import { property } from './documents/property'
import { heroSection } from './modules/heroSection'
import { aboutSection } from './modules/aboutSection'
import { propertiesSection } from './modules/propertiesSection'
import { valuationSection } from './modules/valuationSection'
import { partnerSection } from './modules/partnerSection'
import { testimonialsSection } from './modules/testimonialsSection'
import { contactSection } from './modules/contactSection'
import { mortgageFAQSection } from './modules/mortgageFAQSection'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    page,
    property,
    heroSection,
    aboutSection,
    propertiesSection,
    valuationSection,
    partnerSection,
    testimonialsSection,
    contactSection,
    mortgageFAQSection
  ],
}
