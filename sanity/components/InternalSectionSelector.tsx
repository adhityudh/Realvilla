import { useCallback, useEffect, useState } from 'react'
import { StringInputProps, useFormValue, useClient, set, unset } from 'sanity'
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
  statsSection: 'Stats',
  testimonialsSection: 'Testimonials',
  valuationSection: 'Valuation'
};

export function InternalSectionSelector(props: StringInputProps) {
  const { value, onChange, path } = props
  const client = useClient({ apiVersion: '2024-05-02' })

  // Retrieve parent object containing link information
  const parent = useFormValue(path.slice(0, -1)) as any
  const refId = parent?.internalLink?._ref || parent?.secondaryInternalLink?._ref

  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!refId) {
      setSections([])
      return
    }

    setLoading(true)
    client
      .fetch(
        `*[_id == $id || _id == "drafts." + $id] | order(_updatedAt desc)[0]{ sections }`,
        { id: refId }
      )
      .then((res) => {
        setSections(res?.sections || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching target page sections:', err)
        setLoading(false)
      })
  }, [refId, client])

  const handleChange = useCallback(
    (event: React.FormEvent<HTMLSelectElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  if (!refId) {
    return (
      <Select disabled value="">
        <option value="">-- Choose an internal page first --</option>
      </Select>
    )
  }

  if (loading) {
    return (
      <Select disabled value="">
        <option value="">Loading sections...</option>
      </Select>
    )
  }

  const items = (sections || [])
    .filter((sec) => sec && sec._type)
    .map((sec) => {
      const label = sectionLabels[sec._type] || sec._type
      const idStr = sec.id ? ` (#${sec.id})` : ' (No ID)'
      const val = sec.id ? sec.id : ''
      return {
        title: `${label}${idStr}`,
        value: val
      }
    })
    .filter(item => item.value !== '')

  if (items.length === 0) {
    return (
      <Select disabled value="">
        <option value="">-- No sections with IDs found in target page --</option>
      </Select>
    )
  }

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
