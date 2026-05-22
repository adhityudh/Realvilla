import React from 'react'
import { StringInputProps } from 'sanity'
import { Card, Text, Box, Flex } from '@sanity/ui'
import { WarningOutlineIcon } from '@sanity/icons'

export function ValueTypeInput(props: StringInputProps) {
  const { value, renderDefault } = props

  return (
    <Box>
      {renderDefault(props)}
      {value === 'string' && (
        <Card
          marginTop={3}
          padding={3}
          radius={2}
          shadow={1}
          tone="caution"
        >
          <Flex align="center" gap={3}>
            <Text size={2}>
              <WarningOutlineIcon />
            </Text>
            <Box flex={1}>
              <Text size={1} weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Disclaimer:
              </Text>
              <Box marginTop={2}>
                <Text size={1} weight="medium">
                  Free Text (string) fields cannot be used as search filters.
                </Text>
                <Box marginTop={1}>
                  <Text size={1} style={{ display: 'block' }}>
                    If you can standardize the values into checkboxes or options, it is highly recommended to use <strong>'Yes/No' (Boolean)</strong> or <strong>'Select'</strong> instead to enable filtering.
                  </Text>
                </Box>
              </Box>
              <Box marginTop={3}>
                <Text size={1}>
                  • <strong>Better as Boolean or Select:</strong> Attributes like Views (e.g., <em>'Sea View'</em>, <em>'Teide View'</em> as Yes/No) or Water Supply (e.g., <em>'Municipal / Ayuntamiento'</em>, <em>'Private Shares'</em> as Select options).
                </Text>
                <Box marginTop={2}>
                  <Text size={1}>
                    • <strong>Good as Free Text:</strong> Unique, arbitrary descriptions that vary completely per property, such as Renovation History (e.g., <em>'Kitchen renovated in 2022, roof retiled in 2024'</em>).
                  </Text>
                </Box>
              </Box>
            </Box>
          </Flex>
        </Card>
      )}
    </Box>
  )
}
