import HeroCombined from './HeroCombined'
import AboutSection from './AboutSection'
import PropertiesSection from './PropertiesSection'
import ValuationSection from './ValuationSection'
import PartnerSection from './PartnerSection'
import TestimonialsSection from './TestimonialsSection'
import ContactSection from './ContactSection'
import MortgageFAQSection from './MortgageFAQSection'

const sectionMap: Record<string, any> = {
  heroSection: HeroCombined,
  aboutSection: AboutSection,
  propertiesSection: PropertiesSection,
  valuationSection: ValuationSection,
  partnerSection: PartnerSection,
  testimonialsSection: TestimonialsSection,
  contactSection: ContactSection,
  mortgageFAQSection: MortgageFAQSection,
}

export default function SectionRenderer({ sections }: { sections: any[] }) {
  if (!sections) return null

  return (
    <>
      {sections.map((section, index) => {
        const Component = sectionMap[section._type]
        if (!Component) {
          console.warn(`No component found for section type: ${section._type}`)
          return null
        }
        return <Component key={section._key || index} data={section} />
      })}
    </>
  )
}
