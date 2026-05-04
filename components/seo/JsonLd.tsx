import React from 'react'
import Script from 'next/script'

interface JsonLdProps {
  data: any
}

const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  if (!data) return null;
  
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export default JsonLd
