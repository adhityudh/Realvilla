import { type SchemaTypeDefinition } from 'sanity'

import { page } from './documents/page'
import { property } from './documents/property'
import { blogPost } from './documents/blogPost'
import { blogCategory } from './documents/blogCategory'
import { blogAuthor } from './documents/blogAuthor'
import { propertyMeta } from './documents/propertyMeta'
import { propertyMetaCategory } from './documents/propertyMetaCategory'
import { propertyCategory } from './documents/propertyCategory'
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
import { buyingProcessSection } from './modules/buyingProcessSection'
import { buyMortgageSimSection } from './modules/buyMortgageSimSection'
import { generalHeroSection } from './modules/generalHeroSection'
import { sellHeroSection } from './modules/sellHeroSection'
import { statsSection } from './modules/statsSection'
import { generalProcessSection } from './modules/generalProcessSection'
import { sellProcessSection } from './modules/sellProcessSection'
import { documentLedgerSection } from './modules/documentLedgerSection'
import { financingCardsSection } from './modules/financingCardsSection'
import { settings } from './documents/settings'
import { seo } from './objects/seo'
import { blockContent } from './objects/blockContent'
import { propertyLocation } from './objects/propertyLocation'
import { localizedString } from './objects/localizedString'
import { mortgageCalculator } from './objects/mortgageCalculator'
import { contactModalComponent } from './modules/contactModalComponent'
import { genericModalComponent } from './modules/genericModalComponent'
import { blogSection } from './modules/blogSection'
import { generalDocumentSection } from './modules/generalDocumentSection'
import { faqsSection } from './modules/faqsSection'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    page,
    property,
    blogPost,
    blogCategory,
    blogAuthor,
    propertyMeta,
    propertyMetaCategory,
    propertyCategory,
    settings,
    seo,
    blockContent,
    propertyLocation,
    localizedString,
    mortgageCalculator,
    contactModalComponent,
    genericModalComponent,
    heroSection,
    buyHeroSection,
    sellHeroSection,
    buyPropertiesSection,
    aboutSection,
    propertiesSection,
    valuationSection,
    partnerSection,
    testimonialsSection,
    contactSection,
    mortgageFAQSection,
    buyingProcessSection,
    buyMortgageSimSection,
    generalHeroSection,
    statsSection,
    generalProcessSection,
    sellProcessSection,
    documentLedgerSection,
    financingCardsSection,
    blogSection,
    generalDocumentSection,
    faqsSection
  ],
}
