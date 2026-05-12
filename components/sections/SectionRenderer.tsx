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
  buyPropertiesSection: BuyPropertiesSection,
  buyingProcessSection: BuyingProcessSection,
}

export default function SectionRenderer({ sections, dict, filterMeta }: { sections: any[], dict?: any, filterMeta?: any }) {
  if (!sections) return null

  return (
    <>
      {sections.map((section, index) => {
        const Component = sectionMap[section._type]
        if (!Component) {
          console.warn(`No component found for section type: ${section._type}`)
          return null
        }
        return <Component key={section._key || index} data={section} dict={dict} filterMeta={filterMeta} />
      })}
    </>
  )
}
