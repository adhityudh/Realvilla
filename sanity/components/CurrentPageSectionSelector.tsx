import { useCallback, useEffect, useState } from 'react'
import { StringInputProps, useFormValue, set, unset } from 'sanity'
import { Select } from '@sanity/ui'

const sectionLabels: Record<string, string> = {
  aboutSection: 'About',
  buyHeroSection: 'Buy Hero',
  sellHeroSection: 'Sell Hero',
  buyMortgageSimSection: 'Mortgage Simulator',
  buyPropertiesSection: 'Properties List',
  buyingProcessSection: 'Buying Process',
  contactSection: 'Contact',
  documentLedgerSection: 'Document Ledger',
  financingCardsSection: 'Financing Cards',
  generalHeroSection: 'General Hero',
  heroSection: 'Hero',
  mortgageFAQSection: 'Mortgage FAQ',
  generalProcessSection: 'General Process',
  partnerSection: 'Partners',
  propertiesSection: 'Properties',
  sellProcessSection: 'Sell Process',
  statsSection: 'Stats',
  testimonialsSection: 'Testimonials',
  valuationSection: 'Valuation'
};

export function CurrentPageSectionSelector(props: StringInputProps) {
  const { value, onChange, path } = props

  // Get the root document (settings) to access propertyDetailSections
  const document = useFormValue([]) as any
  const sections = document?.propertyDetailSections || []

  const [loading, setLoading] = useState(false)

  const handleChange = useCallback(
    (event: React.FormEvent<HTMLSelectElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  if (loading) {
    return (
      <Select disabled value="">
        <option value="">Loading sections...</option>
      </Select>
    )
  }

  const items = (sections || [])
    .filter((sec: any) => sec && sec._type)
    .map((sec: any) => {
      const label = sectionLabels[sec._type] || sec._type
      const idStr = sec.id ? ` (#${sec.id})` : ' (No ID)'
      const val = sec.id ? sec.id : ''
      return {
        title: `${label}${idStr}`,
        value: val
      }
    })
    .filter((item: any) => item.value !== '')

  if (items.length === 0) {
    return (
      <Select disabled value="">
        <option value="">-- No sections with IDs found in Property Page Sections --</option>
      </Select>
    )
  }

  return (
    <Select value={value || ''} onChange={handleChange}>
      <option value="">-- Select a Section --</option>
      {items.map((item: any) => (
        <option key={item.value} value={item.value}>
          {item.title}
        </option>
      ))}
    </Select>
  )
}