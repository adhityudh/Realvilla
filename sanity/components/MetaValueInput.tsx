import React, { useEffect, useState } from 'react'
import { ObjectInputProps, useClient } from 'sanity'

interface MetaConfig {
  valueType: string
  selectOptions?: any[]
  isMultiSelect?: boolean
}

export function MetaValueInput(props: ObjectInputProps) {
  const { value, renderDefault } = props
  const client = useClient({ apiVersion: '2024-05-02' })
  const [metaConfig, setMetaConfig] = useState<MetaConfig | null>(null)

  const refId = (value as any)?.metaKey?._ref

  useEffect(() => {
    if (refId) {
      client
        .fetch(`*[_id == $id][0]{ valueType, selectOptions, isMultiSelect }`, { id: refId })
        .then((res) => setMetaConfig(res || null))
        .catch(console.error)
    } else {
      setMetaConfig(null)
    }
  }, [refId, client])

  // Filter out the value fields that do not match the selected metaKey's configuration.
  const filteredMembers = props.members
    .map((member) => {
      if (member.kind !== 'field') return member

      // Always show the metaKey selector
      if (member.name === 'metaKey') return member

      // If no metaKey config is fetched yet, hide all value inputs
      if (!metaConfig) return null

      const { valueType, selectOptions = [], isMultiSelect } = metaConfig

      // Map options to compatible { title, value } if they are objects
      const safeList = (selectOptions || []).map((opt: any) => {
        if (typeof opt === 'object' && opt !== null) {
          // Localized string structure
          const en = opt.en || ''
          const es = opt.es || ''
          const label = [en, es].filter(Boolean).join(' — ')
          return { title: label || 'Untitled Option', value: en || es }
        }
        // Fallback for old flat strings during migration transition
        return { title: String(opt), value: String(opt) }
      })

      // Only show the field that matches the fetched configuration
      if (member.name === 'numberValue' && valueType === 'number') return member
      if (member.name === 'stringValue' && valueType === 'string') return member
      if (member.name === 'booleanValue' && valueType === 'boolean') return member

      // Handle Single Select
      if (member.name === 'selectValue' && valueType === 'select' && !isMultiSelect) {
        return {
          ...member,
          field: {
            ...member.field,
            schemaType: {
              ...member.field.schemaType,
              options: {
                ...(member.field.schemaType.options || {}),
                list: safeList,
              },
            },
          },
        }
      }

      // Handle Multi-Select
      if (member.name === 'selectArrayValue' && valueType === 'select' && isMultiSelect) {
        return {
          ...member,
          field: {
            ...member.field,
            schemaType: {
              ...member.field.schemaType,
              options: {
                ...(member.field.schemaType.options || {}),
                list: safeList,
              },
            },
          },
        }
      }

      // Default hide anything else
      return null
    })
    .filter(Boolean) as any

  // Render the default object input but with the filtered members
  return renderDefault({ ...props, members: filteredMembers })
}
