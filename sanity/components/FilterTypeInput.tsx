import React from 'react'
import { StringInputProps, useFormValue } from 'sanity'

export function FilterTypeInput(props: StringInputProps) {
  const { schemaType, renderDefault } = props
  
  // Get the root valueType from the form state
  const valueType = useFormValue(['valueType']) as string | undefined

  // Filter the statically defined list dynamically based on current state
  const list = schemaType.options?.list
  let filteredList = Array.isArray(list) ? list : []

  filteredList = filteredList.filter((item: any) => {
    const val = typeof item === 'string' ? item : item.value

    if (valueType === 'number') {
      // Numeric fields get range and prefix range
      return val === 'rangeSlider' || val === 'prefixRange'
    }
    
    if (valueType === 'boolean') {
      // Boolean fields only get boolean toggle
      return val === 'boolean'
    }
    
    if (valueType === 'select') {
      // Select fields only get select configurations
      return val === 'select' || val === 'multiSelect'
    }

    // Default fall back to none if unrecognized, preventing misalignment
    return false
  })

  // Patch schema and render
  const patchedSchema = {
    ...schemaType,
    options: {
      ...schemaType.options,
      list: filteredList,
    },
  }

  return renderDefault({ ...props, schemaType: patchedSchema })
}
