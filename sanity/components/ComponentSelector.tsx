import { useCallback } from 'react'
import { StringInputProps, useFormValue, set, unset } from 'sanity'
import { Select } from '@sanity/ui'

const componentLabels: Record<string, string> = {
  contactModalComponent: 'Contact Modal',
};

export function ComponentSelector(props: StringInputProps) {
  const { value, onChange } = props
  const pageComponents = useFormValue(['pageComponents']) as any[] | undefined

  const handleChange = useCallback(
    (event: React.FormEvent<HTMLSelectElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  const items = (pageComponents || [])
    .filter((comp) => comp && comp.componentId?.current)
    .map((comp) => {
      const typeLabel = componentLabels[comp._type] || comp._type
      const customLabel = comp.title ? `: ${comp.title}` : ''
      const slugVal = comp.componentId.current
      const val = `modal:${slugVal}`
      return {
        title: `${typeLabel}${customLabel} (${val})`,
        value: val
      }
    })

  return (
    <Select value={value || ''} onChange={handleChange}>
      <option value="">-- Select a Component --</option>
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.title}
        </option>
      ))}
    </Select>
  )
}
