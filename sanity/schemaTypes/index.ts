import { type SchemaTypeDefinition } from 'sanity'

import { page } from './documents/page'
import { property } from './documents/property'
import { propertyMeta } from './documents/propertyMeta'
import { propertyMetaCategory } from './documents/propertyMetaCategory'
import { heroSection } from './modules/heroSection'
import { aboutSection } from './modules/aboutSection'
import { propertiesSection } from './modules/propertiesSection'
import { valuationSection } from './modules/valuationSection'
import { partnerSection } from './modules/partnerSection'
import { testimonialsSection } from './modules/testimonialsSection'
import { contactSection } from './modules/contactSection'
import { mortgageFAQSection } from './modules/mortgageFAQSection'
import { buyHeroSection } from './modules/buyHeroSection'
import { buyPropertiesSection } from './modules/buyPropertiesSection'
import { settings } from './documents/settings'
import { seo } from './objects/seo'
import { blockContent } from './objects/blockContent'
import { propertyLocation } from './objects/propertyLocation'
import { localizedString } from './objects/localizedString'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    page,
    property,
    propertyMeta,
    propertyMetaCategory,
    settings,
    seo,
    blockContent,
    propertyLocation,
    localizedString,
    heroSection,
    buyHeroSection,
    buyPropertiesSection,
    aboutSection,
    propertiesSection,
    valuationSection,
    partnerSection,
    testimonialsSection,
    contactSection,
    mortgageFAQSection
  ],
}
