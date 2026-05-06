import React, { useEffect, useState } from 'react'
import { ObjectInputProps, useClient } from 'sanity'

export function MetaValueInput(props: ObjectInputProps) {
  const { value, renderDefault } = props
  const client = useClient({ apiVersion: '2024-05-02' })
  const [valueType, setValueType] = useState<string | null>(null)

  const refId = (value as any)?.metaKey?._ref

  useEffect(() => {
    if (refId) {
      client
        .fetch(`*[_id == $id][0].valueType`, { id: refId })
        .then((res) => setValueType(res))
        .catch(console.error)
    } else {
      setValueType(null)
    }
  }, [refId, client])

  // Filter out the value fields that do not match the selected metaKey's valueType.
  const filteredMembers = props.members.filter((member) => {
    if (member.kind !== 'field') return true

    // Always show the metaKey selector
    if (member.name === 'metaKey') return true

    // If no metaKey is selected yet, hide all value inputs
    if (!valueType) return false

    // Only show the field that matches the fetched valueType
    if (member.name === 'numberValue') return valueType === 'number'
    if (member.name === 'stringValue') return valueType === 'string'
    if (member.name === 'booleanValue') return valueType === 'boolean'

    return true
  })

  // Render the default object input but with the filtered members
  return renderDefault({ ...props, members: filteredMembers })
}
