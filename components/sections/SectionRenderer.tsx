import dynamic from 'next/dynamic'

const HeroCombined = dynamic(() => import('./HeroCombined'), { ssr: true })
const AboutSection = dynamic(() => import('./AboutSection'), { ssr: true })
const PropertiesSection = dynamic(() => import('./PropertiesSection'), { ssr: true })
const ValuationSection = dynamic(() => import('./ValuationSection'), { ssr: true })
const PartnerSection = dynamic(() => import('./PartnerSection'), { ssr: true })
const TestimonialsSection = dynamic(() => import('./TestimonialsSection'), { ssr: true })
const ContactSection = dynamic(() => import('./ContactSection'), { ssr: true })
const MortgageFAQSection = dynamic(() => import('./MortgageFAQSection'), { ssr: true })
const BuyHeroSection = dynamic(() => import('./BuyHeroSection'), { ssr: true })
const BuyPropertiesSection = dynamic(() => import('./BuyPropertiesSection'), { ssr: true })
const BuyingProcessSection = dynamic(() => import('./BuyingProcessSection'), { ssr: true })
const BuyMortgageSimSection = dynamic(() => import('./BuyMortgageSimSection'), { ssr: true })
const GeneralHeroSection = dynamic(() => import('./GeneralHeroSection'), { ssr: true })
const SellHeroSection = dynamic(() => import('./SellHeroSection'), { ssr: true })
const StatsSection = dynamic(() => import('./StatsSection'), { ssr: true })
const MortgageProcessSection = dynamic(() => import('./MortgageProcessSection'), { ssr: true })
const SellProcessSection = dynamic(() => import('./SellProcessSection'), { ssr: true })
const DocumentLedgerSection = dynamic(() => import('./DocumentLedgerSection'), { ssr: true })
const FinancingCardsSection = dynamic(() => import('./FinancingCardsSection'), { ssr: true })

const sectionMap: Record<string, any> = {
  heroSection: HeroCombined,
  aboutSection: AboutSection,
  propertiesSection: PropertiesSection,
  valuationSection: ValuationSection,
  partnerSection: PartnerSection,
  testimonialsSection: TestimonialsSection,
  contactSection: ContactSection,
  mortgageFAQSection: MortgageFAQSection,
  buyHeroSection: BuyHeroSection,
  sellHeroSection: SellHeroSection,
  buyPropertiesSection: BuyPropertiesSection,
  buyingProcessSection: BuyingProcessSection,
  buyMortgageSimSection: BuyMortgageSimSection,
  generalHeroSection: GeneralHeroSection,
  statsSection: StatsSection,
  mortgageProcessSection: MortgageProcessSection,
  sellProcessSection: SellProcessSection,
  documentLedgerSection: DocumentLedgerSection,
  financingCardsSection: FinancingCardsSection,
}

export default function SectionRenderer({ sections, dict, filterMeta, contextData }: { sections: any[], dict?: any, filterMeta?: any, contextData?: any }) {
  if (!sections) return null

  return (
    <>
      {sections.map((section, index) => {
        const Component = sectionMap[section._type]
        if (!Component) {
          console.warn(`No component found for section type: ${section._type}`)
          return null
        }
        return <Component key={section._key || index} data={section} dict={dict} filterMeta={filterMeta} contextData={contextData} />
      })}
    </>
  )
}
