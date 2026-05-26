'use client'

import { useCallback, useState, useEffect } from 'react'
import { BooleanInputProps, set, unset, useClient, useFormValue } from 'sanity'
import { Card, Stack, Text, Button, Dialog, Flex, Checkbox, Box } from '@sanity/ui'

interface FeaturedArticle {
  _id: string
  title: string
  language: string
}

export function FeaturedArticleInput(props: BooleanInputProps) {
  const { value, onChange, elementProps } = props
  const client = useClient({ apiVersion: '2024-05-02' })
  
  const currentDocId = useFormValue(['_id']) as string | undefined
  const currentLanguage = useFormValue(['language']) as string | undefined
  const currentTitle = useFormValue(['title']) as string | undefined
  
  const [isChecking, setIsChecking] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [existingFeatured, setExistingFeatured] = useState<FeaturedArticle | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cleanDocId = currentDocId?.replace(/^drafts\./, '')

  const checkExistingFeatured = useCallback(async () => {
    if (!cleanDocId || !currentLanguage) return null

    setIsChecking(true)
    setError(null)

    try {
      const query = `*[_type == "blogPost" && isFeatured == true && language == $language && _id != $currentId && !(_id in path("drafts.**"))][0] {
        _id,
        title,
        language
      }`
      
      const result = await client.fetch<FeaturedArticle | null>(query, {
        language: currentLanguage,
        currentId: cleanDocId,
      })

      return result
    } catch (err) {
      console.error('Error checking existing featured article:', err)
      setError('Failed to check existing featured article')
      return null
    } finally {
      setIsChecking(false)
    }
  }, [client, cleanDocId, currentLanguage])

  const handleToggle = useCallback(async () => {
    if (value) {
      onChange(unset())
      return
    }

    const existing = await checkExistingFeatured()
    
    if (existing) {
      setExistingFeatured(existing)
      setShowDialog(true)
    } else {
      onChange(set(true))
    }
  }, [value, onChange, checkExistingFeatured])

  const handleConfirmReplace = useCallback(async () => {
    if (!existingFeatured || !cleanDocId) return

    setIsUpdating(true)
    setError(null)

    try {
      const existingCleanId = existingFeatured._id.replace(/^drafts\./, '')
      
      await client
        .transaction()
        .patch(existingCleanId, (patch) => patch.set({ isFeatured: false }))
        .patch(`drafts.${existingCleanId}`, (patch) => patch.set({ isFeatured: false }))
        .commit({ autoGenerateArrayKeys: true })

      onChange(set(true))
      setShowDialog(false)
      setExistingFeatured(null)
    } catch (err) {
      console.error('Error replacing featured article:', err)
      setError('Failed to replace featured article. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }, [client, existingFeatured, cleanDocId, onChange])

  const handleCancelReplace = useCallback(() => {
    setShowDialog(false)
    setExistingFeatured(null)
    setError(null)
  }, [])

  return (
    <>
      <Stack space={3}>
        <Stack space={2}>
          <Text weight="semibold" size={1}>Featured Article</Text>
          <Text size={1} muted>
            Mark this article as featured. Only one article can be featured at a time.
          </Text>
        </Stack>

        <Checkbox
          {...elementProps}
          checked={value || false}
          onChange={handleToggle}
          disabled={isChecking || isUpdating}
        />

        {value && (
          <Card padding={3} radius={2} tone="positive">
            <Text size={1} weight="medium">
              ✓ This article is currently featured
            </Text>
          </Card>
        )}

        {error && (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        )}
      </Stack>

      {showDialog && existingFeatured && (
        <Dialog
          header="Replace Featured Article?"
          id="featured-article-dialog"
          onClose={handleCancelReplace}
          width={1}
        >
          <Stack space={4} padding={4}>
            <Text>
              The article <strong>"{existingFeatured.title}"</strong> is currently featured.
            </Text>
            <Text>
              Do you want to replace it with <strong>"{currentTitle || 'this article'}"</strong>?
            </Text>
            <Text size={1} muted>
              The previous featured article will be automatically unfeatured.
            </Text>

            {error && (
              <Card padding={3} radius={2} tone="critical">
                <Text size={1}>{error}</Text>
              </Card>
            )}

            <Flex gap={3} justify="flex-end">
              <Button
                text="Cancel"
                mode="ghost"
                onClick={handleCancelReplace}
                disabled={isUpdating}
              />
              <Button
                text={isUpdating ? 'Replacing...' : 'Replace'}
                tone="primary"
                onClick={handleConfirmReplace}
                disabled={isUpdating}
                loading={isUpdating}
              />
            </Flex>
          </Stack>
        </Dialog>
      )}
    </>
  )
}
