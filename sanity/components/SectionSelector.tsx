import { useCallback } from 'react'
import { StringInputProps, useFormValue, set, unset } from 'sanity'
import { Select } from '@sanity/ui'

const sectionLabels: Record<string, string> = {
  aboutSection: 'About',
  buyHeroSection: 'Buy Hero',
  buyMortgageSimSection: 'Mortgage Simulator',
  buyPropertiesSection: 'Properties List',
  buyingProcessSection: 'Buying Process',
  contactSection: 'Contact',
  documentLedgerSection: 'Document Ledger',
  financingCardsSection: 'Financing Cards',
  generalHeroSection: 'General Hero',
  heroSection: 'Hero',
  mortgageFAQSection: 'Mortgage FAQ',
  mortgageProcessSection: 'Mortgage Process',
  partnerSection: 'Partners',
  propertiesSection: 'Properties',
  statsSection: 'Stats',
  testimonialsSection: 'Testimonials',
  valuationSection: 'Valuation'
};

export function SectionSelector(props: StringInputProps) {
  const { value, onChange } = props
  const sections = useFormValue(['sections']) as any[] | undefined

  const handleChange = useCallback(
    (event: React.FormEvent<HTMLSelectElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  const items = (sections || [])
    .filter((sec) => sec && sec._type)
    .map((sec) => {
      const label = sectionLabels[sec._type] || sec._type
      const idStr = sec.id ? ` (#${sec.id})` : ' (No ID)'
      const val = sec.id ? `#${sec.id}` : ''
      return {
        title: `${label}${idStr}`,
        value: val
      }
    })
    .filter(item => item.value !== '')

  return (
    <Select value={value || ''} onChange={handleChange}>
      <option value="">-- Select a Section --</option>
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.title}
        </option>
      ))}
    </Select>
  )
}
